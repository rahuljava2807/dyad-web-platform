#!/bin/bash

echo "🚀 Setting up Dyad Web Platform for local development..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

print_status "Docker is running ✓"

# Step 1: Set up environment files
print_status "Setting up environment files..."
cp .env.local .env
cp .env.local backend/.env
cp .env.local frontend/.env.local
print_success "Environment files created"

# Step 2: Start local services
print_status "Starting local services (PostgreSQL, Redis, MinIO)..."
docker-compose -f docker-compose.local.yml up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.local.yml ps | grep -q "Up"; then
    print_success "Local services started successfully"
else
    print_error "Failed to start local services"
    exit 1
fi

# Step 3: Install dependencies
print_status "Installing dependencies..."

# Clean install for root
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    print_error "Failed to install root dependencies"
    exit 1
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Run database migrations
print_status "Setting up database..."
npx prisma migrate dev --name init --skip-generate

if [ $? -ne 0 ]; then
    print_warning "Database migration failed, but continuing..."
fi

# Go back to root
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

print_success "🎉 Setup complete!"
echo ""
print_status "Next steps:"
echo "1. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open your browser to http://localhost:3000"
echo ""
print_status "Local services are running:"
echo "• PostgreSQL: localhost:5433"
echo "• Redis: localhost:6380"
echo "• MinIO Console: http://localhost:9001 (minioadmin / minioadmin123)"
echo "• MinIO API: http://localhost:9000"
echo ""
print_status "To stop local services:"
echo "docker-compose -f docker-compose.local.yml down"