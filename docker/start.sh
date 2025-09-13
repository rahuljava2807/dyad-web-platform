#!/bin/sh

# Start script for Dyad Web Platform
set -e

echo "🚀 Starting Dyad Web Platform..."

# Function to wait for a service to be ready
wait_for_service() {
  host="$1"
  port="$2"
  service_name="$3"

  echo "⏳ Waiting for $service_name to be ready at $host:$port..."

  while ! nc -z "$host" "$port"; do
    echo "   $service_name is not ready yet, waiting..."
    sleep 2
  done

  echo "✅ $service_name is ready!"
}

# Wait for dependencies if running in Docker Compose
if [ -n "$DATABASE_URL" ]; then
  # Extract host and port from DATABASE_URL
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

  if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    wait_for_service "$DB_HOST" "$DB_PORT" "PostgreSQL"
  fi
fi

if [ -n "$REDIS_URL" ]; then
  # Extract host and port from REDIS_URL
  REDIS_HOST=$(echo "$REDIS_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
  REDIS_PORT=$(echo "$REDIS_URL" | sed -n 's/.*:\([0-9]*\).*/\1/p')

  if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
    wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis"
  fi
fi

# Run database migrations
echo "🔄 Running database migrations..."
cd /app/backend && npx prisma migrate deploy

# Seed database if needed (only in development)
if [ "$NODE_ENV" = "development" ]; then
  echo "🌱 Seeding database..."
  cd /app/backend && npm run db:seed || echo "Seeding skipped or failed"
fi

echo "🎯 Starting services..."

# Start backend server in background
echo "🔧 Starting backend server..."
cd /app/backend
node dist/server.js &
BACKEND_PID=$!

# Start frontend server in background
echo "🎨 Starting frontend server..."
cd /app/frontend
npm start &
FRONTEND_PID=$!

# Function to handle shutdown
shutdown() {
  echo "🛑 Shutting down services..."

  if [ -n "$BACKEND_PID" ]; then
    echo "   Stopping backend server (PID: $BACKEND_PID)..."
    kill -TERM "$BACKEND_PID" 2>/dev/null || true
  fi

  if [ -n "$FRONTEND_PID" ]; then
    echo "   Stopping frontend server (PID: $FRONTEND_PID)..."
    kill -TERM "$FRONTEND_PID" 2>/dev/null || true
  fi

  # Wait for processes to terminate
  wait "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" 2>/dev/null || true

  echo "✅ Services stopped gracefully"
  exit 0
}

# Set up signal handlers
trap shutdown SIGTERM SIGINT

# Wait for health checks to pass
echo "🏥 Waiting for services to be healthy..."

# Wait for backend
while ! curl -f http://localhost:8000/health >/dev/null 2>&1; do
  echo "   Backend not ready yet, waiting..."
  sleep 2
done
echo "✅ Backend is healthy!"

# Wait for frontend
while ! curl -f http://localhost:3000/api/health >/dev/null 2>&1; do
  echo "   Frontend not ready yet, waiting..."
  sleep 2
done
echo "✅ Frontend is healthy!"

echo "🎉 Dyad Web Platform is ready!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Backend Health: http://localhost:8000/health"

# Keep the script running and wait for signals
wait