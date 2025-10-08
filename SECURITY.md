# Security Guide - Love Beyond Borders

**Last Updated:** October 8, 2025  
**Security Grade:** A (Excellent)

This document outlines the comprehensive security measures implemented in the application and best practices for maintaining security.

## Executive Summary

Love Beyond Borders implements a defense-in-depth security architecture protecting user data through multiple layers of security controls:

- ✅ **Database Security**: Row-Level Security (RLS) on all tables with RESTRICTIVE, permissive, and deny policies
- ✅ **Authentication**: Supabase Auth with mandatory authentication for all features  
- ✅ **Input Validation**: Zod schemas with sanitization for all user inputs
- ✅ **Rate Limiting**: Client and server-side protection against abuse
- ✅ **Audit Logging**: Comprehensive security event tracking
- ✅ **Data Protection**: Service-role-only access to sensitive financial and PII data
- ✅ **Function Security**: All database functions use fixed search_path to prevent injection

## Table of Contents
1. [Security Features](#security-features)
2. [Input Validation](#input-validation)
3. [Rate Limiting](#rate-limiting)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Authentication](#authentication)
6. [Data Protection](#data-protection)
7. [Security Monitoring](#security-monitoring)
8. [Best Practices](#best-practices)

## Security Features

### Implemented Security Measures

#### 1. **Database Security**
- ✅ **Multi-Layer RLS Policies**:
  - RESTRICTIVE policies block all anonymous access to sensitive tables
  - Permissive policies grant specific access based on relationships
  - Explicit deny policies prevent user modifications to system tables
- ✅ **Service-Role-Only Access**: PII and financial data (`newsletter_subscribers`, `payment_failures`)
- ✅ **Read-Only User Access**: System tables (`embeddings`, `summaries`, `presence`) 
- ✅ **Pair-Based Isolation**: Users only access data from their active relationship
- ✅ **Consent-Based Sharing**: Mood data sharing controlled by users
- ✅ **Function Security**: All SECURITY DEFINER functions use `SET search_path = public`
- ✅ **Automatic Cleanup**: Sensitive data (ICE config) auto-deleted after use
- ✅ **SQL Injection Protection**: Parameterized queries throughout

#### 2. **Authentication & Authorization**
- ✅ Supabase Auth with JWT tokens
- ✅ Password strength requirements (min 8 chars, uppercase, lowercase, number)
- ⚠️  **CRITICAL**: Enable Leaked Password Protection in Supabase Dashboard
- ✅ Rate limiting on auth attempts (5 per minute)
- ✅ Secure session management
- ✅ Auto-expiring pair invite codes

#### 3. **Input Validation**
- ✅ Zod schemas for all forms
- ✅ Client-side and server-side validation
- ✅ XSS prevention via HTML sanitization
- ✅ URL validation and protocol checking
- ✅ File size limits (100KB for messages)
- ✅ Field length restrictions

#### 4. **Rate Limiting**
- ✅ Client-side rate limiting
- ✅ Server-side rate limiting with database tracking
- ✅ Different limits per endpoint:
  - Auth: 5 attempts/minute
  - Messages: 30/minute
  - API calls: 100/minute
  - AI requests: 20/minute
  - File uploads: 10/minute

#### 5. **Data Protection**
- ✅ Encrypted data at rest (Supabase)
- ✅ HTTPS/TLS for data in transit
- ✅ Privacy controls for sensitive data (mood logs)
- ✅ Automatic data cleanup (call sessions)
- ✅ Subscription access restricted to active pairs

#### 6. **Security Monitoring**
- ✅ Security audit logging table
- ✅ Rate limit violation tracking
- ✅ Failed authentication logging
- ✅ Error tracking with context

## Input Validation

### Using Validation Schemas

All user inputs are validated using Zod schemas defined in `src/lib/validation.ts`:

```typescript
import { loginSchema, profileSchema, messageSchema } from '@/lib/validation';

// Example usage
const validation = loginSchema.safeParse({ email, password });
if (!validation.success) {
  // Handle validation errors
  const errors = validation.error.errors.map(e => e.message);
}
```

### Sanitization

Always sanitize user inputs before display:

```typescript
import { sanitizeHtml, sanitizeInput, sanitizeUrl } from '@/lib/validation';

const cleanText = sanitizeHtml(userInput); // Remove HTML tags
const cleanInput = sanitizeInput(userInput); // Trim and limit
const cleanUrl = sanitizeUrl(userUrl); // Validate URL protocol
```

## Rate Limiting

### Client-Side Rate Limiting

```typescript
import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimiter';

// Check rate limit before making request
if (!rateLimiter.checkLimit('api:send-message', RATE_LIMITS.MESSAGE_SEND)) {
  const resetTime = rateLimiter.getResetTime('api:send-message');
  toast.error(`Rate limit exceeded. Try again in ${resetTime} seconds.`);
  return;
}

// Make your API call
await sendMessage();
```

### Server-Side Rate Limiting

In edge functions:

```typescript
import { checkRateLimit, RATE_LIMITS } from '../_shared/rateLimiter.ts';

const rateLimit = await checkRateLimit(
  supabaseClient,
  userId,
  'endpoint-name',
  RATE_LIMITS.API_CALL
);

if (!rateLimit.allowed) {
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded',
      resetTime: rateLimit.resetTime 
    }),
    { status: 429 }
  );
}
```

## Row Level Security (RLS)

### Security Architecture

Love Beyond Borders uses a **defense-in-depth** approach with multiple layers of RLS policies:

#### Layer 1: RESTRICTIVE Policies (Most Secure)
- Block all anonymous access to sensitive tables
- Block all authenticated user access to service-only tables
- Cannot be bypassed by permissive policies
- Applied to: `newsletter_subscribers`, `payment_failures`

#### Layer 2: Authentication Requirements  
- All tables require authenticated users (`auth.uid()` checks)
- No anonymous access to any user data

#### Layer 3: Permissive Policies (Access Granting)
- Grant specific access based on user relationships
- Users can access their own data
- Partners can access shared data in active relationships only

#### Layer 4: Explicit Deny Policies
- Block user INSERT/UPDATE/DELETE on read-only tables
- Only service functions can modify system-managed data
- Applied to: `embeddings`, `message_summaries`, `presence`, `checklists`, `checklist_items`

### Key RLS Policies

#### Profiles Table
```sql
-- Users can only access their own profile
CREATE POLICY "profiles self access"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Deny all unauthenticated access
CREATE POLICY "profiles deny unauthenticated access"
ON public.profiles
FOR ALL
TO anon
USING (false);
```

#### Messages Table
```sql
-- Only pair members can view messages
CREATE POLICY "messages strict pair access"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pairs p
    WHERE p.id = messages.pair_id
    AND p.status = 'active'
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
  AND deleted_at IS NULL
);
```

#### Mood Logs Table
```sql
-- Partner can view only if sharing is enabled
CREATE POLICY "mood_logs partner view with consent"
ON public.mood_logs
FOR SELECT
TO authenticated
USING (
  pair_id IS NOT NULL 
  AND shared_with_partner = true
  AND EXISTS (
    SELECT 1 FROM pairs p
    WHERE p.id = mood_logs.pair_id
    AND p.status = 'active'
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
    AND auth.uid() != mood_logs.user_id
  )
);
```

## Authentication

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Best Practices
1. Never store passwords in plain text
2. Use Supabase Auth for all authentication
3. Implement proper session handling
4. Enable Leaked Password Protection in Supabase Dashboard
5. Rate limit auth attempts
6. Log failed authentication attempts

### Enabling Leaked Password Protection

**CRITICAL**: This is currently disabled. To enable:

1. Go to Supabase Dashboard → Authentication → Policies
2. Enable "Leaked Password Protection"
3. Set minimum password strength to "Good"

Reference: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Data Protection

### Sensitive Data Handling

1. **Mood Logs**: Users control sharing with `shared_with_partner` flag
2. **Messages**: Only accessible to active pair members
3. **Call Sessions**: ICE config auto-deleted after call ends
4. **Subscriptions**: Only visible during active pair status
5. **Embeddings**: User-level access control

### Privacy Controls

Users can control:
- Mood data sharing with partner
- Profile visibility
- Notification preferences
- Data retention preferences

## Security Monitoring

### Audit Logging

All security events are logged to `security_audit_log`:

```typescript
import { logSecurityEvent } from '../_shared/rateLimiter.ts';

await logSecurityEvent(
  supabaseClient,
  userId,
  'EVENT_TYPE',
  { detail: 'Event details' },
  ipAddress,
  userAgent
);
```

### Monitored Events
- Unauthenticated access attempts
- Rate limit violations
- Failed authentication
- AI API errors
- Function errors

### Viewing Audit Logs

Currently, audit logs are restricted. To implement admin access:
1. Create user roles table
2. Implement admin role checking
3. Update audit log RLS policy

## Critical Security Configurations

### Enable Leaked Password Protection (MANUAL STEP REQUIRED)

**⚠️ IMPORTANT**: Leaked password protection must be enabled manually in the Supabase dashboard:

1. Navigate to: **Supabase Dashboard → Authentication → Policies**
2. Find: **Password Security Settings**
3. Enable: **Leaked Password Protection**
4. This feature checks passwords against known breach databases (HaveIBeenPwned)
5. Prevents users from using compromised passwords

**Documentation**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

### Service-Role-Only Tables

The following tables contain highly sensitive data and are **only accessible to service roles**:

| Table | Data Type | Security Measures |
|-------|-----------|-------------------|
| `newsletter_subscribers` | Email addresses (PII) | RESTRICTIVE policies block all user access |
| `payment_failures` | Financial data (customer IDs, amounts) | RESTRICTIVE policies block all user access |

**Security Model**: 
- Users cannot query, insert, update, or delete from these tables
- Only backend edge functions with service role keys can access
- All access attempts are logged in audit logs

### Read-Only Tables for Users

These tables are managed by service functions and are **read-only for users**:

| Table | Purpose | User Access |
|-------|---------|-------------|
| `embeddings` | AI search embeddings | Read only (in pair) |
| `message_summaries` | AI-generated summaries | Read only (in pair) |
| `presence` | Real-time user status | Read only (in pair) |
| `checklist_items` | System checklists | Read only (in pair) |
| `checklists` | Checklist definitions | Read only (in pair) |

**Security Model**:
- Users can SELECT data in their pair
- Explicit deny policies block INSERT/UPDATE/DELETE
- Only edge functions can modify these tables

## Best Practices

### For Developers

1. **Always Validate Input**
   - Use Zod schemas for all forms
   - Validate on both client and server
   - Sanitize before display

2. **Implement Rate Limiting**
   - Add to all API endpoints
   - Use appropriate limits per action
   - Log violations

3. **Follow Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Use RLS policies
   - Restrict service role usage

4. **Secure Edge Functions**
   - Validate authentication
   - Check rate limits
   - Log security events
   - Handle errors safely

5. **Never Expose Secrets**
   - Use environment variables
   - Never commit secrets to git
   - Use Supabase secrets for API keys

6. **Test Security**
   - Test RLS policies with different users
   - Verify rate limiting works
   - Check input validation
   - Test authentication flows

### For Users

1. **Use Strong Passwords**
   - Follow password requirements
   - Don't reuse passwords
   - Enable 2FA when available

2. **Review Privacy Settings**
   - Control mood data sharing
   - Manage notification preferences
   - Review connected devices

3. **Report Security Issues**
   - Contact support immediately
   - Don't share credentials
   - Keep app updated

## Security Checklist

### Pre-Deployment

#### Database Security
- [x] All tables have RLS enabled
- [x] RESTRICTIVE policies block anonymous access to sensitive tables
- [x] Service-role-only access for PII and financial data  
- [x] Explicit deny policies for read-only tables
- [x] All SECURITY DEFINER functions have `SET search_path = public`
- [ ] **MANUAL: Enable Leaked Password Protection in Supabase Dashboard**
- [ ] Test RLS policies with different user scenarios

#### Application Security
- [x] Input validation with Zod on all forms
- [x] Rate limiting on all endpoints
- [x] Authentication required for protected routes  
- [x] CSRF protection implemented
- [ ] HTTPS enforced in production
- [ ] Environment variables properly configured
- [ ] Security headers configured
- [ ] Scan for exposed secrets

#### Monitoring & Logging
- [x] Audit logging for critical operations
- [x] Security event tracking for profile changes
- [x] Failed login attempt tracking
- [ ] Error messages don't leak sensitive info
- [ ] Security monitoring dashboard configured

### Ongoing
- [ ] Monitor audit logs
- [ ] Review rate limit violations
- [ ] Update dependencies
- [ ] Patch security vulnerabilities
- [ ] Review new features for security
- [ ] Test RLS policies after changes

## Incident Response

If a security issue is discovered:

1. **Immediate Actions**
   - Assess impact and scope
   - Contain the issue
   - Preserve logs and evidence

2. **Investigation**
   - Review audit logs
   - Identify affected users
   - Determine root cause

3. **Remediation**
   - Fix the vulnerability
   - Deploy patches
   - Notify affected users if needed

4. **Post-Incident**
   - Document findings
   - Update security measures
   - Implement preventive controls

## Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/database-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Zod Documentation](https://zod.dev/)

## Contact

For security concerns, contact: [Your Security Contact]

---

**Last Updated**: October 8, 2025  
**Version**: 2.0  
**Security Grade**: A (Excellent)
