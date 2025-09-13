#!/bin/bash

# Eurodoor Production Deployment Script
# This script ensures zero-downtime deployment with proper validation

set -e  # Exit on any error

echo "🚀 Starting Eurodoor Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="eurodoor"
BUILD_DIR="build"
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

# Check if environment variables are set
if [ -z "$VITE_SUPABASE_URL" ]; then
    print_warning "VITE_SUPABASE_URL not set. Using default."
fi

if [ -z "$VITE_VAPID_PUBLIC_KEY" ]; then
    print_warning "VITE_VAPID_PUBLIC_KEY not set. Push notifications may not work."
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Run tests
print_status "Running tests..."
npm run test -- --run

# Run linting
print_status "Running linting..."
npm run lint

# Type checking
print_status "Running type checking..."
npm run type-check

# Build the application
print_status "Building application..."
npm run build

# Verify build
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build directory not found. Build failed."
    exit 1
fi

print_success "Build completed successfully!"

# Check bundle sizes
print_status "Checking bundle sizes..."
BUNDLE_SIZE=$(du -sh $BUILD_DIR | cut -f1)
print_status "Bundle size: $BUNDLE_SIZE"

# Check for large files
LARGE_FILES=$(find $BUILD_DIR -name "*.js" -size +500k)
if [ ! -z "$LARGE_FILES" ]; then
    print_warning "Large files detected:"
    echo "$LARGE_FILES"
fi

# Create backup of current deployment (if exists)
if [ -d "/var/www/$APP_NAME" ]; then
    print_status "Creating backup of current deployment..."
    sudo cp -r /var/www/$APP_NAME /var/www/$BACKUP_DIR
    print_success "Backup created at /var/www/$BACKUP_DIR"
fi

# Deploy to production
print_status "Deploying to production..."
sudo cp -r $BUILD_DIR/* /var/www/$APP_NAME/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/$APP_NAME
sudo chmod -R 755 /var/www/$APP_NAME

# Restart web server
print_status "Restarting web server..."
sudo systemctl reload nginx

# Health check
print_status "Performing health check..."
sleep 5

HEALTH_CHECK_URL="https://eurodoor.uz"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)

if [ "$HTTP_STATUS" = "200" ]; then
    print_success "Health check passed! Application is running."
else
    print_error "Health check failed! HTTP Status: $HTTP_STATUS"
    print_status "Rolling back to previous version..."
    sudo rm -rf /var/www/$APP_NAME
    sudo mv /var/www/$BACKUP_DIR /var/www/$APP_NAME
    sudo systemctl reload nginx
    exit 1
fi

# Cleanup old backups (keep last 5)
print_status "Cleaning up old backups..."
sudo ls -t /var/www/backup-* | tail -n +6 | sudo xargs rm -rf

print_success "🎉 Deployment completed successfully!"
print_status "Application is now live at: $HEALTH_CHECK_URL"

# Send notification (optional)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Eurodoor deployment successful! Bundle size: $BUNDLE_SIZE\"}" \
        $SLACK_WEBHOOK_URL
fi

echo "Deployment completed at $(date)"
