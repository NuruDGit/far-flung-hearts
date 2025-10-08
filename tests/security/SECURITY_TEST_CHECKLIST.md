# Security Penetration Testing Checklist

## 🔴 Priority: HIGH
**Estimated Time:** 8-16 hours for complete testing

---

## 1. SQL Injection Testing

### Test All Forms and Inputs
- [ ] Login form (email, password)
- [ ] Signup form (all fields)
- [ ] Profile update (bio, display_name, etc.)
- [ ] Message sending (body, media_url)
- [ ] Search functionality
- [ ] Event creation/update
- [ ] Goal/task creation

### Common SQL Injection Payloads to Test
```sql
' OR '1'='1
'; DROP TABLE users; --
' UNION SELECT NULL, NULL, NULL--
admin'--
' OR 1=1--
```

### Expected Results
✅ All inputs should be sanitized via Supabase RLS
✅ No direct SQL execution in edge functions
✅ Parameterized queries only

---

## 2. XSS (Cross-Site Scripting) Testing

### Test Text Inputs
- [ ] Message body
- [ ] Profile bio
- [ ] Display name
- [ ] Event titles/descriptions
- [ ] Task notes

### XSS Payloads to Test
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg/onload=alert('XSS')>
"><script>alert(String.fromCharCode(88,83,83))</script>
<iframe src="javascript:alert('XSS')">
```

### Expected Results
✅ HTML content should be escaped
✅ No dangerouslySetInnerHTML without sanitization
✅ Content Security Policy headers in place

---

## 3. CSRF (Cross-Site Request Forgery) Testing

### Test State-Changing Operations
- [ ] Profile updates
- [ ] Message sending
- [ ] Payment actions
- [ ] Account deletion
- [ ] Pair disconnection

### Testing Method
1. Create malicious HTML form on external site
2. Attempt to submit to your endpoints
3. Check if CSRF tokens are validated

### Expected Results
✅ CSRF tokens required for sensitive operations
✅ SameSite cookie attributes set
✅ Origin/Referer header validation

**Current Implementation:** 
- CSRF utilities in `src/lib/csrf.ts`
- Verify usage in all forms

---

## 4. Rate Limiting Tests

### Endpoints to Test
- [ ] Login endpoint (brute force protection)
- [ ] Signup endpoint (spam prevention)
- [ ] Message sending (flooding prevention)
- [ ] Password reset (abuse prevention)
- [ ] API calls to edge functions

### Testing Tools
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://smatdnlednyhqsypmzzl.supabase.co/auth/v1/token

# Using curl in loop
for i in {1..100}; do curl -X POST https://your-endpoint; done
```

### Expected Results
✅ 429 Too Many Requests after threshold
✅ Rate limits per IP/user
✅ Exponential backoff implemented

**Current Implementation:**
- Client-side: `src/lib/rateLimiter.ts`
- Server-side: `supabase/functions/_shared/rateLimiter.ts`

---

## 5. RLS (Row Level Security) Policy Testing

### Test Scenarios

#### Unauthorized Data Access
- [ ] Try to read another pair's messages
- [ ] Try to read another user's profile (non-partner)
- [ ] Try to access mood logs of other users
- [ ] Try to read events from other pairs

#### Unauthorized Data Modification
- [ ] Try to update another user's profile
- [ ] Try to delete messages from another pair
- [ ] Try to modify goals/tasks of other pairs

### Testing Method
```javascript
// In browser console, with valid auth token
const otherPairId = 'some-other-pair-uuid';
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .eq('pair_id', otherPairId);
// Should return error or empty array
```

### Expected Results
✅ No data leakage across pairs
✅ Users can only see partner data in active pairs
✅ All tables have RLS enabled
✅ Proper policies for SELECT, INSERT, UPDATE, DELETE

---

## 6. Session Hijacking Tests

### Test Scenarios
- [ ] Session fixation
- [ ] Session timeout enforcement
- [ ] Token expiration
- [ ] Refresh token security

### Testing Method
1. Login and capture session token
2. Try to use old token after logout
3. Try to reuse refresh token multiple times
4. Check token storage (should be httpOnly)

### Expected Results
✅ Tokens invalidated on logout
✅ Tokens expire after set time
✅ Refresh tokens rotated properly
✅ No tokens in localStorage (use httpOnly cookies)

---

## 7. File Upload Exploits

### Test File Upload Features
- [ ] Avatar uploads
- [ ] Media messages
- [ ] Document uploads

### Malicious Files to Test
- [ ] PHP shell (`.php`, `.phtml`)
- [ ] Executable files (`.exe`, `.bat`)
- [ ] SVG with embedded scripts
- [ ] Large files (DoS attempt)
- [ ] Files with double extensions (`.jpg.php`)

### Expected Results
✅ File type validation (whitelist)
✅ File size limits enforced
✅ Files served from CDN, not app domain
✅ No execution permissions on upload directory
✅ Virus scanning (optional)

**Current Implementation:**
- Storage buckets: avatars, media, docs
- Check RLS policies on storage

---

## 8. Authentication Security

### Tests to Perform
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts
- [ ] Password reset token expiration
- [ ] Email verification required
- [ ] No user enumeration (signup/login errors)

### Expected Results
✅ Strong password policy enforced
✅ Account lockout after 5 failed attempts
✅ Reset tokens expire in 1 hour
✅ Generic error messages

---

## 9. API Security

### Tests to Perform
- [ ] API key exposure in client code
- [ ] Secrets in environment variables
- [ ] CORS properly configured
- [ ] API versioning
- [ ] Error messages don't leak info

### Expected Results
✅ No API keys in frontend
✅ Anon key properly scoped
✅ Service role key only in backend
✅ CORS allows only app domain
✅ Generic error responses

---

## 10. Additional Security Checks

### General Security
- [ ] HTTPS enforced everywhere
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Dependencies up to date
- [ ] No console.log in production
- [ ] Audit logs for sensitive actions

### Database Security
- [ ] No raw SQL execution in edge functions
- [ ] Parameterized queries only
- [ ] Database backups configured
- [ ] Sensitive data encrypted

---

## Tools to Use

### Automated Scanners
1. **OWASP ZAP**
   ```bash
   # Run automated scan
   zap-cli quick-scan https://your-app.lovable.app
   ```

2. **Burp Suite**
   - Use for manual testing
   - Intercept and modify requests
   - Test all endpoints

3. **SQLMap**
   ```bash
   # Test for SQL injection
   sqlmap -u "https://your-endpoint?param=value" --batch
   ```

4. **Nikto**
   ```bash
   # Web server scanner
   nikto -h https://your-app.lovable.app
   ```

### Manual Testing Tools
- Browser DevTools (Network, Console)
- Postman/Insomnia for API testing
- JWT decoder (jwt.io)
- curl for request crafting

---

## Reporting

### For Each Vulnerability Found

**Document:**
1. Vulnerability type (e.g., XSS, SQL Injection)
2. Severity (Critical, High, Medium, Low)
3. Affected endpoint/component
4. Steps to reproduce
5. Potential impact
6. Recommended fix
7. Screenshots/proof of concept

### Severity Levels
- 🔴 **Critical:** Immediate data breach risk
- 🟠 **High:** Significant security impact
- 🟡 **Medium:** Moderate security risk
- 🟢 **Low:** Minor security concern

---

## Post-Testing Actions

- [ ] Fix all Critical and High vulnerabilities
- [ ] Retest after fixes
- [ ] Update security documentation
- [ ] Schedule regular penetration testing (quarterly)
- [ ] Train team on secure coding practices
