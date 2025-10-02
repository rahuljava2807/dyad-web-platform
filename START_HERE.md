# 🚀 START HERE - Quick Testing Guide

**Status**: ✅ All fixes applied - Ready for testing
**Servers**: ✅ Both running (frontend:3000, backend:5001)

---

## 📋 Quick Visual Checklist

### Step 1: Open Browser
1. Open **Chrome** (NOT Safari)
2. Press `Cmd + Shift + R` to hard refresh
3. Go to: http://localhost:3000/dashboard/yavi-studio/builder-v3

---

### Step 2: What You Should See

#### ✅ Header (Top Bar)
Look for these exact texts:
- [ ] "Yavi Studio" (in bold, left side)
- [ ] "by Nimbusnext" (gray text next to it)
- [ ] "Connected to Yavi.ai" (with green dot)
- [ ] "New Project" button (blue, right side)

**❓ Do you see all 4 items?**
- ✅ YES → Continue to Step 3
- ❌ NO → Take screenshot, share which items are missing

---

#### ✅ Sidebar (Left Panel)
Look for these exact texts:
- [ ] "INDUSTRY TEMPLATES" (heading)
- [ ] "Legal" (with briefcase icon)
- [ ] "Construction" (with building icon)
- [ ] "Healthcare" (with heart icon)
- [ ] "Financial" (with dollar icon)
- [ ] "RESOURCES" (heading)
- [ ] "Documentation" (with book icon)
- [ ] "Settings" (with gear icon)

**❓ Do you see all 8 items with text labels?**
- ✅ YES → Continue to Step 3
- ❌ NO → Take screenshot, note what's missing

---

### Step 3: Test Generation

1. **Select Industry**
   - Click the "Select Industry" dropdown
   - Choose "Legal"
   - You should see 3 template buttons appear below

2. **Click a Template**
   - Click the FIRST template button
   - Text area should fill with template text

3. **Generate Application**
   - Scroll down if needed
   - Click "Generate Application" button
   - Button should change to "Generating..."

4. **Watch Middle Panel**
   - Wait 10-15 seconds
   - You should see files appearing one by one:
     - `src/Dashboard.tsx`
     - `package.json`
     - `README.md`
     - etc.

5. **Approval Modal**
   - A popup should appear
   - Shows list of 5-7 files
   - Click "Approve" button

6. **Live Preview**
   - Right panel should show an iframe
   - Inside: A working React dashboard
   - NOT blank, NOT just text saying "Preview Generated"

---

## ✅ Success = All These Work

- [x] Text visible in header
- [x] Text visible in sidebar
- [x] Industry dropdown works
- [x] Templates appear and have visible text
- [x] Generate button works
- [x] Files appear in middle panel
- [x] Approval modal appears
- [x] Preview shows actual application (not blank)

---

## ❌ If Something Fails

### Text Not Visible
**Try**: Hard refresh → `Cmd + Shift + R`

### Preview Blank
**Check**: Open Console (F12), look for errors

### Button Not Working
**Check**: Console (F12) → Click button → Copy error

---

## 📸 What to Share If Issues

1. **Screenshot** of the page
2. **Screenshot** of Console (F12 → Console tab)
3. **Which step** failed (1, 2, or 3)
4. **What you see** vs. what you expected

---

## 📚 More Detailed Help

- **Quick Test**: See `QUICK_TEST.md` (15 minutes)
- **Detailed Test**: See `COMPLETE_TESTING_GUIDE.md` (30 minutes)
- **Emergency**: See `EMERGENCY_UI_FIXES.md`
- **Status**: See `SYSTEM_STATUS.md`

---

## 🔧 Emergency Commands

**If nothing works, restart everything:**

```bash
# Terminal 1
cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/frontend
lsof -ti:3000 | xargs kill -9
rm -rf .next
npm run dev

# Terminal 2
cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/backend
lsof -ti:5001 | xargs kill -9
npm run dev
```

Then hard refresh browser: `Cmd + Shift + R`

---

## 🎯 Expected Result

When working correctly, you'll see:

```
┌────────────────────────────────────────────────────────────────┐
│ [🔷] Yavi Studio  by Nimbusnext  🟢 Connected  [New Project]  │
├────────┬──────────────────────┬──────────────────────┬─────────┤
│ SIDEBAR│   LEFT PANEL         │  MIDDLE PANEL        │  RIGHT  │
│        │                      │                      │  PANEL  │
│ Legal  │ Industry: Legal ▼    │ 📁 File Structure    │ 🖥️ Live │
│ Const. │                      │                      │ Preview │
│ Health │ Quick Templates:     │ 📄 src/              │         │
│ Finan. │ • Contract analyzer  │ 📄 Dashboard.tsx     │ [IFRAME │
│        │ • Case management    │ 📄 package.json      │  shows  │
│ ──────│ • Compliance check   │ 📄 README.md         │  actual │
│ Docs   │                      │                      │   app]  │
│ Settgs │ [Text Area]          │                      │         │
│        │                      │                      │         │
│        │ [Generate App]       │                      │         │
└────────┴──────────────────────┴──────────────────────┴─────────┘
```

**All text should be black and clearly visible!**

---

**Start testing now with the checklist above** ⬆️
