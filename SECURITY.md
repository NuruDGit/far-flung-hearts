# Security Guide - Love Beyond Borders

This document outlines the security measures implemented in the application and best practices for maintaining security.

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
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Strict access policies for user data
- ✅ Consent-based mood data sharing
- ✅ Automatic cleanup of sensitive data (ICE config)
- ✅ User-level access control for embeddings
- ✅ Protection against SQL injection via parameterized queries
- ✅ Input validation triggers at database level

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
- [ ] Enable Leaked Password Protection in Supabase
- [ ] Review all RLS policies
- [ ] Test rate limiting
- [ ] Verify input validation
- [ ] Check error handling
- [ ] Review audit logging
- [ ] Test with different user roles
- [ ] Scan for exposed secrets

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

**Last Updated**: October 2, 2025
**Version**: 1.0
