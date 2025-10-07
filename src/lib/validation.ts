import { z } from "zod";

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters"),
});

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character")
    .refine((pwd) => {
      const common = ['password', '12345678', 'qwerty', 'admin'];
      return !common.some(c => pwd.toLowerCase().includes(c));
    }, "Password is too common"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============================================
// PROFILE VALIDATION SCHEMAS
// ============================================

export const profileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  first_name: z
    .string()
    .trim()
    .max(50, "First name must be less than 50 characters")
    .optional(),
  last_name: z
    .string()
    .trim()
    .max(50, "Last name must be less than 50 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional(),
  phone_number: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number format (E.164 format required)")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
  city: z
    .string()
    .trim()
    .max(100, "City must be less than 100 characters")
    .optional(),
  country: z
    .string()
    .trim()
    .max(100, "Country must be less than 100 characters")
    .optional(),
  tz: z.string().max(100, "Timezone must be less than 100 characters").optional(),
  birth_date: z.string().optional(),
  relationship_start_date: z.string().optional(),
});

// ============================================
// MESSAGE VALIDATION SCHEMAS
// ============================================

export const messageSchema = z.object({
  body: z
    .object({
      text: z
        .string()
        .trim()
        .max(10000, "Message too long (max 10,000 characters)")
        .transform(sanitizeInput)
        .optional(),
      replyTo: z.string().uuid().optional(),
    })
    .optional(),
  type: z.enum(["text", "image", "voice", "video"]),
  media_url: z
    .string()
    .trim()
    .url("Invalid media URL")
    .max(2000, "URL must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
});

// ============================================
// GOAL & TASK VALIDATION SCHEMAS
// ============================================

export const goalSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  target_date: z.string().optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
});

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  status_column: z.enum(["todo", "doing", "done"]).optional(),
  due_at: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

// ============================================
// EVENT VALIDATION SCHEMAS
// ============================================

export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  kind: z.enum(["date", "reminder", "reunion"]),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  all_day: z.boolean().optional(),
  meta: z
    .object({
      description: z
        .string()
        .trim()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
      location: z
        .string()
        .trim()
        .max(200, "Location must be less than 200 characters")
        .optional(),
      reminder_minutes: z.number().min(0).max(43200).optional(), // Max 30 days
    })
    .optional(),
});

// ============================================
// MOOD LOG VALIDATION SCHEMAS
// ============================================

export const moodLogSchema = z.object({
  emoji: z
    .string()
    .trim()
    .min(1, "Mood emoji is required")
    .max(10, "Invalid emoji format"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  date: z.string().optional(),
  shared_with_partner: z.boolean().optional(),
});

// ============================================
// PAIR INVITE VALIDATION SCHEMAS
// ============================================

export const pairInviteCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Invite code must be exactly 6 characters")
    .regex(/^[A-Z0-9]+$/, "Invalid invite code format"),
});

// ============================================
// SANITIZATION UTILITIES
// ============================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  // Remove all HTML tags
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize user input for safe display
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .slice(0, 10000); // Limit length
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type MoodLogInput = z.infer<typeof moodLogSchema>;
export type PairInviteCodeInput = z.infer<typeof pairInviteCodeSchema>;
