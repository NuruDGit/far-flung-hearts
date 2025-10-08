import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Load test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 500 }, // Ramp up to 500 users
    { duration: '5m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

const BASE_URL = 'https://smatdnlednyhqsypmzzl.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYXRkbmxlZG55aHFzeXBtenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjU3NDMsImV4cCI6MjA3NDI0MTc0M30.qio5GOi1N_4nBWsYZa97a9FfDENtoc3BNHwcjmSS8cs';

// Test user credentials (these should be created in test environment)
const testUsers = new SharedArray('users', function () {
  return [
    { email: 'test1@example.com', password: 'TestPassword123!' },
    { email: 'test2@example.com', password: 'TestPassword123!' },
  ];
});

export function setup() {
  // Login and get auth tokens for test users
  const tokens = testUsers.map(user => {
    const loginRes = http.post(`${BASE_URL}/auth/v1/token?grant_type=password`, 
      JSON.stringify({
        email: user.email,
        password: user.password,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
        },
      }
    );
    
    if (loginRes.status === 200) {
      return JSON.parse(loginRes.body).access_token;
    }
    return null;
  });
  
  return { tokens };
}

export default function (data) {
  const token = data.tokens[__VU % data.tokens.length];
  
  if (!token) {
    console.error('No auth token available');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${token}`,
  };

  // Test 1: Send message
  const messagePayload = JSON.stringify({
    body: { text: `Load test message ${Date.now()}` },
    type: 'text',
  });
  
  const sendMessageRes = http.post(
    `${BASE_URL}/rest/v1/messages`,
    messagePayload,
    { headers }
  );
  
  check(sendMessageRes, {
    'send message status is 201': (r) => r.status === 201,
    'send message response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);

  // Test 2: Fetch messages
  const fetchMessagesRes = http.get(
    `${BASE_URL}/rest/v1/messages?select=*&order=created_at.desc&limit=50`,
    { headers }
  );
  
  check(fetchMessagesRes, {
    'fetch messages status is 200': (r) => r.status === 200,
    'fetch messages response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  sleep(1);

  // Test 3: Update profile
  const profilePayload = JSON.stringify({
    display_name: `Test User ${__VU}`,
  });
  
  const updateProfileRes = http.patch(
    `${BASE_URL}/rest/v1/profiles?id=eq.${__VU}`,
    profilePayload,
    { headers }
  );
  
  check(updateProfileRes, {
    'update profile response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  sleep(2);
}

export function teardown(data) {
  console.log('Load test completed');
}
