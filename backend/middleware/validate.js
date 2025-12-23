const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Should be used after validation middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Auth validation rules
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
];

const validateInitAdmin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
];

/**
 * Training validation rules
 */
const validateCreateTraining = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Training name is required')
    .isLength({ min: 3 })
    .withMessage('Training name must be at least 3 characters'),
  body('start_date')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('end_date')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('description')
    .optional()
    .trim(),
  body('duration_days')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be positive'),
  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be positive'),
  body('instructor')
    .optional()
    .trim(),
];

const validateUpdateTraining = [
  param('id')
    .isUUID()
    .withMessage('Valid training ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Training name must be at least 3 characters'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty'),
  body('description')
    .optional()
    .trim(),
  body('duration_days')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be positive'),
  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be positive'),
  body('instructor')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['scheduled', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
];

const validateTrainingId = [
  param('id')
    .isUUID()
    .withMessage('Valid training ID is required'),
];

/**
 * Registration link validation rules
 */
const validateCreateLink = [
  body('training_id')
    .isUUID()
    .withMessage('Valid training ID is required'),
  body('max_registrations')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max registrations must be positive'),
  body('expires_at')
    .optional()
    .isISO8601()
    .withMessage('Valid expiry date is required'),
];

const validateLinkId = [
  param('id')
    .isUUID()
    .withMessage('Valid link ID is required'),
];

/**
 * Registration validation rules
 */
const validateCreateRegistration = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Registration token is required'),
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
  body('phone')
    .trim()
    .matches(/^\+?[0-9\-\s\(\)]{7,}$/)
    .withMessage('Valid phone number is required'),
  body('institution')
    .optional()
    .trim(),
  body('position')
    .optional()
    .trim(),
  body('id_number')
    .optional()
    .trim(),
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateInitAdmin,
  validateCreateTraining,
  validateUpdateTraining,
  validateTrainingId,
  validateCreateLink,
  validateLinkId,
  validateCreateRegistration,
};
