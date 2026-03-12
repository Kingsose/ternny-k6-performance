# ternny-k6-performance

## Ternny K6 Performance Testing
A performance and load testing suite built with k6 for the Ternny web application. This project tests five core API endpoints across four test types to validate system reliability, response time SLAs, and behaviour under varying levels of concurrent load.

Endpoints Tested
EndpointDescription/authUser authentication — entry point/add-tripTrip creation — data integrity critical/travel-personaPersona configuration/planCore trip planning feature/profileUser profile — social feature

Test Types
🟢 Smoke Test
Script: Scripts/SmokeTesting.js
VUs: 2 | Duration: 30 seconds
Verifies the script works correctly and the system is healthy under minimal load. Runs all 5 endpoints sequentially with 4 assertions each (status, response time, body, content-type header).
🔵 Load Test
Script: Scripts/LoadTesting.js
VUs: Up to 50 | Duration: 5 minutes over 5 stages
Validates system performance under expected production-level traffic using a probabilistic traffic split that mirrors real user behaviour (35% add-trip, 20% travel-persona, 15% each for auth/plan/profile).
🔴 Stress Test
Script: Scripts/StressTesting.js
VUs: Up to 200 | Duration: 11 minutes over 7 stages
Pushes the system beyond normal capacity to identify the breaking point and observe how the server degrades under extreme concurrent load.
🟡 Spike Test
Script: Scripts/SpikeTesting.js
VUs: Up to 150 | Duration: 5 minutes 20 seconds over 6 stages
Simulates sudden bursts of traffic to test how the system handles abrupt load increases and whether it recovers after the spike subsides.

Thresholds
Each script defines both global and per-endpoint thresholds:

Response time: p(95) < 500ms globally, with tighter per-endpoint SLAs
Error rate: < 1% globally, < 0.5% for /add-trip
Checks pass rate: > 99%
Throughput: Minimum req/s targets per endpoint at 50 and 100 VUs


Project Structure
ternny-k6-performance/
├── Scripts/
│   ├── SmokeTesting.js
│   ├── LoadTesting.js
│   ├── StressTesting.js
│   └── SpikeTesting.js
├── Reports/
│   └── (HTML reports generated here)
└── README.md

How to Run
bash# Smoke Test
k6 run --env BASE_URL=https://ternny.com Scripts/SmokeTesting.jsMM

# Load Test
k6 run --env BASE_URL=https://ternny.com Scripts/LoadTesting.js

# Stress Test
k6 run --env BASE_URL=https://ternny.com Scripts/StressTesting.js

# Spike Test
k6 run --env BASE_URL=https://ternny.com Scripts/SpikeTesting.js

Key Results Summary
TestPeak VUsp(95)Error RateVerdictSmoke2411ms0.00%✅ PASSEDLoad50952ms0.00%❌ FAILEDStress2001.32s0.00%❌ FAILEDSpike150404ms0.00%⚠️ PARTIAL
The system demonstrated strong reliability across all tests with near-zero HTTP failures. Response time SLAs were met under minimal and burst load but were breached under sustained concurrent load.

Tools & Environment

Tool: k6 (local execution)


OS: Windows 11
Network: Mobile Hotspot
Reporting: k6-reporter HTML output
