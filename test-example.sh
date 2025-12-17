#!/bin/bash
# Quick Test Script for PR Risk Scoring Tool
# Run this script to test the tool with the sample diff

echo "=== PR Risk Scoring Tool - Quick Test ==="
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "✓ .env file found"
    # dotenv will handle it in the app
else
    echo "⚠ .env file not found. Make sure GROQ_API_KEY is set as environment variable"
fi

# Check if API key is set
if [ -z "$GROQ_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
    echo "✗ No API key found. Please set GROQ_API_KEY environment variable"
    echo "  Example: export GROQ_API_KEY='your-api-key-here'"
    exit 1
else
    echo "✓ API key found in environment"
fi

echo ""
echo "Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "✗ Build failed"
    exit 1
fi

echo "✓ Build successful"
echo ""
echo "Testing with sample diff file..."
echo ""

# Run the tool with sample diff
npm run dev -- --file examples/sample-diff.txt

echo ""
echo "=== Test Complete ==="

