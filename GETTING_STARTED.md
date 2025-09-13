# 🚀 Dyad Web Platform - Complete Getting Started Guide

## Overview

Dyad Web Platform is a complete web-based development environment for building AI-powered applications with Yavi.ai integration. This guide will get you from zero to a fully functional development environment in under 10 minutes.

## ✨ What You'll Have After Setup

- **Web Dashboard**: Full project management interface at `http://localhost:3000/dashboard`
- **Code Editor**: Monaco-based editor with syntax highlighting and IntelliSense
- **Yavi.ai Ready**: Pre-configured templates for document processing and AI workflows
- **No Authentication**: Direct access to all features for local development
- **Sample Projects**: Pre-loaded horizontal business solution templates

---

## 🎯 Quick Start (5 Minutes)

### Prerequisites
- **Docker Desktop** (running)
- **Node.js 18+**
- **Git**

### Installation Commands

```bash
# 1. Clone repository
git clone https://github.com/your-org/dyad-web-platform.git
cd dyad-web-platform

# 2. Install dependencies
npm install --legacy-peer-deps
cd backend && npm install --legacy-peer-deps
cd ../frontend && npm install --legacy-peer-deps
cd ..

# 3. Start Docker services
docker-compose -f docker-compose.local.yml up -d

# 4. Setup database
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 5. Start servers (use 2 terminals)
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd ../frontend
npm run dev
```

### 🎉 Access Your Platform

Open your browser: **http://localhost:3000/dashboard**

---

## 📋 Detailed Setup Instructions

### Step 1: Environment Setup

**Install Prerequisites:**
- [Docker Desktop](https://docker.com/products/docker-desktop) - Container platform
- [Node.js 18+](https://nodejs.org) - JavaScript runtime
- [Git](https://git-scm.com) - Version control

**Verify Installation:**
```bash
docker --version
node --version
npm --version
git --version
```

### Step 2: Project Setup

**Clone and Install:**
```bash
# Clone repository
git clone https://github.com/your-org/dyad-web-platform.git
cd dyad-web-platform

# Install root dependencies
npm install --legacy-peer-deps

# Install backend dependencies
cd backend
npm install --legacy-peer-deps

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
cd ..
```

### Step 3: Infrastructure Services

**Start Docker Services:**
```bash
# Ensure Docker Desktop is running first!
docker-compose -f docker-compose.local.yml up -d

# Verify services are running
docker ps
```

**Services Started:**
- PostgreSQL (Database) - Port 5433
- Redis (Cache) - Port 6380
- MinIO (File Storage) - Port 9000/9001

### Step 4: Database Initialization

**Setup Database:**
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed with sample data
npx prisma db seed
```

**What Gets Created:**
- Database schema with all tables
- Sample user accounts (no passwords needed)
- 3 pre-configured projects with horizontal solution templates
- Sample files and configurations

### Step 5: Start Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## 🎯 First Steps After Setup

### 1. Access Dashboard
Navigate to: **http://localhost:3000/dashboard**
- No login required for local development
- View sample projects and templates
- Explore the interface

### 2. Create Your First Project
1. Click **"New Project"**
2. Choose a **Horizontal Solution** template:
   - Document Intelligence Hub ($2.4M annual savings)
   - Data Integration Hub ($1.8M annual value)
   - AI Workflow Orchestrator ($3.2M annual savings)
3. Enter project details
4. Click **"Create Project"**

### 3. Explore the Code Editor
- Browse project files in the sidebar
- Edit code with Monaco editor (VS Code-like experience)
- Syntax highlighting for multiple languages
- Auto-save functionality

### 4. Configure Yavi.ai Integration
- Go to project settings
- Add Yavi.ai API key (use "test-api-key-123" for local testing)
- Explore pre-built integration templates

---

## 🌟 Key Features Available

### Web Dashboard
- **Project Management**: Create, edit, delete projects
- **File Explorer**: Browse and organize project files
- **Template Library**: Horizontal business solutions
- **Settings**: Configure integrations and preferences

### Code Editor
- **Monaco Editor**: Full VS Code editing experience
- **Syntax Highlighting**: JavaScript, TypeScript, Python, and more
- **IntelliSense**: Code completion and error detection
- **Multi-file Support**: Work with multiple files simultaneously

### Yavi.ai Integration
- **Document Processing**: Contract analysis, invoice processing
- **Data Integration**: Connect to 60+ data sources
- **Workflow Automation**: Build intelligent business processes
- **AI Capabilities**: Leverage Yavi.ai's AI models

### Business Templates
- **Document Intelligence Hub**: Universal document processing
- **Data Integration Hub**: Connect any system to any system
- **AI Workflow Orchestrator**: Intelligent automation platform
- **Knowledge Management**: Searchable organizational intelligence

---

## 🛠️ Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Use different port
PORT=3002 npm run dev
```

**Docker Not Running:**
- Open Docker Desktop application
- Wait for it to fully start
- Try docker-compose command again

**Database Connection Issues:**
```bash
# Restart Docker services
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d

# Check container logs
docker logs dyad-postgres-local
```

**Dependency Installation Errors:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Reset Everything
```bash
# Stop all services
docker-compose -f docker-compose.local.yml down -v

# Clean installations
rm -rf node_modules backend/node_modules frontend/node_modules
rm -rf package-lock.json backend/package-lock.json frontend/package-lock.json

# Start over from step 1
```

---

## 🔗 Service URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main application |
| **Dashboard** | http://localhost:3000/dashboard | Development interface |
| **Backend API** | http://localhost:5000 | REST API endpoints |
| **PostgreSQL** | localhost:5433 | Database (postgres/postgres123) |
| **Redis** | localhost:6380 | Cache and sessions |
| **MinIO Console** | http://localhost:9001 | File storage admin |

---

## 📚 Next Steps

### Learn the Platform
1. **Browse Documentation**: http://localhost:3000/docs
2. **API Reference**: http://localhost:3000/docs/api
3. **Template Examples**: http://localhost:3000/docs/examples
4. **Yavi.ai Integration Guide**: http://localhost:3000/docs/yavi

### Start Building
1. **Create Projects**: Use horizontal solution templates
2. **Edit Code**: Leverage the Monaco editor
3. **Configure Yavi**: Set up AI-powered workflows
4. **Deploy Applications**: Build production-ready solutions

### Get Support
- **Documentation**: Comprehensive guides and references
- **Community**: Join discussions and get help
- **Yavi.ai Support**: Direct integration assistance
- **GitHub Issues**: Report bugs and request features

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │
│   (Next.js)     │◄──►│   (Express.js)  │
│  Port: 3000     │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│     Docker      │    │    Yavi.ai      │
│   Services      │    │  Integration    │
│ Postgres/Redis  │    │      API        │
└─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 14, React 18, TailwindCSS, Monaco Editor
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL with Redis caching
- **Storage**: MinIO (S3-compatible)
- **Integration**: Yavi.ai APIs and SDKs

---

##  You're Ready!



**Start building at:** http://localhost:3000/dashboard

**Need help?** Check the documentation at: http://localhost:3000/docs

Happy building! 