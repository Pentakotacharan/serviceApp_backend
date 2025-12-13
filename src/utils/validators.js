// src/utils/validators.js
const { body, param, check, validationResult } = require('express-validator');

/**
 * Helper middleware to return validation errors in a consistent format
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const extracted = errors.array().map(err => ({
    field: err.param,
    message: err.msg
  }));
  return res.status(422).json({
    message: 'Validation failed',
    errors: extracted
  });
};

/**
 * Common validators
 */
const isValidAadhaar = (value) => {
  if (!/^\d{12}$/.test(value)) {
    throw new Error('Aadhaar must be exactly 12 digits');
  }
  return true;
};

const isValidPan = (value) => {
  // PAN format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
    throw new Error('PAN must be in valid format (e.g., ABCDE1234F)');
  }
  return true;
};

const isValidDOB = (value) => {
  // Expecting YYYY-MM-DD or DD-MM-YYYY - normalize accepted pattern
  // We'll accept ISO date string and ensure it's a past date
  const d = new Date(value);
  if (isNaN(d.getTime())) throw new Error('Date of birth must be a valid date');
  const now = new Date();
  if (d >= now) throw new Error('Date of birth must be in the past');
  return true;
};

const isValidCoords = (lng, lat) => {
  const lngNum = parseFloat(lng);
  const latNum = parseFloat(lat);
  if (isNaN(lngNum) || isNaN(latNum)) return false;
  if (lngNum < -180 || lngNum > 180) return false;
  if (latNum < -90 || latNum > 90) return false;
  return true;
};

/**
 * Request validators exported for routes
 */
const registerValidator = [
  body('name').optional().isString().trim().isLength({ min: 2 }).withMessage('Name should be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['client', 'provider', 'admin']).withMessage('Invalid role'),
  handleValidationErrors
];

const loginValidator = [
  body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const kycValidator = [
  // Fields can be sent via multipart/form-data
  body('name').optional().isString().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('aadhaarNumber').exists().withMessage('Aadhaar number is required').bail().custom(isValidAadhaar),
  body('panNumber').exists().withMessage('PAN number is required').bail().custom(isValidPan),
  body('dob').optional().custom(isValidDOB),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('skill').optional().isString().trim().isLength({ min: 2 }).withMessage('Skill should be at least 2 characters'),
  body('lat').optional().custom((v, { req }) => {
    const lng = req.body.lng;
    if ((v && !lng) || (!v && lng)) throw new Error('Both lat and lng must be provided together');
    if (v && lng && !isValidCoords(lng, v)) throw new Error('Invalid coordinates');
    return true;
  }),
  handleValidationErrors
];

const createTaskValidator = [
  body('amount').exists().withMessage('Amount is required').bail()
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('category').optional().isString().trim().isLength({ min: 2 }).withMessage('Category is too short'),
  body('description').optional().isString().trim().isLength({ min: 5 }).withMessage('Description is too short'),
  body('lat').exists().withMessage('lat is required'),
  body('lng').exists().withMessage('lng is required'),
  body().custom(body => {
    if (!isValidCoords(body.lng, body.lat)) throw new Error('Invalid lat/lng coordinates');
    return true;
  }),
  handleValidationErrors
];

const requestTaskValidator = [
  param('taskId').isMongoId().withMessage('Invalid taskId'),
  handleValidationErrors
];

const acceptRequestValidator = [
  body('taskId').exists().isMongoId().withMessage('taskId is required and must be a valid id'),
  body('providerId').exists().isMongoId().withMessage('providerId is required and must be a valid id'),
  handleValidationErrors
];

const paymentWebhookValidator = [
  body('razorpay_order_id').exists().withMessage('razorpay_order_id is required'),
  body('razorpay_payment_id').optional(),
  handleValidationErrors
];

const releasePaymentValidator = [
  body('taskId').exists().isMongoId().withMessage('taskId is required'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidator,
  loginValidator,
  kycValidator,
  createTaskValidator,
  requestTaskValidator,
  acceptRequestValidator,
  paymentWebhookValidator,
  releasePaymentValidator
};
