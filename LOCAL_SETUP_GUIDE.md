# 🚀 Local Setup & Login Guide

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed
- Git installed

## Quick Start

### 1. Start Docker Services
```bash
# Make sure Docker Desktop is running first!
cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform

# Start local services (PostgreSQL, Redis, MinIO)
docker-compose -f docker-compose.local.yml up -d
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install --legacy-peer-deps

# Install backend dependencies
cd backend
npm install --legacy-peer-deps

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
```

### 3. Setup Database
```bash
cd ../backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with test users (optional but recommended)
npx prisma db seed
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000 (or 3002 if port 3000 is busy)

## 📱 Access the Application

Open your browser and go to: **http://localhost:3000**

## 🔐 Login Credentials

### Option 1: Use Test Accounts (if database was seeded)

| Account Type | Email | Password | Purpose |
|-------------|-------|----------|---------|
| **Admin** | admin@nimbusnext.com | Test@123 | Full admin access |
| **Developer** | developer@nimbusnext.com | Test@123 | Pre-loaded with sample projects |
| **Test User** | test@yavi.ai | Test@123 | Clean account for testing |

### Option 2: Create New Account

1. Click **"Get Started"** or **"Sign Up"** on the homepage
2. Fill in:
   - Name: Your Name
   - Email: Any email (e.g., yourname@nimbusnext.com)
   - Password: Any password (minimum 6 characters)
3. Click "Create Account"
4. You'll be automatically logged in

## 🎯 First Steps After Login

1. **Configure Yavi.ai Integration:**
   - Go to Settings (from Dashboard)
   - Enter your Yavi.ai API key (use "test-api-key-123" for local testing)
   - Test the connection

2. **Create Your First Project:**
   - Click "New Project" from Dashboard
   - Choose a Horizontal Solution template (recommended):
     - Document Intelligence Hub
     - Invoice Processing Automation
     - Contract Intelligence System
   - Enter project name and description
   - Click "Create Project"

3. **Explore the Code Editor:**
   - Open your project
   - Browse files in the sidebar
   - Edit code using the Monaco editor
   - Save changes with Ctrl+S or Cmd+S

## 🛠️ Troubleshooting

### Port Already in Use
If you see "Port 3000 is already in use":
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3002 npm run dev
```

### Docker Not Running
If you see "Docker is not running":
1. Open Docker Desktop application
2. Wait for it to fully start
3. Try the docker-compose command again

### Database Connection Issues
If you can't connect to the database:
```bash
# Check if PostgreSQL container is running
docker ps

# If not running, restart containers
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d

# Check logs
docker logs dyad-postgres-local
```

### npm Install Errors
If you get dependency errors:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps
```

## 📊 Local Service URLs

| Service | URL | Credentials |
|---------|-----|------------|
| **Frontend** | http://localhost:3000 | N/A |
| **Backend API** | http://localhost:5000 | N/A |
| **PostgreSQL** | localhost:5433 | user: postgres, pass: postgres123 |
| **Redis** | localhost:6380 | No auth |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |
| **MinIO API** | http://localhost:9000 | minioadmin / minioadmin123 |

## 🔄 Reset Everything

If you want to start fresh:
```bash
# Stop all services
docker-compose -f docker-compose.local.yml down -v

# Delete database
rm -rf backend/prisma/dev.db

# Clean installations
rm -rf node_modules backend/node_modules frontend/node_modules
rm -rf package-lock.json backend/package-lock.json frontend/package-lock.json

# Start over with step 1
```

## 📝 Environment Variables

The `.env.local` file contains all necessary configuration for local development:
- Database connection strings
- Redis URL
- MinIO (S3-compatible storage) settings
- JWT secrets
- API endpoints

These are already configured for local development and don't need changes.

## 🚀 Ready to Build!

Once logged in, you can:
1. Create projects using horizontal business solution templates
2. Write code in the integrated Monaco editor
3. Configure Yavi.ai integration
4. Test document processing workflows
5. Build production-ready applications

For detailed development guidance, click "View Documentation" on the homepage after logging in.

## 🤝 Need Help?

- Check the in-app documentation at http://localhost:3000/docs
- Review the code examples in the documentation
- Follow the 4-phase development workflow
- Use the pre-built use case templates for faster development

---

**Note:** This is a local development setup. For production deployment, you'll need to configure proper environment variables, SSL certificates, and cloud services.