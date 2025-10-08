# Security & Load Testing Guide

This directory contains security testing checklists and load testing scripts for Love Beyond Borders.

## 📁 Directory Structure

```
tests/
├── security/
│   ├── README.md                    # This file
│   ├── SECURITY_TEST_CHECKLIST.md   # Comprehensive security testing guide
│   └── BROWSER_COMPATIBILITY.md     # Browser testing checklist
└── load/
    ├── k6-auth-load-test.js         # Authentication endpoint load test
    ├── k6-message-load-test.js      # Messaging system load test
    └── k6-subscription-load-test.js  # Subscription flow load test
```

## 🔒 Security Testing

### Prerequisites
1. Install testing tools:
   ```bash
   # OWASP ZAP
   docker pull zaproxy/zap-stable
   
   # Burp Suite Community Edition
   # Download from: https://portswigger.net/burp/communitydownload
   
   # SQLMap
   pip install sqlmap
   
   # Nikto
   docker pull secfigo/nikto
   ```

### Running Security Tests

1. **Automated Scanning with OWASP ZAP:**
   ```bash
   docker run -t zaproxy/zap-stable zap-baseline.py \
     -t https://507483f1-cb82-4138-98f1-d3c2e64765df.lovableproject.com
   ```

2. **SQL Injection Testing with SQLMap:**
   ```bash
   # Test specific endpoint
   sqlmap -u "https://your-endpoint" \
     --headers="Authorization: Bearer YOUR_TOKEN" \
     --level=5 --risk=3
   ```

3. **Web Server Scanning with Nikto:**
   ```bash
   docker run secfigo/nikto \
     -h https://507483f1-cb82-4138-98f1-d3c2e64765df.lovableproject.com
   ```

4. **Manual Testing:**
   - Follow the comprehensive checklist in `SECURITY_TEST_CHECKLIST.md`
   - Test all items marked as P1 (HIGH priority)
   - Document findings in security report

### Current Security Status

#### ⚠️ Known Issues (from Supabase Linter)
1. **Function Search Path Mutable** (WARN)
   - Some database functions don't have `search_path` set
   - [Fix guide](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

2. **Leaked Password Protection Disabled** (WARN)
   - Password breach detection not enabled
   - [Fix guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

#### ✅ Implemented Security Features
- Row Level Security (RLS) on all tables
- CSRF protection utilities (`src/lib/csrf.ts`)
- Client-side rate limiting (`src/lib/rateLimiter.ts`)
- Server-side rate limiting (`supabase/functions/_shared/rateLimiter.ts`)
- Input validation with Zod schemas
- Secure storage buckets with RLS policies

## 📊 Load Testing

### Prerequisites
1. Install k6:
   ```bash
   # macOS
   brew install k6
   
   # Windows
   choco install k6
   
   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

### Running Load Tests

1. **Authentication Load Test:**
   ```bash
   k6 run tests/load/k6-auth-load-test.js
   ```
   - Tests signup and login endpoints
   - Ramps up to 100 concurrent users
   - Expects 95% of requests under 1000ms

2. **Message System Load Test:**
   ```bash
   k6 run tests/load/k6-message-load-test.js
   ```
   - Tests message sending and fetching
   - Ramps up to 500 concurrent users
   - Expects 95% of requests under 500ms

3. **Subscription Flow Load Test:**
   ```bash
   k6 run tests/load/k6-subscription-load-test.js
   ```
   - Tests checkout and subscription check endpoints
   - Ramps up to 50 concurrent users
   - Expects 95% of requests under 2000ms

### Interpreting Results

k6 provides metrics including:
- **http_req_duration:** Request duration (avg, min, max, p95, p99)
- **http_req_failed:** Rate of failed requests
- **iterations:** Total number of test iterations
- **vus:** Virtual users (concurrent users)

#### Success Criteria
✅ **Pass:** All thresholds met
- P95 response times within limits
- Error rate under 1%
- No crashes or timeouts

⚠️ **Warning:** Some thresholds exceeded
- Investigate slow endpoints
- Check database query performance
- Review server resources

❌ **Fail:** Multiple thresholds exceeded
- System cannot handle load
- Critical performance issues
- Requires optimization

### Before Running Load Tests

1. **Prepare Test Data:**
   ```sql
   -- Create test users in Supabase
   INSERT INTO auth.users (email, encrypted_password)
   VALUES 
     ('test1@example.com', 'hashed_password'),
     ('test2@example.com', 'hashed_password');
   ```

2. **Configure Rate Limits:**
   - Temporarily increase rate limits for testing
   - Or exclude test IPs from rate limiting

3. **Set Up Monitoring:**
   - Open Supabase dashboard
   - Monitor database performance
   - Watch for errors in edge function logs

4. **Use Test Environment:**
   - **Never run load tests on production!**
   - Use staging or development environment
   - Update BASE_URL in test files

## 🌐 Browser Compatibility Testing

See `BROWSER_COMPATIBILITY.md` for detailed testing checklist.

### Quick Test
1. Open app in each target browser
2. Test critical features:
   - Login/signup
   - Message sending
   - Video call (WebRTC)
   - File upload
   - PWA installation

### Target Browsers
- ✅ Chrome (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS 15+)
- ✅ Mobile Chrome (Android 11+)

## 📝 Reporting

### Create Test Report
```markdown
# Security & Load Test Report
**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Production/Staging

## Summary
- Total vulnerabilities found: X
- Critical: X
- High: X
- Medium: X
- Low: X

## Load Test Results
- Auth endpoint: ✅ Pass / ❌ Fail
- Message endpoint: ✅ Pass / ❌ Fail
- Subscription endpoint: ✅ Pass / ❌ Fail

## Detailed Findings
[List all issues with severity, reproduction steps, and recommended fixes]

## Recommendations
[Priority actions to take]
```

## 🔄 Regular Testing Schedule

- **Security Scans:** Monthly
- **Penetration Testing:** Quarterly
- **Load Testing:** Before major releases
- **Browser Compatibility:** After UI changes

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [k6 Documentation](https://k6.io/docs/)
- [Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
