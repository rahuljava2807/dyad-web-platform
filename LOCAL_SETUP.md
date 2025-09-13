# 🚀 Local Development Setup Guide

This guide will help you get the Dyad Web Platform running locally on your machine without any Azure dependencies.

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js 20+** ([Download here](https://nodejs.org/))
- **Docker & Docker Compose** ([Download here](https://www.docker.com/get-started/))
- **Git** ([Download here](https://git-scm.com/))

## 🛠️ Quick Start (5 minutes)

### 1. Start the Database & Services

```bash
# Navigate to the project directory
cd dyad-web-platform

# Start PostgreSQL, Redis, and MinIO (local S3)
docker-compose -f docker-compose.local.yml up -d

# Wait for services to start (about 30 seconds)
docker-compose -f docker-compose.local.yml logs -f
```

### 2. Set up Environment Variables

```bash
# Copy the local environment file
cp .env.local .env

# Copy for backend
cp .env.local backend/.env

# Copy for frontend
cp .env.local frontend/.env.local
```

### 3. Install Dependencies & Start Backend

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database (optional)
npx prisma db seed

# Start the backend server
npm run dev
```

The backend will start on [http://localhost:8000](http://localhost:8000)

### 4. Start Frontend (New Terminal)

```bash
# Go back to root and navigate to frontend
cd ../frontend

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on [http://localhost:3000](http://localhost:3000)

## 🎉 You're Ready!

Open your browser and go to [http://localhost:3000](http://localhost:3000)

You should see the Dyad Web Platform landing page!

---

## 🔧 Detailed Setup

### Local Services Overview

When you run `docker-compose -f docker-compose.local.yml up -d`, you get:

- **PostgreSQL** (port 5433) - Main database
- **Redis** (port 6380) - Caching and job queues
- **MinIO** (ports 9000, 9001) - S3-compatible file storage

### Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: postgresql://dyad_user:dyad_local_password@localhost:5433/dyad_platform
- **Redis**: redis://localhost:6380
- **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin123)
- **MinIO API**: http://localhost:9000

### Adding AI Provider API Keys

To use AI features, add your API keys to the `.env` file:

```bash
# Edit the .env file
nano .env  # or use your preferred editor

# Add your API keys (remove the # to uncomment)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```

### Database Management

```bash
# Access the database
docker exec -it dyad-postgres-local psql -U dyad_user -d dyad_platform

# View database in Prisma Studio
cd backend
npx prisma studio
# Opens http://localhost:5555
```

### File Storage (MinIO)

MinIO provides S3-compatible storage locally:

- **Console**: http://localhost:9001
- **Username**: minioadmin
- **Password**: minioadmin123

Files uploaded to the platform will be stored in the `dyad-files` bucket.

---

## 🧪 Testing the Platform

### 1. Create a User Account

1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Create an account with any email (no verification needed locally)

### 2. Create Your First Project

1. After logging in, click "New Project"
2. Choose a template (e.g., "Next.js AI Chat")
3. Give it a name and click "Create"

### 3. Try AI Code Generation

1. Open the project
2. Use the AI chat to ask for code generation
3. Example: "Create a simple todo list component"

**Note**: You'll need an AI provider API key for this to work.

### 4. Upload Files

1. Try uploading files to test the storage system
2. Files will be stored in MinIO (local S3)

---

## 🐛 Troubleshooting

### Common Issues

#### "Database connection failed"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart the database
docker-compose -f docker-compose.local.yml restart postgres

# Check logs
docker-compose -f docker-compose.local.yml logs postgres
```

#### "Redis connection failed"
```bash
# Check if Redis is running
docker ps | grep redis

# Restart Redis
docker-compose -f docker-compose.local.yml restart redis
```

#### "Port already in use"
```bash
# Check what's using the port
lsof -i :3000  # or :8000, :5433, etc.

# Kill the process or change ports in docker-compose.local.yml
```

#### "Module not found" errors
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Reset Everything

If you need to start fresh:

```bash
# Stop all services
docker-compose -f docker-compose.local.yml down -v

# Remove node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Start over
docker-compose -f docker-compose.local.yml up -d
npm install
cd backend && npm install && npx prisma migrate reset --force
cd ../frontend && npm install
```

---

## 🔄 Development Workflow

### Making Changes

1. **Backend changes**: The server will auto-restart when you save files
2. **Frontend changes**: The page will auto-reload when you save files
3. **Database changes**: Update `schema.prisma` then run `npx prisma migrate dev`

### Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npx prisma studio    # Open database GUI

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality

# Database
npx prisma migrate dev     # Create and apply new migration
npx prisma migrate reset   # Reset database
npx prisma db seed        # Seed with sample data
```

### Environment Configuration

The local setup uses these key configurations:

```bash
NODE_ENV=development
DATABASE_URL=postgresql://dyad_user:dyad_local_password@localhost:5433/dyad_platform
REDIS_URL=redis://localhost:6380
AWS_ENDPOINT=http://localhost:9000  # MinIO for file storage
```

---

## 🌟 What's Next?

Once you have the platform running locally:

1. **Explore the codebase** - Check out the architecture in `TECHNICAL_ARCHITECTURE.md`
2. **Add AI providers** - Get API keys and test code generation
3. **Try Yavi.ai integration** - If you have Yavi.ai access
4. **Customize the UI** - The frontend is fully customizable
5. **Deploy to production** - Follow the Azure deployment guide

---

## 🆘 Need Help?

- **Documentation**: Check the other `.md` files in this project
- **Issues**: Look at the browser console and server logs
- **Database**: Use Prisma Studio to inspect data
- **Files**: Use MinIO Console to check file uploads

The local setup is designed to be as simple as possible while maintaining full functionality of the production system!