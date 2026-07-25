@echo off
timeout 10
curl.exe -X POST http://localhost:3001/api/v1/audit -H "Content-Type: application/json" -d "{\"url\": \"https://example.com\"}"
pause