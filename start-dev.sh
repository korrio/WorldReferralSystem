#!/bin/bash

# Development startup script for World ID Referral System
# Runs both frontend and backend concurrently

echo "🚀 Starting World ID Referral System in development mode..."
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Run the development server (which handles both frontend and backend)
npm run dev