# Complete Step-by-Step Testing Guide

## Prerequisites Check

### 1. Verify Servers Are Running

Open Terminal and check:

```bash
# Check backend (should be running on port 5001)
lsof -i :5001

# Check frontend (should be running on port 3000)
lsof -i :3000
```

**Expected Output**:
- Port 5001: node process running
- Port 3000: node process running

If not running, start them:

```bash
# Terminal 1 - Backend
cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/backend
npm run dev

# Terminal 2 - Frontend
cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/frontend
npm run dev
```

---

## STEP-BY-STEP TEST CASE

### Step 1: Open Application
1. Open Chrome or Firefox (NOT Safari - it has issues with some features)
2. Navigate to: `http://localhost:3000`
3. You should see the Dyad Platform login/dashboard

**Screenshot Check Point 1**: Take screenshot if you see a blank page

### Step 2: Navigate to Yavi Studio
1. In the browser, go to: `http://localhost:3000/dashboard/yavi-studio/builder-v3`
2. Wait for page to load (should take 2-3 seconds)

**What You Should See**:
- **Left Panel**: Dropdown for "Select Industry" + text area for prompt
- **Middle Panel**: "File Structure" header (will be empty initially)
- **Right Panel**: "Live Preview" header with device mode buttons

**Screenshot Check Point 2**: Take screenshot of the initial Builder v3 page

---

### Step 3: Select Industry
1. Look at the **left panel**
2. Find the dropdown that says "Select Industry"
3. Click on it
4. Select "**Legal**"

**What You Should See**:
- Dropdown changes to show "Legal"
- Below it, "Quick Templates" section should appear with 3 template options

**Screenshot Check Point 3**: Take screenshot after selecting Legal

---

### Step 4: Use a Quick Template (Recommended for Testing)
1. In the "Quick Templates" section, you should see buttons with text like:
   - "Create a contract analyzer that extracts key terms and obligations"
   - "Build a case management system with document search"
   - "Generate a compliance checker for legal documents"

2. **Click on the FIRST template** (Contract analyzer)

**What You Should See**:
- The text area above should auto-fill with the template text
- The text should appear in the "Describe your application" box

**Screenshot Check Point 4**: Take screenshot showing filled text area

**IF YOU DON'T SEE TEMPLATES**: Type this manually in the text area:
```
Create a contract analyzer dashboard that extracts key terms and obligations from legal documents
```

---

### Step 5: Generate Application
1. Look for the "**Generate Application**" button at the bottom of the left panel
2. It should be a blue/purple gradient button
3. Click it

**What Should Happen**:
- Button becomes disabled and shows "Generating..."
- You'll see a loading spinner
- Status message appears: "Generating your application..."

**Screenshot Check Point 5**: Take screenshot of generating state

**Timing**: This should take **10-15 seconds**

---

### Step 6: Watch Generation Progress
During generation, you should see:

1. **Middle Panel (File Tree)**:
   - Files appearing one by one
   - You'll see entries like:
     - `src/`
     - `src/Dashboard.tsx`
     - `src/components/`
     - `package.json`
     - etc.

2. **Progress Indicator**:
   - "Generating file 1 of 5..."
   - "Generating file 2 of 5..."
   - etc.

**Screenshot Check Point 6**: Take screenshot showing files being generated

---

### Step 7: Approval Modal
When generation completes:

1. **A modal/popup should appear** with:
   - Title: "Review Generated Application"
   - List of all generated files
   - Code preview of first file
   - Two buttons: "Approve" and "Regenerate"

**What You Should See in Modal**:
```
✓ Generated 5 files
- src/Dashboard.tsx
- src/components/ContractCard.tsx
- package.json
- README.md
- tailwind.config.js
```

**Screenshot Check Point 7**: Take screenshot of approval modal

2. **Click the "Approve" button**

---

### Step 8: Live Preview Should Appear
After clicking Approve:

1. **Middle Panel (File Tree)**:
   - Should show complete file tree
   - All files should be listed with folder icons and file icons
   - Each file should have a green "New" tag

2. **Right Panel (Live Preview)**:
   - Loading spinner appears
   - Message: "Generating preview..."
   - Then: An **iframe** should appear showing the actual application

**What Preview Should Show**:
- A working React application
- For Legal/Contract Analyzer: You should see:
  - Dashboard header
  - Cards or sections for contracts
  - Buttons and UI elements
  - Tailwind CSS styling applied (colors, rounded corners, shadows)

**Screenshot Check Point 8**: Take screenshot of the live preview

---

### Step 9: Test Preview Features
1. **Device Mode Buttons** (top right of preview panel):
   - Click the tablet icon - preview should resize to tablet size
   - Click the mobile icon - preview should resize to mobile size
   - Click the desktop icon - preview should go back to full width

2. **Console Button** (terminal icon):
   - Click it - a console panel should open at bottom
   - Should show logs like:
     ```
     [timestamp] Generating preview...
     [timestamp] Preview generated successfully (5 files bundled)
     ```

3. **Refresh Button**:
   - Click the refresh icon
   - Preview should reload

4. **Open in New Tab**:
   - Click the external link icon
   - A new browser tab should open with the preview

**Screenshot Check Point 9**: Take screenshot with console open

---

## Detailed Troubleshooting

### Issue 1: Blank Page After Step 2
**Possible Causes**:
- Frontend not running
- JavaScript error
- Browser cache issue

**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Take screenshot and share errors

