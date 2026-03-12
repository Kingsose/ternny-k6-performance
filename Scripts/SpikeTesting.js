import http from 'k6/http';
import {sleep, check, group} from 'k6';
//import {htmlReport} from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const BASE_URL= __ENV.BASE_URL || 'https://ternny.com';

const TRAFFIC_SPLIT = {
    auth: 0.15,
    addTrip: 0.35,
    travelPersona: 0.20,
    plan: 0.15,
    profile: 0.15,
};
export const options =
{
    stages: [
        {duration:'30s', target: 5},
        {duration:'10s', target: 150},
        {duration:'2m', target: 150},
        {duration:'10s', target: 5},
        {duration:'2m', target: 5},
        {duration:'30s', target: 0},        
    ],
    vus: 5, // baseline vus

    thresholds: {
        // ── Global thresholds
        'http_req_duration':                     ['p(95)<500', 'p(99)<1000'],
        'http_req_failed':                        ['rate<0.01'],
        'checks':                                 ['rate>0.99'],

        // ── /auth (entry point) 
        // //using endpoint so k6 can measure all end point independently using tags in function block
        'http_req_duration{endpoint:auth}':       ['p(50)<300', 'p(90)<450', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:auth}':         ['rate<0.01'],
        'http_reqs{endpoint:auth}':               ['rate>=70'],   // ≥100 req/s @ 70 VUs

        // ── /add-trip (data integrity) 
        'http_req_duration{endpoint:add-trip}':   ['p(50)<400', 'p(90)<600', 'p(95)<700', 'p(99)<1200'],
        'http_req_failed{endpoint:add-trip}':     ['rate<0.005'],
        'http_reqs{endpoint:add-trip}':           ['rate>=55'],   // ≥55 req/s @ 100 VUs

        // ── /travel-persona (configuration) 
        'http_req_duration{endpoint:travel-persona}': ['p(50)<250', 'p(90)<400', 'p(95)<500', 'p(99)<800'],
        'http_req_failed{endpoint:travel-persona}':   ['rate<0.01'],
        'http_reqs{endpoint:travel-persona}':         ['rate>=80'],  // ≥80 req/s @ 100 VUs

        // ── /plan (core feature) 
        'http_req_duration{endpoint:plan}':       ['p(50)<350', 'p(90)<500', 'p(95)<600', 'p(99)<1000'],
        'http_req_failed{endpoint:plan}':         ['rate<0.01'],
        'http_reqs{endpoint:plan}':               ['rate>=60'],   // ≥60 req/s @ 100 VUs

        // ── /profile (social feature) 
        'http_req_duration{endpoint:profile}':    ['p(50)<200', 'p(90)<350', 'p(95)<450', 'p(99)<700'],
        'http_req_failed{endpoint:profile}':      ['rate<0.01'],
        'http_reqs{endpoint:profile}':            ['rate>=90'],   // ≥90 req/s @ 100 VUs
    },
}; 


export default function () {
    const random = Math.random();

    if (random < TRAFFIC_SPLIT.auth) {
        group('auth group', () => {
            const response = http.get(`${BASE_URL}/auth`, {
                tags: { endpoint: 'auth' },//using tag so k6 can measure all end point independently, 
                // and for proper end point filtering
            });
            check(response, { 'auth status 200': (r) => r.status === 200 });
        });
        sleep(1);

    } else if (random < TRAFFIC_SPLIT.auth + TRAFFIC_SPLIT.addTrip) { 
        group('add-trip group', () => { 
            const response = http.get(`${BASE_URL}/add-trip`, {
                tags: { endpoint: 'add-trip' },
            });
            check(response, { 'add-trip status 200': (r) => r.status === 200 });
        });
        sleep(1);

    } else if (random < TRAFFIC_SPLIT.auth + TRAFFIC_SPLIT.addTrip + TRAFFIC_SPLIT.travelPersona) {
        group('travel-persona group', () => { 
            const response = http.get(`${BASE_URL}/travel-persona`, {
                tags: { endpoint: 'travel-persona' },
            });
            check(response, { 'travel-persona status 200': (r) => r.status === 200 });
        });
        sleep(1);

    } else if (random < TRAFFIC_SPLIT.auth + TRAFFIC_SPLIT.addTrip + TRAFFIC_SPLIT.travelPersona + TRAFFIC_SPLIT.plan){
        group('plan group', () => { 
            const response = http.get(`${BASE_URL}/plan`, {
                tags: { endpoint: 'plan' },
            });
            check(response, { 'plan status 200': (r) => r.status === 200 });
        });
        sleep(1);

    } else {
        group('profile group', () => {                                    
            const response = http.get(`${BASE_URL}/profile`, {
                tags: { endpoint: 'profile' },
            });
            check(response, { 'profile status 200': (r) => r.status === 200 });
        });
        sleep(1);
    }    
};

/*export function handleSummary(data)
{
    return {
        "Spike.html": htmlReport(data)
    };
};*/