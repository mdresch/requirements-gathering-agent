REM Windows Command Prompt - Standards Compliance API Test
REM Run these commands one by one in your terminal

REM 1. Simple Health Check
curl -H "X-API-Key: dev-api-key-123" http://localhost:3001/api/v1/standards/health

REM 2. Full Standards Analysis (Single Line)
curl -X POST http://localhost:3001/api/v1/standards/analyze -H "Content-Type: application/json" -H "X-API-Key: dev-api-key-123" -d "{\"projectData\":{\"projectId\":\"DEMO-001\",\"projectName\":\"Quick Test Project\",\"industry\":\"TECHNOLOGY\",\"projectType\":\"SOFTWARE_DEVELOPMENT\",\"complexity\":\"MEDIUM\",\"duration\":6,\"budget\":500000,\"teamSize\":8,\"stakeholderCount\":12,\"methodology\":\"AGILE\",\"documents\":[],\"processes\":[],\"deliverables\":[],\"governance\":{\"structure\":\"AGILE_TEAM\",\"decisionAuthority\":\"PRODUCT_OWNER\",\"reportingFrequency\":\"DAILY\"},\"metadata\":{\"createdBy\":\"test-user\",\"createdDate\":\"2025-06-23T00:00:00.000Z\",\"lastAnalyzed\":\"2025-06-23T00:00:00.000Z\",\"analysisVersion\":\"1.0\"}},\"analysisConfig\":{\"enabledStandards\":[\"BABOK_V3\",\"PMBOK_7\"],\"analysisDepth\":\"COMPREHENSIVE\"},\"metadata\":{\"requestId\":\"TEST-001\",\"requestedBy\":\"test-user\",\"requestDate\":\"2025-06-23T00:00:00.000Z\",\"priority\":\"MEDIUM\"}}"

REM 3. Dashboard
curl -H "X-API-Key: dev-api-key-123" http://localhost:3001/api/v1/standards/dashboard

REM 4. Deviation Summary
curl -H "X-API-Key: dev-api-key-123" http://localhost:3001/api/v1/standards/deviations/summary

REM 5. Executive Summary
curl -H "X-API-Key: dev-api-key-123" http://localhost:3001/api/v1/standards/reports/executive-summary
