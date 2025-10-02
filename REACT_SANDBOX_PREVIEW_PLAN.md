# React Sandbox Preview Implementation Plan

## Goal
Create a fully functioning React preview that renders generated applications with:
- ✅ Real React component rendering
- ✅ Working interactions (buttons, forms, etc.)
- ✅ Live charts and visualizations
- ✅ Shadcn/ui components
- ✅ Tailwind CSS styling
- ✅ Actual functioning UI (not just HTML)

## Technology Choice: Sandpack

**Sandpack** by CodeSandbox is the perfect solution:
- Full React environment in iframe
- Supports TypeScript
- Built-in bundler (no backend needed)
- Hot reload
- Error handling
- Works with Tailwind CSS
- Can load external dependencies
- Used by many code playgrounds

## Implementation Steps

### Phase 1: Install Sandpack
```bash
cd frontend
npm install @codesandbox/sandpack-react
```

### Phase 2: Create React Sandbox Component
**File**: `frontend/src/components/Builder/ReactSandbox.tsx`

Features:
- Takes generated files as input
- Converts to Sandpack format
- Renders full React app
- Includes Tailwind CSS
- Loads dependencies (framer-motion, recharts, shadcn)
- Error boundary
- Loading states

### Phase 3: Enhance AI Prompts for Sandpack
Update `backend/src/services/ai.ts` to generate code optimized for Sandpack:
- Single-file components (less imports)
- Inline shadcn components
- CDN-friendly dependencies
- Self-contained code

### Phase 4: Update LivePreviewPanel
Replace current preview with ReactSandbox component:
- Show actual running React app
- Interactive UI
- Working buttons, forms, charts
- Real-time updates

## File Structure

```
frontend/src/components/Builder/
├── ReactSandbox.tsx          # NEW: Sandpack wrapper
├── LivePreviewPanel.tsx      # MODIFY: Use ReactSandbox
└── SandpackTheme.ts          # NEW: Custom theme
```

## Dependencies to Add

```json
{
  "@codesandbox/sandpack-react": "^2.13.0"
}
```

## Sandpack Configuration

```typescript
{
  template: "react-ts",
  files: {
    "/App.tsx": generatedAppCode,
    "/components/Dashboard.tsx": generatedDashboardCode,
    // ... all generated files
  },
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^11.0.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.294.0"
  },
  customSetup: {
    dependencies: dynamicDependenciesFromGeneration
  }
}
```

## Benefits

1. **Real Functionality**: Users see actual working app
2. **Interactive**: Can click buttons, fill forms
3. **Beautiful**: Full Tailwind + shadcn styling
4. **Professional**: Like v0.dev, bolt.new
5. **No Backend**: Runs entirely in browser
6. **Fast**: Hot reload, instant updates
7. **Error Handling**: Shows compilation errors
8. **Responsive**: Can test different screen sizes

## Example Output

Instead of seeing:
```
Generated Application
11 Files Generated
```

Users will see:
```
[Full functioning dashboard with:
- Working navigation
- Interactive charts that respond to hover
- Clickable buttons
- Animated cards
- Live data tables
- Actual app UI]
```

## shadcn/ui Integration

Sandpack can render shadcn components by:
1. Including component code inline
2. Using Tailwind for styling
3. Loading Radix UI from CDN
4. Or using pre-built shadcn templates

We'll generate apps with inline shadcn components (Button, Card, etc.) so they work immediately in Sandpack.

## Next Steps

1. Install Sandpack
2. Create ReactSandbox.tsx
3. Update LivePreviewPanel to use ReactSandbox
4. Test with generated code
5. Add error handling
6. Add loading states
7. Polish UI

## Timeline

- Phase 1-2: 30 minutes (install + create component)
- Phase 3: 20 minutes (enhance prompts)
- Phase 4: 20 minutes (integrate)
- Testing: 20 minutes
- **Total: ~90 minutes**

## Ready to Start?

Let me know and I'll begin implementing the full React sandbox preview!
