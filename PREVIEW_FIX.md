# Preview Blank Screen - Fix Applied

## What Was Fixed

The preview was showing a blank screen because:
1. The PreviewService was using client-side blob URLs which had compatibility issues
2. The API route wasn't properly embedding generated component code
3. Import statements weren't being handled correctly

## Changes Made

### 1. Updated LivePreviewPanel.tsx
- Switched from client-side PreviewService to API route `/api/preview/generate`
- Now uses server-side preview generation
- Removed blob URL handling

### 2. Improved API Route `/api/preview/generate`
- Now embeds generated code **inline** instead of loading from separate files
- Properly handles React imports (converts to window.React)
- Extracts and replaces Lucide icon imports
- Exports components to window.App
- Includes fallback rendering if no component found

### 3. Better Component Detection
The API route now tries multiple component names:
- `App`
- `Dashboard`
- `Main`
- `Application`

If none found, it renders a styled fallback showing the generated files.

## Testing Steps

1. **Hard Refresh Browser**
   ```
   Mac: Cmd + Shift + R
   Windows: Ctrl + Shift + R
   ```

2. **Navigate to Builder**
   ```
   http://localhost:3000/dashboard/yavi-studio/builder-v3
   ```

3. **Generate Application**
   - Select "Legal" industry
   - Click first template
   - Click "Generate Application"
   - Wait for approval modal
   - Click "Approve"

4. **Check Preview**
   - Should now show actual React application
   - NOT blank screen
   - Should have UI elements, colors, cards

## What You Should See

### If Working Correctly:
```
┌─────────────────────────────────────────┐
│  Right Panel (Live Preview)             │
├─────────────────────────────────────────┤
│  🖥️ Live Preview                        │
│  [Desktop][Tablet][Mobile]  [↻][↗][≡]  │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  Actual React Application           │ │
│ │  with UI elements, colors, cards    │ │
│ │                                     │ │
│ │  NOT BLANK!                         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### If Still Blank (Check Console):

Open browser console (F12) and look for:

**Good Signs:**
```
Rendered component: App
Preview generated successfully
```

**Bad Signs:**
```
Failed to generate preview: [error message]
TypeError: Cannot read property...
```

## Debugging

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Generate Application"
4. Look for `/api/preview/generate` request
5. Check response:

**Should return:**
```json
{
  "url": "/previews/[uuid]/index.html",
  "sessionId": "[uuid]"
}
```

### Check Preview URL
In console, type:
```javascript
// Check if iframe exists and has src
const iframe = document.querySelector('iframe');
console.log('Iframe:', iframe);
console.log('Iframe src:', iframe?.src);
```

**Should show:**
```
Iframe: <iframe>...</iframe>
Iframe src: http://localhost:3000/previews/[uuid]/index.html
```

### Manually Check Generated HTML
Navigate directly to preview URL in new tab:
```
http://localhost:3000/previews/[uuid]/index.html
```

This will show you if the HTML was generated correctly.

## Common Issues

### Issue 1: Preview URL is empty
**Cause**: API route failed
**Fix**: Check console for error message, restart dev server

### Issue 2: Preview loads but shows fallback message
**Cause**: Component not exported correctly
**Console Output**:
```
Application Preview
Generated files loaded successfully.
Files: src/Dashboard.tsx, package.json, ...
```

**This means**: Files loaded but component didn't render
**Fix**: Check that generated code has `export default` for main component

### Issue 3: Babel/React errors in preview
**Console shows**:
```
ReferenceError: React is not defined
SyntaxError: Unexpected token <
```

**Cause**: Babel not transforming JSX correctly
**Fix**: Check that file is marked as `type="text/babel"`

## Files Modified

1. `frontend/src/components/Builder/LivePreviewPanel.tsx`
   - Removed PreviewService import
   - Changed to use API fetch

2. `frontend/src/app/api/preview/generate/route.ts`
   - Embeds code inline
   - Handles React/Lucide imports
   - Exports to window.App
   - Better component detection

## Next Steps

If preview is still blank after hard refresh:

1. **Check browser console for errors**
2. **Share console output**
3. **Check Network tab for failed requests**
4. **Try opening preview URL directly in new tab**

## Server Restart

If nothing works, restart the dev server:

```bash
# In frontend directory
cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/frontend

# Kill current server
lsof -ti:3000 | xargs kill -9

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

Then hard refresh browser: `Cmd + Shift + R`

---

**Status**: Preview fix applied. Hard refresh browser and test generation flow.
