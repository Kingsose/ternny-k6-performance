import http from 'k6/http';
import { sleep, check, group } from 'k6';
import {htmlReport} from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const BASE_URL = __ENV.BASE_URL || 'https://ternny.com';

export const options = {

    vus: 2, 
    duration: '30s',
   
    thresholds: {
        // 95% of all requests must complete under 500ms
        http_req_duration: ['p(95)<500'],
        // Error rate must stay below 1%
        http_req_failed: ['rate<0.01'],
        // All checks must pass at 99%+ rate
        checks: ['rate>0.99'],
    },
};

export default function () {

    // ── /auth
    group('auth group', () => {
        const response = http.get(`${BASE_URL}/auth`);
        check(response, {
            // 1. Status check
            'auth: status is 200': (r) => r.status === 200,
            // 2. Response time check
            'auth: response time < 500ms': (r) => r.timings.duration < 500,
            // 3. Body is not empty
            'auth: body is not empty': (r) => r.body.length > 0,
            // 4. Content-Type header is present
            'auth: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    // ── /add-trip 
    group('add-trip group', () => {
        const response = http.get(`${BASE_URL}/add-trip`);
        check(response, {
            // 1. Status check
            'add-trip: status is 200': (r) => r.status === 200,
            // 2. Response time check
            'add-trip: response time < 700ms': (r) => r.timings.duration < 500,
            // 3. Body is not empty
            'add-trip: body is not empty': (r) => r.body.length > 0,
            // 4. Content-Type header is present
            'add-trip: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    // ── /travel-persona 
    group('travel-persona group', () => {
        const response = http.get(`${BASE_URL}/travel-persona`);
        check(response, {
            // 1. Status check
            'travel-persona: status is 200': (r) => r.status === 200,
            // 2. Response time check
            'travel-persona: response time < 500ms': (r) => r.timings.duration < 500,
            // 3. Body is not empty
            'travel-persona: body is not empty': (r) => r.body.length > 0,
            // 4. Content-Type header is present
            'travel-persona: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    // ── /plan 
    group('plan group', () => {
        const response = http.get(`${BASE_URL}/plan`);
        check(response, {
            // 1. Status check
            'plan: status is 200': (r) => r.status === 200,
            // 2. Response time check
            'plan: response time < 600ms': (r) => r.timings.duration < 500,
            // 3. Body is not empty
            'plan: body is not empty': (r) => r.body.length > 0,
            // 4. Content-Type header is present
            'plan: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);

    // ── /profile 
    group('profile group', () => {
        const response = http.get(`${BASE_URL}/profile`);
        check(response, {
            // 1. Status check
            'profile: status is 200': (r) => r.status === 200,
            // 2. Response time check
            'profile: response time < 450ms': (r) => r.timings.duration < 500,
            // 3. Body is not empty
            'profile: body is not empty': (r) => r.body.length > 0,
            // 4. Content-Type header is present
            'profile: has content-type header': (r) => r.headers['Content-Type'] !== undefined,
        });
    });
    sleep(1);
}

/*export function handleSummary(data) {
    return {
        "smoke.html": htmlReport(data),
    };
}*/