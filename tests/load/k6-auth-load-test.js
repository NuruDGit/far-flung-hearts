import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'https://smatdnlednyhqsypmzzl.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYXRkbmxlZG55aHFzeXBtenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjU3NDMsImV4cCI6MjA3NDI0MTc0M30.qio5GOi1N_4nBWsYZa97a9FfDENtoc3BNHwcjmSS8cs';

export default function () {
  const email = `loadtest${__VU}${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
  };

  // Test signup
  const signupPayload = JSON.stringify({
    email: email,
    password: password,
  });
  
  const signupRes = http.post(
    `${BASE_URL}/auth/v1/signup`,
    signupPayload,
    { headers }
  );
  
  check(signupRes, {
    'signup status is 200': (r) => r.status === 200,
    'signup response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  sleep(2);

  // Test login
  const loginPayload = JSON.stringify({
    email: email,
    password: password,
  });
  
  const loginRes = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    loginPayload,
    { headers }
  );
  
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 800ms': (r) => r.timings.duration < 800,
    'login returns access token': (r) => {
      const body = JSON.parse(r.body);
      return body.access_token !== undefined;
    },
  });
  
  sleep(1);

  // Test user fetch
  if (loginRes.status === 200) {
    const token = JSON.parse(loginRes.body).access_token;
    
    const userRes = http.get(
      `${BASE_URL}/auth/v1/user`,
      {
        headers: {
          ...headers,
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    check(userRes, {
      'user fetch status is 200': (r) => r.status === 200,
      'user fetch response time < 500ms': (r) => r.timings.duration < 500,
    });
  }
  
  sleep(2);
}
