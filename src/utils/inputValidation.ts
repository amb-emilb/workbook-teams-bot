/**
 * Input validation and sanitization utilities for security
 * Prevents injection attacks and validates user input
 */

import { ToolParameters } from '../types/workbook.types.js';

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove control characters and null bytes
  // eslint-disable-next-line no-control-regex
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
  // Limit length to prevent resource exhaustion
  const MAX_INPUT_LENGTH = 2000;
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
  }

  // Remove potentially dangerous patterns
  sanitized = sanitized
  // Remove script tags and javascript: protocol
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
  // Remove SQL injection patterns
    .replace(/(\b(DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/gi, '')
  // Remove command injection patterns
    .replace(/[;&|`$]/g, '')
  // Remove path traversal patterns
    .replace(/\.\.\//g, '')
    .replace(/\.\\/g, '');

  return sanitized.trim();
}

/**
 * Validates and sanitizes tool parameters
 */
export function validateToolParameters(params: ToolParameters): ToolParameters {
  const validated: ToolParameters = {};

  for (const [key, value] of Object.entries(params)) {
    // Sanitize string values
    if (typeof value === 'string') {
      validated[key] = sanitizeInput(value);
    }
    // Validate numbers
    else if (typeof value === 'number') {
      if (!isNaN(value) && isFinite(value)) {
        validated[key] = value;
      }
    }
    // Validate booleans
    else if (typeof value === 'boolean') {
      validated[key] = value;
    }
    // Validate arrays
    else if (Array.isArray(value)) {
      validated[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      ) as string[] | number[] | boolean[];
    }
    // Validate objects recursively
    else if (value && typeof value === 'object') {
      validated[key] = validateToolParameters(value);
    }
  }

  return validated;
}

/**
 * Detects potential prompt injection attempts
 */
export function detectPromptInjection(input: string): boolean {
  const injectionPatterns = [
    // Direct instruction overrides
    /ignore\s+(all\s+)?previous\s+instructions?/i,
    /disregard\s+(all\s+)?instructions?/i,
    /forget\s+everything/i,
    /new\s+instructions?:/i,
    /you\s+are\s+now/i,
    /pretend\s+to\s+be/i,
    /act\s+as\s+if/i,
    // System prompt extraction attempts
    /show\s+me\s+your\s+(system\s+)?prompt/i,
    /what\s+are\s+your\s+instructions?/i,
    /repeat\s+your\s+instructions?/i,
    /print\s+your\s+prompt/i,
    // Role manipulation
    /you\s+must\s+now/i,
    /from\s+now\s+on/i,
    /switch\s+to\s+[a-z]+\s+mode/i,
    // Data exfiltration attempts
    /list\s+all\s+(api\s+)?keys?/i,
    /show\s+me\s+all\s+secrets?/i,
    /reveal\s+credentials?/i,
    /export\s+all\s+data/i
  ];

  const normalizedInput = input.toLowerCase();
  return injectionPatterns.some(pattern => pattern.test(normalizedInput));
}

/**
 * Validates search queries for safety
 */
export function validateSearchQuery(query: string): { valid: boolean; sanitized: string; error?: string } {
  // Basic validation
  if (!query || typeof query !== 'string') {
    return { valid: false, sanitized: '', error: 'Query must be a non-empty string' };
  }

  // Check for prompt injection
  if (detectPromptInjection(query)) {
    return { valid: false, sanitized: '', error: 'Invalid query pattern detected' };
  }

  // Sanitize the query
  const sanitized = sanitizeInput(query);

  // Check minimum length
  if (sanitized.length < 2) {
    return { valid: false, sanitized: '', error: 'Query too short (minimum 2 characters)' };
  }

  return { valid: true, sanitized };
}

/**
 * Rate limiting check (should be used with a cache/storage)
 */
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export function checkRateLimit(_userId: string, _limits: { maxRequests: number; windowMs: number }): boolean {
  // This is a placeholder - in production, implement with Redis or similar
  // For now, always return true (no rate limiting)
  return true;
}

/**
 * Escape output for safe display
 */
export function escapeForDisplay(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}