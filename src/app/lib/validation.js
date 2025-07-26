import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Custom email validation regex (more permissive than strict RFC 5322)
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Custom sanitization transform
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  // Remove potentially dangerous HTML/script content
  return DOMPurify.sanitize(value, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    STRIP_COMMENTS: true,
    STRIP_CDATA: true
  }).trim();
};

// Review validation schema
export const reviewSchema = z.object({
  product_id: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) throw new Error('Invalid product_id');
      return num;
    })
    .refine((val) => val > 0, { message: 'Product ID must be positive' }),
  
  review: z
    .string()
    .min(10, 'Review must be at least 10 characters long')
    .max(2000, 'Review must not exceed 2000 characters')
    .transform(sanitizeString)
    .refine((val) => val.length >= 10, { message: 'Review content too short after sanitization' }),
  
  reviewer: z
    .string()
    .min(2, 'Reviewer name must be at least 2 characters')
    .max(100, 'Reviewer name must not exceed 100 characters')
    .transform(sanitizeString)
    .refine((val) => val.length >= 2, { message: 'Reviewer name too short after sanitization' })
    .refine((val) => /^[a-zA-Z\s\-'.]+$/.test(val), { message: 'Reviewer name contains invalid characters' }),
  
  reviewer_email: z
    .string()
    .max(254, 'Email address too long')
    .toLowerCase()
    .transform(sanitizeString)
    .refine((val) => emailRegex.test(val), { message: 'Invalid email format' }),
  
  rating: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) throw new Error('Invalid rating');
      return num;
    })
    .refine((val) => val >= 1 && val <= 5, { message: 'Rating must be between 1 and 5' })
    .refine((val) => Number.isInteger(val) || val % 0.5 === 0, { message: 'Rating must be whole number or half increment' })
});

// Contact form validation schema
export const contactSchema = z.object({
  formId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) throw new Error('Invalid form ID');
      return num;
    })
    .refine((val) => val > 0, { message: 'Form ID must be positive' }),
  
  submissionData: z
    .record(z.string(), z.unknown())
    .transform((data) => {
      const sanitizedData = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Sanitize field keys
        const sanitizedKey = sanitizeString(key);
        if (!sanitizedKey || sanitizedKey.length === 0) continue;
        
        // Validate and sanitize field values
        if (typeof value === 'string') {
          const sanitizedValue = sanitizeString(value);
          if (sanitizedValue.length <= 5000) { // Max field length
            sanitizedData[sanitizedKey] = sanitizedValue;
          }
        } else if (typeof value === 'number' && isFinite(value)) {
          sanitizedData[sanitizedKey] = value;
        } else if (typeof value === 'boolean') {
          sanitizedData[sanitizedKey] = value;
        } else if (Array.isArray(value)) {
          // Handle arrays (like checkbox selections)
          const sanitizedArray = value
            .filter(item => typeof item === 'string')
            .map(item => sanitizeString(item))
            .filter(item => item.length > 0 && item.length <= 1000);
          if (sanitizedArray.length > 0) {
            sanitizedData[sanitizedKey] = sanitizedArray;
          }
        }
      }
      
      return sanitizedData;
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'Submission data cannot be empty' })
    .refine((data) => Object.keys(data).length <= 50, { message: 'Too many form fields' })
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip: z.string().min(1).max(45).optional(), // IPv4 max 15 chars, IPv6 max 45 chars
  userAgent: z.string().max(500).optional(),
  timestamp: z.number().int().positive().optional()
});

// Validation helper function
export function validateInput(schema, data) {
  try {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      return {
        success: false,
        errors,
        data: null
      };
    }
    
    return {
      success: true,
      errors: null,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ field: 'general', message: 'Validation failed', code: 'validation_error' }],
      data: null
    };
  }
}

// Security headers helper
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'",
  };
}

// Request size validation
export function validateRequestSize(contentLength, maxSize = 1024 * 1024) { // 1MB default
  if (contentLength && contentLength > maxSize) {
    return false;
  }
  return true;
}