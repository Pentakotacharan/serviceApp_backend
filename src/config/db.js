const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect('mongodb+srv://plsprakash2003:Surya_2003@cluster0.bpe9m.mongodb.net/Service_app?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = { connectDB };
