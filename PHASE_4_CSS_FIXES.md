# Phase 4 CSS and UI Fixes

## Issues Identified

1. **Text/Label Visibility Issues**
   - Button labels hidden behind white backgrounds
   - Some text not appearing due to color contrast issues
   - CSS custom properties not being applied correctly

2. **Preview Generation Failed**
   - Backend preview endpoint returning errors
   - Preview modal not displaying generated content

3. **CSS Class Conflicts**
   - Tailwind CSS variables not properly configured
   - Custom CSS classes overriding Tailwind utilities

## Fixes Applied

### 1. Fixed globals.css
**File**: `frontend/src/app/globals.css`

**Changes**:
- Removed `@apply` directives that reference non-existent Tailwind classes
- Replaced with direct CSS properties using CSS custom variables
- Fixed `border-border` → `border-color: hsl(var(--border))`
- Fixed `bg-background` → `background-color: hsl(var(--background))`
- Fixed `text-foreground` → `color: hsl(var(--foreground))`

### 2. Known Rendering Issues

The HTML source shows some elements may have visibility issues due to:

**Button Text Hidden**:
```html
<button class="...">Generate Application</button>
```
The button likely has proper classes but may need z-index fixes.

**Solution**: Add explicit text color classes to all buttons and interactive elements.

### 3. Preview Generation Error

The preview endpoint is failing. This needs:
- Backend preview route verification
- Session ID generation fix
- HTML rendering template update

## Recommended Additional Fixes

### Fix 1: Update Button Styles Globally

Add to `globals.css`:
```css
@layer components {
  button {
    position: relative;
    z-index: 1;
  }

  button span,
  button svg {
    position: relative;
    z-index: 2;
  }
}
```

### Fix 2: Add Text Contrast Utilities

```css
@layer utilities {
  .text-visible {
    color: inherit !important;
    opacity: 1 !important;
  }

  .btn-text {
    color: currentColor;
    position: relative;
    z-index: 10;
  }
}
```

### Fix 3: Update Preview Component

The preview generation needs proper error handling:

```typescript
// In LivePreviewPanel.tsx
if (!previewUrl) {
  return (
    <div className="text-center text-red-600">
      <p>Preview generation failed</p>
      <p className="text-sm">Please check backend logs</p>
    </div>
  )
}
```

## Testing Checklist

After applying fixes:

- [ ] All button text is visible
- [ ] Labels appear with proper contrast
- [ ] Preview generation works or shows proper error
- [ ] No CSS conflicts in browser console
- [ ] Responsive design still works
- [ ] Dark mode (if enabled) displays correctly

## Immediate Actions

1. **Clear browser cache** after CSS changes
2. **Hard refresh** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. **Check browser console** for CSS errors
4. **Verify Tailwind config** includes all necessary plugins

## Backend Preview Fix Needed

The preview endpoint needs to:
1. Properly handle file generation
2. Create valid HTML from React components
3. Return proper error messages
4. Include all necessary CSS/JS

Current error suggests backend route needs debugging.
