import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'https://smatdnlednyhqsypmzzl.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYXRkbmxlZG55aHFzeXBtenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjU3NDMsImV4cCI6MjA3NDI0MTc0M30.qio5GOi1N_4nBWsYZa97a9FfDENtoc3BNHwcjmSS8cs';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
  };

  // Test check-subscription endpoint
  const checkSubRes = http.post(
    `${BASE_URL}/functions/v1/check-subscription`,
    JSON.stringify({}),
    { headers }
  );
  
  check(checkSubRes, {
    'check subscription response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  sleep(2);

  // Test create-checkout endpoint (will fail without proper setup, but tests load)
  const checkoutPayload = JSON.stringify({
    priceId: 'price_test',
    planType: 'premium',
  });
  
  const checkoutRes = http.post(
    `${BASE_URL}/functions/v1/create-checkout`,
    checkoutPayload,
    { headers }
  );
  
  check(checkoutRes, {
    'checkout endpoint responds': (r) => r.status >= 200 && r.status < 500,
    'checkout response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  sleep(3);
}
