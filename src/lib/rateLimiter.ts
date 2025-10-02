/**
 * Client-side rate limiter helper
 * 
 * This provides basic client-side rate limiting to prevent excessive requests.
 * Server-side rate limiting is implemented in edge functions.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if a request is allowed under rate limit
   * @param key - Unique identifier for the rate limit (e.g., "api:send-message")
   * @param config - Rate limit configuration
   * @returns true if request is allowed, false if rate limited
   */
  checkLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    // No existing entry or expired - allow and create new entry
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Check if under limit
    if (entry.count < config.maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get remaining requests in current window
   */
  getRemaining(key: string, maxRequests: number): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get time until rate limit resets (in seconds)
   */
  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }
    return Math.ceil((entry.resetTime - Date.now()) / 1000);
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.limits.clear();
  }

  /**
   * Clear specific rate limit entry
   */
  clearKey(key: string): void {
    this.limits.delete(key);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Common rate limit configurations
export const RATE_LIMITS = {
  // Message sending: 30 messages per minute
  MESSAGE_SEND: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },
  // API calls: 100 per minute
  API_CALL: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
  // Auth attempts: 5 per minute
  AUTH_ATTEMPT: {
    maxRequests: 5,
    windowMs: 60 * 1000,
  },
  // Profile updates: 10 per minute
  PROFILE_UPDATE: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
  // File uploads: 10 per minute
  FILE_UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
  // AI requests: 20 per minute
  AI_REQUEST: {
    maxRequests: 20,
    windowMs: 60 * 1000,
  },
} as const;

/**
 * Helper function to handle rate limit errors
 */
export function handleRateLimit(resetTime: number): Error {
  return new Error(
    `Rate limit exceeded. Please try again in ${resetTime} seconds.`
  );
}
