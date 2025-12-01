import validator from 'validator';
import { validationResult } from 'express-validator';

/**
 * Express validator middleware
 * Validates request based on validation chain
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

/**
 * Validates if the URL is properly formatted in query params
 */
export const validateUrl = (req, res, next) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({
      status: 'error',
      message: 'URL parameter is required'
    });
  }
  
  // Check if it's a valid URL
  if (!validator.isURL(url, { 
    protocols: ['http', 'https'], 
    require_protocol: true,
    require_valid_protocol: true
  })) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid URL format. URL must start with http:// or https://'
    });
  }
  
  // If validation passes, continue to next middleware
  next();
};

/**
 * Validates if the URL param is properly formatted
 */
export const validateUrlParam = (req, res, next) => {
  const { url } = req.params;
  
  if (!url) {
    return res.status(400).json({
      status: 'error',
      message: 'URL parameter is required'
    });
  }
  
  // Decode the URL parameter
  const decodedUrl = decodeURIComponent(url);
  
  // Check if it's a valid URL
  if (!validator.isURL(decodedUrl, { 
    protocols: ['http', 'https'], 
    require_protocol: true,
    require_valid_protocol: true
  })) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid URL format. URL must start with http:// or https://'
    });
  }
  
  // If validation passes, continue to next middleware
  next();
};