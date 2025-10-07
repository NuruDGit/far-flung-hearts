/**
 * Server-side rate limiter for edge functions
 * 
 * Tracks rate limits using Supabase database for persistent tracking
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

/**
 * Check and enforce rate limits for a user/endpoint combination
 */
export async function checkRateLimit(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMinutes * 60 * 1000);

  try {
    // Get or create rate limit entry
    const { data: existing, error: selectError } = await supabaseClient
      .from("rate_limit_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("endpoint", endpoint)
      .gte("window_start", windowStart.toISOString())
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - which is fine
      throw selectError;
    }

    if (existing) {
      // Check if limit exceeded
      if (existing.request_count >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(
            new Date(existing.window_start).getTime() + config.windowMinutes * 60 * 1000
          ),
        };
      }

      // Increment counter
      const { error: updateError } = await supabaseClient
        .from("rate_limit_tracking")
        .update({
          request_count: existing.request_count + 1,
          last_request_at: now.toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      return {
        allowed: true,
        remaining: config.maxRequests - existing.request_count - 1,
        resetTime: new Date(
          new Date(existing.window_start).getTime() + config.windowMinutes * 60 * 1000
        ),
      };
    }

    // Create new entry
    const { error: insertError } = await supabaseClient
      .from("rate_limit_tracking")
      .insert({
        user_id: userId,
        endpoint: endpoint,
        request_count: 1,
        window_start: now.toISOString(),
        last_request_at: now.toISOString(),
      });

    if (insertError) throw insertError;

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: new Date(now.getTime() + config.windowMinutes * 60 * 1000),
    };
  } catch (error) {
    console.error("[Rate Limiter] Error checking rate limit:", error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: new Date(now.getTime() + config.windowMinutes * 60 * 1000),
    };
  }
}

/**
 * Log security event to audit log
 */
export async function logSecurityEvent(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string | null,
  eventType: string,
  eventData: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await supabaseClient.from("security_audit_log").insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error("[Security Log] Failed to log event:", error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

// Common rate limit configurations
export const RATE_LIMITS = {
  // Standard API calls: 100 per minute
  API_CALL: {
    maxRequests: 100,
    windowMinutes: 1,
  },
  // Auth operations: 5 per minute
  AUTH_OPERATION: {
    maxRequests: 5,
    windowMinutes: 1,
  },
  // AI operations: 20 per minute
  AI_OPERATION: {
    maxRequests: 20,
    windowMinutes: 1,
  },
  // File operations: 30 per hour
  FILE_OPERATION: {
    maxRequests: 30,
    windowMinutes: 60,
  },
  // Sensitive operations: 10 per hour
  SENSITIVE_OPERATION: {
    maxRequests: 10,
    windowMinutes: 60,
  },
  // Pair invite creation: 3 per hour
  PAIR_INVITE_CREATE: {
    maxRequests: 3,
    windowMinutes: 60,
  },
  // Gift wishlist creation: 20 per hour
  GIFT_WISHLIST_CREATE: {
    maxRequests: 20,
    windowMinutes: 60,
  },
  // Mood log creation: 10 per hour
  MOOD_LOG_CREATE: {
    maxRequests: 10,
    windowMinutes: 60,
  },
  // Message sending: 100 per minute
  MESSAGE_SEND: {
    maxRequests: 100,
    windowMinutes: 1,
  },
  // Video call start: 10 per hour
  VIDEO_CALL_START: {
    maxRequests: 10,
    windowMinutes: 60,
  },
} as const;
