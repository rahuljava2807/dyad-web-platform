# Testing Without Database

The Dyad Web Platform can be tested without PostgreSQL for many features. This guide explains what works and what doesn't.

## ✅ What Works Without Database

### 1. Yavi Studio (Builder v3)
**URL**: http://localhost:3000/dashboard/yavi-studio

**Features Available**:
- ✅ Application generation from prompts
- ✅ Code review and editing
- ✅ Live preview generation
- ✅ Device mode switching (Desktop/Tablet/Mobile)
- ✅ Console output monitoring
- ✅ Export generated code

**How to Test**:
1. Navigate to Yavi Studio
2. Enter a prompt like: "Create a landing page for a SaaS product with pricing tiers"
3. Click "Generate Application"
4. Review the generated code
5. Approve to see live preview

### 2. Widget Library
**URL**: http://localhost:3000/dashboard/yavi-studio/widgets

**Features Available**:
- ✅ Browse all 4 industry widget libraries
  - Legal (Contract Analyzer)
  - Construction (Project Dashboard)
  - Healthcare (Patient Insights)
  - Financial (Invoice Processor)
- ✅ View widget previews
- ✅ See code examples
- ✅ Test widget functionality (with mock data)

**How to Test**:
1. Navigate to Widget Library
2. Select an industry (Legal, Construction, Healthcare, Financial)
3. View widget cards with descriptions
4. Click on widgets to see detailed previews and code

### 3. Settings Page
**URL**: http://localhost:3000/dashboard/settings

**Features Available**:
- ✅ View settings UI
- ✅ API key management interface
- ⚠️ API keys won't persist (database required)

### 4. Mock Yavi.ai Endpoints
All Yavi.ai integration endpoints work with mock data:

- ✅ `/api/yavi-mock/namespaces/:id`
- ✅ `/api/yavi-mock/documents/upload`
- ✅ `/api/yavi-mock/documents/process`
- ✅ `/api/yavi-mock/documents/:id`
- ✅ `/api/yavi-mock/documents/search`

## ❌ What Requires Database

### 1. Project Creation
**URL**: http://localhost:3000/dashboard/projects/new

**What Happens**:
- Attempting to create a project will show an error message
- Error: "Database unavailable"
- Helpful message: "You can still use Yavi Studio and Widget Library without creating projects"

### 2. Project List
**URL**: http://localhost:3000/dashboard/projects

**What Happens**:
- Page loads but shows empty project list
- No error shown (graceful degradation)
- Message: "No projects yet"

### 3. API Key Persistence
**What Happens**:
- API keys can be entered in the UI
- Keys are not saved between sessions
- Keys stored only in memory/localStorage

## 🎯 Recommended Testing Workflow

### Without Database (Current Setup)

1. **Start with Yavi Studio**
   ```
   http://localhost:3000/dashboard/yavi-studio
   ```
   - Test application generation
   - Verify preview works
   - Check code quality

2. **Explore Widget Library**
   ```
   http://localhost:3000/dashboard/yavi-studio/widgets
   ```
   - Test all 4 industry widgets
   - Verify mock data displays correctly
   - Check widget code examples

3. **Test UI/CSS Fixes**
   - Verify button text is visible
   - Check no text is hidden behind backgrounds
   - Test responsive design at different sizes

### With Database (Optional)

If you want to test project creation:

1. **Start PostgreSQL**:
   ```bash
   docker run --name dyad-postgres \
     -e POSTGRES_USER=dyad_user \
     -e POSTGRES_PASSWORD=dyad_local_password \
     -e POSTGRES_DB=dyad_platform \
     -p 5433:5432 \
     -d postgres:15
   ```

2. **Run Prisma Migration**:
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Restart Backend**:
   The server will automatically connect to the database

4. **Test Project Creation**:
   - Navigate to http://localhost:3000/dashboard/projects/new
   - Create a new project
   - Projects will now persist

## 🔍 Current Server Status

### Backend Server
- **Port**: 5001 ✅
- **Status**: Running
- **Database**: Not required for most features
- **Health Check**: http://localhost:5001/health

**Error Handling**:
- `/api/projects` returns empty array (no error)
- `/api/projects` (POST) returns helpful error message

### Frontend Server
- **Port**: 3000 ✅
- **Status**: Running
- **URL**: http://localhost:3000

## 🧪 Testing Checklist

### Phase 4 Features (No Database Required)

- [ ] **Yavi Studio Application Generation**
  - [ ] Enter prompt and generate app
  - [ ] Review generated code
  - [ ] See syntax highlighting
  - [ ] Preview in iframe
  - [ ] Test device modes

- [ ] **Widget Library**
  - [ ] Legal - Contract Analyzer loads
  - [ ] Construction - Project Dashboard loads
  - [ ] Healthcare - Patient Insights loads
  - [ ] Financial - Invoice Processor loads
  - [ ] Widget previews display correctly
  - [ ] Code examples are visible

- [ ] **CSS/UI Fixes**
  - [ ] All button text is visible
  - [ ] No text hidden behind backgrounds
  - [ ] Proper z-index layering
  - [ ] Text contrast is readable

- [ ] **Preview System**
  - [ ] Preview generates successfully
  - [ ] Preview iframe loads
  - [ ] Device switching works
  - [ ] Console shows logs
  - [ ] Error handling displays properly

### Features Requiring Database

- [ ] **Project Management**
  - [ ] Shows helpful error when creating project
  - [ ] Project list shows empty (no error)
  - [ ] Doesn't crash when database unavailable

## 💡 Tips

1. **Focus on Yavi Studio**: This is the flagship feature and works completely without database

2. **Widget Library is Fully Functional**: All widgets use mock data from the backend

3. **Preview System is New**: This was just created and should be thoroughly tested

4. **Database is Optional**: Only needed for project persistence

## 🐛 If You Encounter Issues

### Preview Not Showing
1. Check browser console for errors
2. Verify both servers are running (3000 and 5001)
3. Check Network tab for failed requests
4. Look at the Console panel in Live Preview

### Button Text Still Hidden
1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Clear browser cache
3. Check DevTools for CSS conflicts

### Backend Errors
1. Check backend console output: `BashOutput e71eec`
2. Verify port 5001 is available
3. Check CORS settings allow localhost:3000

## 📝 Error Messages

### Database Unavailable (Expected)
```
Database is not running. You can still use Yavi Studio and Widget Library without creating projects.
```
This is normal and expected. You can ignore it and use other features.

### Preview Generation Failed
```
Failed to generate preview: [error details]
```
Check the "Retry Preview" button and browser console for more details.

## 🎉 Success Criteria

You've successfully tested the platform when:

1. ✅ Yavi Studio generates applications with previews
2. ✅ All 4 widget categories display correctly
3. ✅ Button text is visible throughout the UI
4. ✅ Preview system works (or shows clear errors)
5. ✅ No breaking errors in browser console
6. ✅ Database absence doesn't crash the app

## Next Steps

After successful testing:
- Set up PostgreSQL to enable project persistence
- Configure real Yavi.ai API keys (optional)
- Deploy to production environment
- Set up automated testing
