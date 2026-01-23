const Task = require('../models/Task');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { createOrder } = require('../services/razorpayService');
const { findProvidersNearby } = require('../services/geoService');
const { sendToToken } = require('../services/fcmService');

const createTaskOrder = async (req, res) => {
  try {
    const { amount, category, description, lat, lng, images } = req.body;
    if (!amount || !lat || !lng) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const order = await createOrder({
      amount: Math.round(Number(amount) * 100),
      receipt: `rcpt_${Date.now()}`
    });

    const task = await Task.create({
      clientId: req.user._id,
      category,
      description,
      images: images || [],
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      amount,
      status: "pending",
      razorpayOrderId: order.id,
    });

    await Payment.create({
      taskId: task._id,
      clientId: req.user._id,
      amount,
      status: "held",
      razorpayOrderId: order.id,
    });

    // 🔔 FIND NEARBY ONLINE PROVIDERS (2 KM)
    const providers = await User.find({
      role: "provider",
      kycStatus: "approved",
      isOnline: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 2000, // 2 KM
        },
      },
    });

    // 🔔 SEND FCM NOTIFICATIONS
    for (const provider of providers) {
      if (provider.fcmToken) {
        await sendToToken(provider.fcmToken, {
          title: "New Task Nearby",
          body: `${category} task near you. Tap to view.`,
          data: {
            taskId: task._id.toString(),
          },
        });
      }
    }

    res.json({ order, task, notified: providers.length });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Task creation failed" });
  }
};

// 2. Webhook / payment verification (simplified)
// After successful payment capture, mark task as active and notify nearby providers
const handlePaymentSuccess = async (req, res) => {
  // Payment verification is recommended using webhook signature verification
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;
    if (!razorpay_order_id) return res.status(400).end();

    // Find payment & task
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = 'held';
    await payment.save();

    const task = await Task.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: 'pending' }, { new: true });

    // Notify providers within 2km
    const [lng, lat] = task.location.coordinates;
    const providers = await findProvidersNearby(lng, lat, 2000);

    for (const prov of providers) {
      if (prov.fcmToken) {
        await sendToToken(prov.fcmToken, {
          title: 'New Task Nearby',
          body: `${task.category} - ${task.description}`,
          data: { taskId: task._id.toString() }
        });
      }
    }

    res.json({ message: 'Payment recorded and providers notified', notifiedCount: providers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Webhook handling failed' });
  }
};

// Provider requests a task
const requestTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Add request entry
    task.requests.push({ userId: req.user._id });
    await task.save();

    // Notify client
    const client = await User.findById(task.clientId);
    if (client && client.fcmToken) {
      await sendToToken(client.fcmToken, {
        title: 'New Request',
        body: `${req.user.name} requested your task`,
        data: { taskId: task._id.toString(), providerId: req.user._id.toString() }
      });
    }

    // Respond with provider metrics (so client can view)
    const providerInfo = {
      name: req.user.name,
      skill: req.user.skill,
      rating: req.user.rating,
      totalTasksCompleted: req.user.totalTasksCompleted,
      totalTasksAccepted: req.user.totalTasksAccepted,
      totalTasksPending: req.user.totalTasksPending
    };

    res.json({ message: 'Request sent to client', providerInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Request failed' });
  }
};

// Client accepts a provider request
const acceptRequest = async (req, res) => {
  try {
    const { taskId, providerId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Find the request and mark accepted, reject others
    task.requests = task.requests.map(r => {
      if (r.userId.toString() === providerId) r.status = 'accepted';
      else if (r.status === 'pending') r.status = 'rejected';
      return r;
    });

    task.assignedTo = providerId;
    task.status = 'assigned';
    await task.save();

    // Update provider metrics
    const provider = await User.findById(providerId);
    provider.totalTasksAccepted += 1;
    provider.totalTasksPending += 1;
    await provider.save();

    // Notify provider
    if (provider.fcmToken) {
      await sendToToken(provider.fcmToken, {
        title: 'Request Accepted',
        body: `Your request for ${task.category} was accepted`,
        data: { taskId: task._id.toString() }
      });
    }

    res.json({ message: 'Provider accepted and assigned' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Accept failed' });
  }
};

// Provider marks task complete
const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not assigned to you' });
    }

    task.status = 'completed';
    await task.save();

    // Update provider metrics
    const provider = await User.findById(req.user._id);
    provider.totalTasksPending = Math.max(0, provider.totalTasksPending - 1);
    provider.totalTasksCompleted += 1;
    await provider.save();

    // Payment release will be processed after 24 hours by cron or job (simplified: immediate here for demonstration)
    // For safety, set a scheduled job (e.g., using Bull or node-cron) to release after 24h
    res.json({ message: 'Task marked completed. Payment will be released after 24 hours.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Complete failed' });
  }
};

module.exports = {
  createTaskOrder,
  handlePaymentSuccess,
  requestTask,
  acceptRequest,
  completeTask
};
