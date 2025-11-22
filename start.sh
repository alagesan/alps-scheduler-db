#!/bin/bash

# ALPS Scheduler - Quick Start Script
# This script helps you set up and run the ALPS Scheduler system

echo "======================================"
echo "ALPS Residency Task Scheduler"
echo "Quick Start Setup"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit the .env file with your email credentials:"
    echo ""
    echo "   nano .env"
    echo ""
    echo "   Update these values:"
    echo "   MAIL_USERNAME=your-email@gmail.com"
    echo "   MAIL_PASSWORD=your-app-password"
    echo ""
    echo "   Get Gmail App Password: https://myaccount.google.com/apppasswords"
    echo ""
    read -p "Press Enter after you've updated .env file..."
fi

echo "✅ .env file found"
echo ""

# Check if Scheduler-Master.csv exists
if [ ! -f Scheduler-Master.csv ]; then
    echo "❌ Scheduler-Master.csv not found!"
    echo "   This file is required for the system to work."
    exit 1
fi

echo "✅ Scheduler-Master.csv found"
echo ""

# Ask user if they want to build and start
echo "Ready to build and start the ALPS Scheduler system."
echo ""
echo "This will:"
echo "  • Build 3 Docker containers (API, Batch, PWA)"
echo "  • Start all services"
echo "  • Set up email scheduling (7 AM and 7 PM IST)"
echo "  • Launch the web interface"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "🚀 Building and starting containers..."
echo "   This may take a few minutes on first run..."
echo ""

# Build and start with docker-compose
docker compose up --build -d

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✅ ALPS Scheduler is now running!"
    echo "======================================"
    echo ""
    echo "Access the applications:"
    echo "  • PWA Interface:  http://localhost:3000"
    echo "  • REST API:       http://localhost:8080/api/tasks/today"
    echo "  • API Docs:       http://localhost:8080/api"
    echo ""
    echo "Email Schedule:"
    echo "  • Morning: 7:00 AM IST (1:30 AM UTC)"
    echo "  • Evening: 7:00 PM IST (1:30 PM UTC)"
    echo "  • Recipient: internal@alpsresidencymadurai.in"
    echo ""
    echo "View logs:"
    echo "  docker compose logs -f"
    echo ""
    echo "Stop the system:"
    echo "  docker compose down"
    echo ""
    echo "Update tasks:"
    echo "  Edit Scheduler-Master.csv and save (auto-reloads)"
    echo ""
    echo "======================================"
else
    echo ""
    echo "❌ Failed to start containers."
    echo "   Check the error messages above."
    echo "   Run 'docker compose logs' for more details."
    exit 1
fi
