# 🚀 Start Servers - Clean Instructions

## Issue Fixed
The backend was having tsx watch conflicts from multiple instances. This has been cleaned up.

## Start Servers Cleanly

### Option 1: In Cursor (Recommended)

**Backend Terminal**:
1. Open a new terminal in Cursor
2. Navigate to backend folder:
   ```bash
   cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/backend
   ```
3. Start backend:
   ```bash
   npm run dev
   ```
4. Wait for: `🚀 Backend server running on port 5001`

**Frontend Terminal**:
1. Open another terminal in Cursor
2. Navigate to frontend folder:
   ```bash
   cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/frontend
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```
4. Wait for: `✓ Ready in ... - Local: http://localhost:3000`

### Option 2: Quick Command

From the project root:

```bash
# Kill any existing processes
pkill -f "tsx watch" && pkill -f "next dev"

# Start backend (in background)
cd backend && npm run dev &

# Start frontend (in new terminal or background)
cd frontend && npm run dev
```

## Verify Servers Running

```bash
# Check backend (should show port 5001)
lsof -i :5001

# Check frontend (should show port 3000)
lsof -i :3000
```

## Access the Application

Once both servers are running:

**Main Dashboard**:
```
http://localhost:3000/dashboard
```

**Builder v3 (Test Enhanced Prompts)**:
```
http://localhost:3000/dashboard/yavi-studio/builder-v3
```

## If You See tsx Errors

If you see repeated "Force killing..." messages:

1. **Stop the terminal** (Ctrl+C)
2. **Clean up processes**:
   ```bash
   pkill -f "tsx watch"
   lsof -ti:5001 | xargs kill -9
   ```
3. **Start fresh**:
   ```bash
   cd backend
   npm run dev
   ```

## Success Indicators

**Backend Ready**:
```
🚀 Backend server running on port 5001
📱 Health check: http://localhost:5001/health
🔗 API endpoint: http://localhost:5001/api
🌐 Frontend: http://localhost:3000
```

**Frontend Ready**:
```
▲ Next.js 14.2.32
- Local:        http://localhost:3000
✓ Ready in ...ms
```

## Now Test Enhanced Prompts!

1. Go to: http://localhost:3000/dashboard/yavi-studio/builder-v3
2. Select "Legal" industry
3. Enter: "Create a contract analyzer dashboard"
4. Generate and compare with previous basic output
5. Expected: 8-12 files with beautiful components!

---

**Status**: Servers cleaned and ready to start fresh! ✅