**Quick Fix**:
```bash
# Hard refresh the page
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

---

### Issue 2: "Generate Application" Button Not Working
**Symptoms**: Button doesn't respond when clicked

**Check**:
1. Open DevTools Console (F12)
2. Click the button
3. Look for errors

**Common Error**:
```
GenerationService is not defined
```

**Solution**: Check if file exists:
```bash
ls -la frontend/src/services/GenerationService.ts
```

---

### Issue 3: No Files Appear in Middle Panel
**Symptoms**: Generation completes but file tree is empty

**Check Console For**:
```javascript
console.log('Files:', files);
```

**Debug Steps**:
1. Open DevTools Console
2. Type: `localStorage.getItem('project-store')`
3. Should show JSON with project data

**If Empty**: Generation service might not be working

---

### Issue 4: No Preview Appears
**Symptoms**:
- Files generated successfully
- Approval modal worked
- But right panel is blank or shows "No Preview Available"

**Check 1 - Console Errors**:
```
Preview generation error: [error message]
```

**Check 2 - Network Tab**:
1. Open DevTools > Network
2. Look for failed requests
3. Check if there's a request to `/api/preview/generate`

**Check 3 - Preview Service**:
```bash
# Verify file exists
ls -la frontend/src/services/PreviewService.ts
```

**Check 4 - Blob URL**:
In console, type:
```javascript
// Should show blob URL
document.querySelector('iframe')?.src
```

---

### Issue 5: Preview Shows But Is Blank
**Symptoms**: iframe appears but shows white/blank content

**Check Iframe Content**:
1. Right-click on preview area
2. Select "Inspect"
3. Find the `<iframe>` element
4. Check its `src` attribute (should start with `blob:`)

**Debug in Console**:
```javascript
// Get the iframe
const iframe = document.querySelector('iframe');

// Check if it has a src
console.log('Iframe src:', iframe?.src);

// Try to access iframe content (might be blocked by CORS)
console.log('Iframe document:', iframe?.contentDocument);
```

**Common Issue**: Blob URL not created properly

**Solution**:
1. Check browser console for "Failed to generate preview" errors
2. Verify PreviewService.ts is correctly imported
3. Check that files array has content

---

## Console Commands for Debugging

Open browser console (F12) and run these:

### Check if Files Were Generated:
```javascript
// In the builder page console
console.log('Files:', JSON.parse(localStorage.getItem('project-store')));
```

### Check Preview URL:
```javascript
const iframe = document.querySelector('iframe');
console.log('Preview URL:', iframe?.src);
console.log('Preview exists:', !!iframe);
```

### Check if Preview Service Loaded:
```javascript
// This will error if not imported
typeof PreviewService !== 'undefined'
```

### Force Regenerate Preview:
```javascript
// Find the refresh button and click it
document.querySelector('[title="Refresh Preview"]')?.click();
```

---

## Expected Console Output (Normal Flow)

When everything works, console should show:

```javascript
// During generation
Starting file: src/Dashboard.tsx
Completed file: src/Dashboard.tsx
Starting file: package.json
Completed file: package.json
Generation complete: 5 files

// During preview
[12:34:56] Generating preview...
[12:34:56] Preview generated successfully (5 files bundled)
```

---

## Quick Verification Checklist

Before testing, verify these files exist:

```bash
cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/frontend

# Check critical files
ls -la src/services/GenerationService.ts
ls -la src/services/PreviewService.ts
ls -la src/components/Builder/PromptInterface.tsx
ls -la src/components/Builder/FileTreeVisualizer.tsx
ls -la src/components/Builder/LivePreviewPanel.tsx
ls -la src/components/Builder/ApprovalModal.tsx
```

All should exist. If any are missing, that's the problem.

---

## Alternative Test: Simple Generation

If the full flow doesn't work, try this minimal test:

### Minimal Test Case

1. Go to: `http://localhost:3000/dashboard/yavi-studio/builder-v3`

2. In the text area, type:
```
Create a simple dashboard with a header and two cards
```

3. Select industry: "Financial"

4. Click "Generate Application"

5. Wait 10 seconds

6. **Expected**:
   - Approval modal appears
   - Shows 3-5 files generated
   - Click Approve
   - Preview shows a simple dashboard

**If This Doesn't Work**: There's a fundamental issue with the generation service.

---

## What to Share If Issues Persist

Please provide:

1. **Screenshots from ALL Check Points** (numbered 1-9 above)

2. **Console Output**:
   - Open DevTools > Console
   - Copy ALL red errors
   - Copy ALL logs

3. **Network Tab**:
   - Open DevTools > Network
   - Filter by "Fetch/XHR"
   - Show any failed requests (red)

4. **File Check**:
```bash
cd frontend
find src -name "*.tsx" | grep -E "(Generation|Preview|Builder)" | sort
```

5. **Browser & Version**:
   - Chrome 120+
   - Firefox 120+
   - NOT Safari (has issues)

---

## Success Criteria

✅ **You've successfully tested when**:

1. ✅ Industry dropdown works and shows templates
2. ✅ Template text fills the text area
3. ✅ "Generate Application" button shows loading state
4. ✅ Files appear in middle panel one by one
5. ✅ Approval modal shows up with file list
6. ✅ After approve, preview iframe appears
7. ✅ Preview shows actual React application UI (not blank)
8. ✅ Device mode buttons resize the preview
9. ✅ Console shows generation logs
10. ✅ Can open preview in new tab

If ALL 10 work ✅ = System is working perfectly!

If ANY fail ❌ = Take screenshots and share console errors

---

## Emergency: Nothing Works

If absolutely nothing works:

```bash
# Stop everything
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9

# Clear Next.js cache
cd frontend
rm -rf .next

# Restart
npm run dev

# In new terminal
cd ../backend
npm run dev
```

Then try the Minimal Test Case again.
