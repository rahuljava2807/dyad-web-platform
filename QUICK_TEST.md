# QUICK TEST - Follow These Exact Steps

## Step 1: Open Your Browser
1. Open **Chrome** (NOT Safari)
2. Press `Cmd + Shift + R` to hard refresh (clears cache)
3. Go to: **http://localhost:3000/dashboard/yavi-studio/builder-v3**

## Step 2: What You Should See

### Left Panel:
```
┌─────────────────────────────┐
│ 🌟 AI Application Builder   │
│ Describe your application   │
├─────────────────────────────┤
│ Select Industry             │
│ [Choose an industry... ▼]   │
├─────────────────────────────┤
│ [Large text area]           │
│                             │
│                             │
├─────────────────────────────┤
│ [Generate Application] 🔵   │
└─────────────────────────────┘
```

### Middle Panel:
```
┌─────────────────────────────┐
│ 📁 File Structure           │
│ 0 files generated           │
│                             │
│ (empty for now)             │
└─────────────────────────────┘
```

### Right Panel:
```
┌─────────────────────────────┐
│ 🖥️ Live Preview             │
│ [Desktop][Tablet][Mobile]   │
├─────────────────────────────┤
│                             │
│ No Preview Available        │
│ Start by entering a prompt  │
│                             │
└─────────────────────────────┘
```

**❓ Do you see these 3 panels?**
- YES → Continue to Step 3
- NO → Open Chrome DevTools (F12), take screenshot of Console tab, STOP

## Step 3: Select Industry
1. Click the "**Select Industry**" dropdown
2. Click "**Legal**"

**What should happen:**
- Dropdown now shows "Legal"
- **Below** the dropdown, you should see "Quick Templates" section appear
- 3 template buttons should show

**❓ Do you see Quick Templates appear?**
- YES → Continue to Step 4
- NO → Take screenshot, open Console (F12), STOP

## Step 4: Click a Template
1. Click the **FIRST** template button (should say something about "contract analyzer")

**What should happen:**
- The big text area fills with template text
- Text should be visible (black text on white background)

**❓ Did the text area fill with text?**
- YES → Continue to Step 5
- NO → Type this manually:
  ```
  Create a legal contract analyzer dashboard
  ```

## Step 5: Click Generate
1. Scroll down in left panel
2. Find blue "**Generate Application**" button
3. Click it

**What should happen IMMEDIATELY:**
- Button changes to gray
- Text changes to "Generating..."
- You see a spinner/loading animation

**❓ Did button change to "Generating..."?**
- YES → Continue to Step 6
- NO → Open Console (F12), click button again, check for errors, STOP

## Step 6: Watch Middle Panel (10-15 seconds)
**What should happen:**
- Middle panel updates
- You see "1 file" then "2 files" then "3 files" etc
- File names appear like:
  - `📄 src/Dashboard.tsx`
  - `📄 package.json`
  - `📄 README.md`

**❓ Do you see files appearing?**
- YES → Continue to Step 7
- NO → Wait 30 seconds total. Still nothing? Open Console (F12), STOP

## Step 7: Approval Modal Appears
**A popup/modal should appear** over the page with:
- Title: "Review Generated Application"
- List of files (3-5 files)
- Code preview on right
- Two buttons at bottom: "Regenerate" and "Approve"

**❓ Did the modal appear?**
- YES → Continue to Step 8
- NO → Check Console (F12) for errors, STOP

## Step 8: Click Approve
1. In the modal, click the blue "**Approve**" button

**What should happen:**
- Modal closes
- Middle panel shows complete file tree
- Right panel shows "Generating preview..." message
- After 2-3 seconds, an iframe appears

**❓ Did preview panel change?**
- YES → Continue to Step 9
- NO → STOP, check Console

## Step 9: Check Preview
**Right panel should show:**
- An iframe (rectangle area)
- Inside it: A working dashboard application
- Should have colors, cards, buttons (not blank white)

**❓ What do you see in right panel?**
- A. Working dashboard with UI elements → ✅ SUCCESS!
- B. Blank white rectangle → See Troubleshooting Below
- C. Error message → See Troubleshooting Below
- D. Still says "No Preview Available" → See Troubleshooting Below

---

## TROUBLESHOOTING

### If Step 1 Fails (Blank Page):
**Open Console (F12)**:
```javascript
// Type this and press Enter
console.log('Test')
```

If you see "Test" in console → Frontend is running but page is broken
If console doesn't work → Browser issue

**Fix**:
```bash
# In terminal:
lsof -ti:3000 | xargs kill -9
cd frontend
rm -rf .next
npm run dev
```

### If Step 3-4 Fails (No Templates):
**Console Check**:
```javascript
// Should see the industry change
console.log('Templates should appear now')
```

**Issue**: React rendering problem

**Fix**: Hard refresh (Cmd+Shift+R)

### If Step 6 Fails (No Files Generated):
**Console should show**:
```
Starting file: src/Dashboard.tsx
Completed file: src/Dashboard.tsx
...
```

**If you don't see these logs**:
- Generation service not working
- Check console for errors

**Manual Check**:
```javascript
// In console:
localStorage.getItem('project-store')
```

Should show JSON with project data. If null → Generation failed.

### If Step 9B (Blank Preview):
**Console Check**:
```javascript
// Check iframe
const iframe = document.querySelector('iframe');
console.log('Iframe exists:', !!iframe);
console.log('Iframe src:', iframe?.src);
```

**Should see**:
```
Iframe exists: true
Iframe src: blob:http://localhost:3000/[random-id]
```

**If src is empty** → Preview generation failed

**If src starts with blob** but blank → Check Console for errors in iframe

**Fix**:
1. Click the Refresh button in preview panel
2. Check Console for "Preview generation error"

### If Step 9D (Still "No Preview Available"):
**Means**: Status didn't change to 'approved'

**Check**:
```javascript
// In console
localStorage.getItem('project-store')
```

Look for `"status":"approved"` in the output

**If status is not "approved"** → Approval didn't work

**Fix**: Click Approve button again

---

## SUCCESS = All These Visible:

1. ✅ Three panels (Left, Middle, Right)
2. ✅ Industry dropdown working
3. ✅ Templates appearing
4. ✅ Generate button works
5. ✅ Files appear in middle panel
6. ✅ Approval modal shows
7. ✅ Preview iframe appears
8. ✅ Preview shows actual UI (not blank)

## If Any Fail:

**Provide me**:
1. Which step failed (number)
2. Screenshot of the page
3. Screenshot of Console (F12 > Console tab)
4. Console errors (copy all red text)

---

## Console Commands Reference

Open Console (F12) and try these:

### Check if page loaded:
```javascript
console.log('Builder page loaded:', window.location.pathname);
```

### Check if services loaded:
```javascript
console.log('Generation service exists:', typeof generationService);
```

### Check project state:
```javascript
const store = JSON.parse(localStorage.getItem('project-store') || '{}');
console.log('Current project:', store.state?.currentProject);
console.log('Files:', store.state?.currentProject?.files);
```

### Force preview refresh:
```javascript
document.querySelector('[title="Refresh Preview"]')?.click();
```

### Check iframe:
```javascript
const iframe = document.querySelector('iframe');
console.log({
  exists: !!iframe,
  src: iframe?.src,
  width: iframe?.offsetWidth,
  height: iframe?.offsetHeight
});
```
