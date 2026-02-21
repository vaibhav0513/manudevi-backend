const Joi = require('joi');

/**
 * Validate request body against schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

/**
 * User Registration Schema
 */
const registerSchema = Joi.object({
  first_name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
    }),
  middle_name: Joi.string()
    .trim()
    .max(50)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Middle name cannot exceed 50 characters',
    }),
  last_name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
    }),
  mobile_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be 10 digits',
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
  address: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 10 characters',
      'string.max': 'Address cannot exceed 500 characters',
    }),
  terms_accepted: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'You must accept the terms and conditions',
      'any.required': 'Terms acceptance is required',
    }),
});

/**
 * Send OTP Schema
 */
const sendOtpSchema = Joi.object({
  mobile_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be 10 digits',
    }),
});

/**
 * Verify OTP Schema
 */
const verifyOtpSchema = Joi.object({
  mobile_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be 10 digits',
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
    }),
});

/**
 * Update User Schema
 */
const updateUserSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(50).optional(),
  middle_name: Joi.string().trim().max(50).allow('').optional(),
  last_name: Joi.string().trim().min(2).max(50).optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  address: Joi.string().trim().min(10).max(500).optional(),
  profileImage: Joi.string().uri().optional(),
});

/**
 * Update User Role Schema (Admin only)
 */
const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid('user', 'admin', 'super_admin')
    .required()
    .messages({
      'any.only': 'Role must be one of: user, admin, super_admin',
    }),
});

module.exports = {
  validate,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
  updateUserSchema,
  updateRoleSchema,
};