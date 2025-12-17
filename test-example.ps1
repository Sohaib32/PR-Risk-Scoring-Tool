# Quick Test Script for PR Risk Scoring Tool
# Run this script to test the tool with the sample diff

Write-Host "=== PR Risk Scoring Tool - Quick Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path .env) {
    Write-Host "✓ .env file found" -ForegroundColor Green
    # Load .env file manually (dotenv will handle it in the app)
} else {
    Write-Host "⚠ .env file not found. Make sure GROQ_API_KEY is set as environment variable" -ForegroundColor Yellow
}

# Check if API key is set
if ($env:GROQ_API_KEY -or $env:OPENAI_API_KEY) {
    Write-Host "✓ API key found in environment" -ForegroundColor Green
} else {
    Write-Host "✗ No API key found. Please set GROQ_API_KEY environment variable" -ForegroundColor Red
    Write-Host "  Example: `$env:GROQ_API_KEY='your-api-key-here'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""
Write-Host "Testing with sample diff file..." -ForegroundColor Cyan
Write-Host ""

# Run the tool with sample diff
npx ts-node src/cli.ts --file examples/sample-diff.txt

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan

