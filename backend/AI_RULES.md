# AI Code Generation Rules

This document defines the strict requirements for AI-generated code in the Dyad platform.

## 1. MANDATORY TECH STACK

### Framework & Language
- **React 18+** with TypeScript (TSX files only)
- **TypeScript** with strict mode enabled
- **Vite** for build tooling (NOT Create React App)

### Styling
- **Tailwind CSS 3+** for ALL styling (NO custom CSS files, NO styled-components, NO CSS modules)
- **shadcn/ui** components for ALL UI elements (buttons, inputs, cards, dialogs, etc.)
- **lucide-react** for ALL icons (NOT react-icons, NOT heroicons)

### State Management
- **React Context API** for global state
- **useState/useReducer** for local state
- **React Query/TanStack Query** for server state (if needed)

### Form Handling
- **React Hook Form** with Zod validation
- **shadcn/ui form components** for form UI

### Dependencies
- Use **ONLY** these approved packages:
  - react, react-dom (^18.0.0)
  - typescript (^5.0.0)
  - tailwindcss (^3.0.0)
  - @radix-ui/* (via shadcn/ui)
  - lucide-react
  - react-hook-form
  - zod
  - clsx, tailwind-merge (for cn utility)

### React Router v6 - MANDATORY MODERN API

**CRITICAL: When using react-router-dom, ALWAYS use v6 API (NOT v5)**

❌ **FORBIDDEN - React Router v5 (Deprecated):**
```tsx
// DON'T USE THESE - They're from v5 and will cause runtime errors
import { Switch, Route } from 'react-router-dom'

<Switch>
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/settings" component={Settings} />
</Switch>
```

✅ **REQUIRED - React Router v6 (Modern):**
```tsx
// ALWAYS use these v6 APIs
import { Routes, Route } from 'react-router-dom'

<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```

**Key Differences (MEMORIZE THIS):**
1. `Switch` → `Routes` (component renamed)
2. `component={Dashboard}` → `element={<Dashboard />}` (prop renamed, use JSX)
3. Nested routes use `<Route>` with relative paths
4. Use `useNavigate()` instead of `useHistory()`

**Complete v6 Example:**
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

## 1.5 ⚠️ MANDATORY CONFIGURATION FILES

**CRITICAL: Every application MUST include these 11 core configuration files. Without them, the application WILL NOT RUN.**

### Minimum Required Files Checklist
- [ ] `package.json` - Dependencies and scripts
- [ ] `vite.config.ts` - Build configuration with path aliases
- [ ] `tsconfig.json` - TypeScript configuration with paths
- [ ] `tsconfig.node.json` - Vite TypeScript configuration
- [ ] `tailwind.config.js` - Tailwind CSS configuration
- [ ] `postcss.config.js` - PostCSS configuration for Tailwind
- [ ] `index.html` - HTML entry point for Vite
- [ ] `src/main.tsx` - React bootstrap
- [ ] `src/index.css` - Tailwind directives & CSS variables
- [ ] `src/lib/utils.ts` - cn() utility function
- [ ] `src/App.tsx` - Main application component

### 1. package.json (MANDATORY)

**YOU MUST ALWAYS GENERATE THIS FILE WITH ALL IMPORTED PACKAGES**

```json
{
  "name": "generated-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.0",
    "tailwindcss-animate": "^1.0.7",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

**CRITICAL:** Add ANY package you import:
- `react-router-dom` → `"react-router-dom": "^6.20.0"`
- `react-hook-form` → `"react-hook-form": "^7.48.0"`
- `zod` → `"zod": "^3.22.0"`
- `@radix-ui/react-dialog` → `"@radix-ui/react-dialog": "^1.0.5"`
- `framer-motion` → `"framer-motion": "^10.16.0"`
- `recharts` → `"recharts": "^2.10.0"`

### 2. vite.config.ts (MANDATORY)

**Enables `@/` import aliases - without this ALL imports will fail**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 3. tsconfig.json (MANDATORY)

**Maps `@/*` to `./src/*` for TypeScript**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4. tsconfig.node.json (MANDATORY)

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 5. tailwind.config.js (MANDATORY)

**Without this, NO Tailwind classes will work**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 6. postcss.config.js (MANDATORY)

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 7. index.html (MANDATORY)

**Vite entry point - without this, app won't load**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 8. src/main.tsx (MANDATORY)

**React bootstrap - renders the app into DOM**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 9. src/index.css (MANDATORY)

**Tailwind directives & CSS variables - without this NO styling works**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

### 10. src/lib/utils.ts (MANDATORY)

**cn() utility - required by ALL shadcn/ui components**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 11. src/App.tsx (MANDATORY)

**Main application component**

```typescript
import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Your application code */}
    </div>
  )
}

export default App
```

## 1.6 🤖 YAVI ASSISTANT WIDGET - MANDATORY INTEGRATION

**CRITICAL: Every generated application MUST include the Yavi Assistant Widget.**

### Why Include the Widget?

The Yavi Assistant Widget provides users with:
- **Real-time, domain-specific AI assistance** based on their work context
- **Access to namespace knowledge** (compliance rules, best practices, documentation)
- **Intelligent suggestions** that improve code quality and compliance
- **Interactive chat** for asking questions about domain-specific topics
- **Compliance checking** for regulated industries (HIPAA, GDPR, etc.)

This transforms your generated apps from "static code" to "intelligent applications" that continue providing value.

---

### MANDATORY: Widget Integration Checklist

Every generated application MUST include:

- [ ] `src/contexts/AssistantContext.tsx` - State management
- [ ] `src/components/assistant/YaviAssistant.tsx` - Main widget component
- [ ] `src/components/assistant/AssistantHeader.tsx` - Header with controls
- [ ] `src/components/assistant/ContextDisplay.tsx` - Context panel
- [ ] `src/components/assistant/SuggestionList.tsx` - Suggestions UI
- [ ] `src/components/assistant/InsightPanel.tsx` - Insights display
- [ ] `src/components/assistant/ConversationInterface.tsx` - Chat UI
- [ ] `src/components/assistant/AssistantFooter.tsx` - Footer with analytics
- [ ] `src/components/assistant/index.ts` - Export barrel
- [ ] `src/types/assistant.ts` - TypeScript type definitions
- [ ] Widget wrapped around App.tsx with AssistantProvider
- [ ] YaviAssistant component rendered in App.tsx

---

### Step 1: Wrap App with AssistantProvider

**MANDATORY: Update `src/main.tsx` to include the provider:**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AssistantProvider } from './contexts/AssistantContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AssistantProvider projectId="generated-app">
      <App />
    </AssistantProvider>
  </React.StrictMode>,
)
```

---

### Step 2: Add Widget to App Component

**MANDATORY: Update `src/App.tsx` to render the widget:**

```typescript
import React from 'react'
import { YaviAssistant } from './components/assistant'

function App() {
  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {/* Your application code */}
      </div>

      {/* Yavi Assistant Widget - MANDATORY */}
      <YaviAssistant />
    </>
  )
}

export default App
```

---

### Step 3: Domain-Specific Configuration

**Configure the widget based on the application domain:**

#### Legal Domain
```typescript
// For contract management, legal compliance, etc.
const LEGAL_CONFIG = {
  domain: 'legal',
  features: ['compliance-check', 'citation-helper', 'precedent-search'],
  icons: { primary: 'Scale', accent: 'Gavel' },
  complianceFrameworks: ['Indian Contract Act 1872', 'Constitution of India', 'IT Act 2000']
}
```

#### Medical/Healthcare Domain
```typescript
// For patient management, medical records, etc.
const MEDICAL_CONFIG = {
  domain: 'medical',
  features: ['hipaa-check', 'clinical-guidance', 'drug-interaction'],
  icons: { primary: 'Heart', accent: 'Shield' },
  complianceFrameworks: ['HIPAA', 'HITECH', 'Clinical Guidelines']
}
```

#### Finance Domain
```typescript
// For financial applications, banking, etc.
const FINANCE_CONFIG = {
  domain: 'finance',
  features: ['sox-compliance', 'fraud-detection', 'regulatory-check'],
  icons: { primary: 'DollarSign', accent: 'Shield' },
  complianceFrameworks: ['SOX', 'PCI-DSS', 'GDPR']
}
```

#### General/Default Domain
```typescript
// For general applications
const GENERAL_CONFIG = {
  domain: 'general',
  features: ['suggestions', 'chat', 'insights'],
  icons: { primary: 'Lightbulb', accent: 'Sparkles' },
  complianceFrameworks: []
}
```

---

### Required Files to Generate

**1. `src/types/assistant.ts`** - Type definitions (400+ lines)

Generate complete TypeScript types including:
- `AssistantState` - Complete state shape
- `Suggestion` - Suggestion structure
- `Insight` - Insight structure
- `Message` - Chat message structure
- `Pattern` - Detected code pattern
- `Connection` - WebSocket connection status
- `UIState` - Widget UI state
- All action types for the reducer

**2. `src/contexts/AssistantContext.tsx`** - State management (450+ lines)

Must include:
- `AssistantProvider` component
- `useAssistant` hook
- `useReducer` for state management
- Initial state with SSR safety: `typeof window !== 'undefined'`
- All reducer actions (TOGGLE_MINIMIZED, SUGGESTION_RECEIVED, etc.)
- Convenience hooks (useAssistantUI, useAssistantSuggestions, etc.)
- localStorage persistence for UI state

**3. `src/components/assistant/YaviAssistant.tsx`** - Main widget (240+ lines)

Features:
- Draggable widget (drag from header)
- Resizable (from bottom-right corner)
- Minimized state (floating button with notification badge)
- Expanded state (full interface)
- Tab navigation (Suggestions, Insights, Chat)
- Responsive positioning (stays within viewport)

**4. `src/components/assistant/AssistantHeader.tsx`** - Header component

Must include:
- Connection status indicator
- Namespace/domain display
- Minimize button
- Close button
- Status badge (live/offline)

**5. `src/components/assistant/ContextDisplay.tsx`** - Context panel

Shows:
- Current file being worked on
- Domain/namespace information
- Code statistics
- Analysis status

**6. `src/components/assistant/SuggestionList.tsx`** - Suggestions UI

Features:
- Priority-based suggestion cards
- Apply/Dismiss actions
- Category badges (compliance, best-practice, etc.)
- Priority indicators (critical, high, medium, low)
- Empty state when no suggestions

**7. `src/components/assistant/InsightPanel.tsx`** - Insights display

Shows:
- Namespace statistics
- Related documents
- Recent queries
- Pro tips

**8. `src/components/assistant/ConversationInterface.tsx`** - Chat UI

Features:
- Message history
- User/assistant message differentiation
- Input field with send button
- Typing indicator
- Auto-scroll to latest message

**9. `src/components/assistant/AssistantFooter.tsx`** - Footer

Shows:
- "Powered by Yavi.ai" branding
- Analytics summary
- Settings button

**10. `src/components/assistant/index.ts`** - Export barrel

```typescript
export { YaviAssistant } from './YaviAssistant'
export { AssistantHeader } from './AssistantHeader'
export { ContextDisplay } from './ContextDisplay'
export { SuggestionList } from './SuggestionList'
export { InsightPanel } from './InsightPanel'
export { ConversationInterface } from './ConversationInterface'
export { AssistantFooter } from './AssistantFooter'
```

---

### Styling Requirements for Widget

**The widget MUST use these exact styles for consistency:**

```tsx
// Minimized button (floating)
className="fixed bottom-6 right-6 w-14 h-14 rounded-full
           bg-gradient-to-br from-blue-600 to-purple-600
           shadow-xl hover:shadow-2xl hover:scale-110
           transition-all duration-200 flex items-center justify-center
           group z-50"

// Full widget container
className="fixed z-50 flex flex-col bg-slate-900 rounded-xl
           shadow-2xl overflow-hidden border border-slate-700"
style={{ left: position.x, top: position.y, width: size.width, height: size.height }}

// Widget header (draggable area)
className="cursor-move bg-slate-800 border-b border-slate-700 p-3"

// Tab buttons
className="flex-1 px-4 py-2.5 text-sm font-medium transition-colors
           ${active ? 'text-white bg-slate-800 border-b-2 border-blue-500'
                   : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"

// Suggestion cards
className="border rounded-lg p-3 bg-slate-800/50 border-slate-700
           hover:border-slate-600 transition-colors"

// Buttons
className="bg-purple-600 hover:bg-purple-700 text-white text-xs
           font-medium py-2 px-3 rounded transition-colors"
```

---

### Widget Behavior

**Drag Functionality:**
- User can drag widget by clicking and holding the header
- Widget stays within viewport bounds (constrained positioning)
- Smooth drag with mouse events

**Resize Functionality:**
- User can resize from bottom-right corner
- Min size: 320×400px
- Max size: 600×800px

**Minimize/Maximize:**
- Click minimize button → widget collapses to floating button
- Click floating button → widget expands to full interface
- Notification badge shows count of new suggestions

**Tab Navigation:**
- Three tabs: Suggestions, Insights, Chat
- Active tab highlighted with blue border
- Tab content switches instantly

**State Persistence:**
- Widget position saved to localStorage
- Widget size saved to localStorage
- Active tab saved to localStorage
- State restored on page reload

---

### Integration Testing Checklist

After generating the application, verify:

- [ ] Widget renders in bottom-right corner as minimized button
- [ ] Clicking button expands widget to full interface
- [ ] Widget can be dragged to different positions
- [ ] Widget can be resized from bottom-right corner
- [ ] All three tabs (Suggestions, Insights, Chat) are functional
- [ ] Minimize button collapses widget back to button
- [ ] Widget has proper z-index (z-50) and appears above all content
- [ ] Dark mode styling is consistent
- [ ] No TypeScript errors in widget files
- [ ] No console errors when widget renders
- [ ] Widget is responsive and works on different screen sizes

---

### IMPORTANT: Widget is NOT Optional

**The Yavi Assistant Widget is a core feature of all generated applications.**

- ❌ DO NOT skip widget generation
- ❌ DO NOT mark widget files as "optional"
- ❌ DO NOT add TODO comments about widget
- ✅ ALWAYS generate all 10 required widget files
- ✅ ALWAYS integrate widget into App.tsx
- ✅ ALWAYS wrap with AssistantProvider
- ✅ ALWAYS configure for the appropriate domain

**If the widget is not included, the generated application is INCOMPLETE.**

---

## 2. CODE QUALITY STANDARDS

### NO PLACEHOLDERS OR INCOMPLETE CODE
- ❌ FORBIDDEN: `// TODO`, `// FIXME`, `// Implement this`, `...`
- ❌ FORBIDDEN: Mock data arrays with "Coming soon", "Feature X", etc.
- ❌ FORBIDDEN: Stub functions that don't implement functionality
- ✅ REQUIRED: Full implementation of ALL features requested

### Validation & Error Handling
- **MANDATORY**: All forms MUST have Zod schema validation
- **MANDATORY**: All async operations MUST have try/catch error handling
- **MANDATORY**: All error states MUST display user-friendly messages
- **MANDATORY**: All loading states MUST be handled

### Type Safety
- **NO** `any` types (use `unknown` if truly needed, then narrow)
- **NO** `@ts-ignore` or `@ts-expect-error`
- **ALL** props MUST have TypeScript interfaces
- **ALL** API responses MUST have TypeScript types

### Accessibility (WCAG 2.1 AA)
- **MANDATORY**: All interactive elements have focus states
- **MANDATORY**: All images have alt text
- **MANDATORY**: All forms have proper labels
- **MANDATORY**: Color contrast ratio ≥ 4.5:1 for text
- **MANDATORY**: Keyboard navigation works for all interactions
- **USE** shadcn/ui components (built-in accessibility)

## 3. STYLING GUIDELINES

### Tailwind CSS Usage
- **USE** Tailwind utility classes for ALL styling
- **USE** responsive modifiers: `md:`, `lg:`, `xl:`
- **USE** dark mode classes: `dark:bg-gray-800`, `dark:text-white`
- **NO** inline styles (`style={{...}}`)
- **NO** custom CSS files

### CRITICAL: cn() Utility Function
- **MANDATORY**: When using `cn()` to merge Tailwind classes, you MUST import it:
  ```typescript
  import { cn } from '@/lib/utils'
  ```
- **CRITICAL**: Never use `cn()` without the import - it will cause runtime errors
- The `cn()` utility is automatically bundled with shadcn/ui components

### Color Palette
```typescript
// Primary colors (use Tailwind classes)
- Primary: blue-600 (hover: blue-700, active: blue-800)
- Success: green-600 (hover: green-700)
- Warning: yellow-600 (hover: yellow-700)
- Error: red-600 (hover: red-700)
- Neutral: gray-600 (hover: gray-700)

// Backgrounds
- Light mode: bg-white, bg-gray-50, bg-gray-100
- Dark mode: dark:bg-gray-900, dark:bg-gray-800, dark:bg-gray-700

// Text
- Light mode: text-gray-900, text-gray-700, text-gray-500
- Dark mode: dark:text-white, dark:text-gray-200, dark:text-gray-400
```

### Spacing System
- Use Tailwind spacing scale: `p-4`, `m-2`, `gap-3`, `space-y-4`
- Container padding: `p-4` (mobile), `md:p-6` (tablet), `lg:p-8` (desktop)
- Section spacing: `space-y-6` or `gap-6`

### Typography
```typescript
// Headings
h1: "text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
h2: "text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white"
h3: "text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100"

// Body
body: "text-base text-gray-700 dark:text-gray-300"
small: "text-sm text-gray-600 dark:text-gray-400"
tiny: "text-xs text-gray-500 dark:text-gray-500"
```

### Responsive Design
- **MOBILE-FIRST**: Start with mobile layout, add `md:`, `lg:` for larger screens
- **BREAKPOINTS**: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 🎨 VISUAL DESIGN STANDARDS - PRODUCTION QUALITY REQUIRED

### ⚠️ CRITICAL: Every Application Must Look Professional

**All generated applications MUST follow these visual standards. Basic, unstyled components are REJECTED.**

Generated applications should look like:
- ✅ Modern SaaS products (Linear, Vercel, Stripe)
- ✅ Premium landing pages
- ✅ Professional dashboards
- ✅ Apps users would pay for

NOT like:
- ❌ Wireframes
- ❌ Basic HTML forms
- ❌ Unstyled prototypes
- ❌ Bootstrap templates from 2010

### Color Palette Standards - MANDATORY USAGE

#### Primary Gradients (Use for main actions, backgrounds)
```css
/* Primary gradient - Use for CTAs, hero sections */
bg-gradient-to-br from-blue-500 to-purple-600

/* Vibrant gradient - Use for modern, energetic feel */
bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500

/* Success gradient - Use for positive actions */
bg-gradient-to-br from-emerald-400 to-cyan-500

/* Warm gradient - Use for inviting, friendly interfaces */
bg-gradient-to-br from-orange-400 to-pink-500
```

#### Background Patterns - ALWAYS USE GRADIENTS
```css
/* Full-page backgrounds - Light mode */
bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50

/* Full-page backgrounds - Dark mode */
bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900

/* Content areas */
bg-white dark:bg-gray-800

/* Background sections */
bg-gray-50 dark:bg-gray-900
```

#### Text Colors - Proper Hierarchy
```css
/* Primary text */
text-gray-900 dark:text-white

/* Secondary text */
text-gray-600 dark:text-gray-300

/* Muted text */
text-gray-400 dark:text-gray-500
```

### Depth & Shadows - MANDATORY

**ALWAYS use shadows for depth. Flat design is FORBIDDEN.**

```css
/* Cards and containers */
shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50

/* Elevated elements (modals, popovers) */
shadow-2xl shadow-black/10

/* Buttons and interactive elements */
shadow-lg hover:shadow-xl

/* Floating elements with color accent */
shadow-2xl shadow-purple-500/20
```

### Border Radius Standards

```css
rounded-xl    /* Standard for cards, containers (12px) */
rounded-2xl   /* Large elements like modals (16px) */
rounded-lg    /* Buttons, inputs (8px) */
rounded-full  /* Pills, avatars, badges */
```

### Spacing & Layout Standards

#### Container Patterns - COPY THESE EXACTLY

**Full-page Layout:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50
               dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
               flex items-center justify-center p-4">
  {/* Content */}
</div>
```

**Card Container:**
```tsx
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
               shadow-purple-500/10 p-8 max-w-md w-full">
  {/* Card content */}
</div>
```

**Section with Consistent Spacing:**
```tsx
<div className="space-y-6">
  {/* Section items */}
</div>
```

#### Padding Scale
```css
p-4   /* Compact (16px) - for tight spaces */
p-6   /* Comfortable (24px) - default for cards */
p-8   /* Spacious (32px) - for important content */
p-12  /* Extra spacious (48px) - for hero sections */
```

### Button Design Standards - MANDATORY PATTERNS

#### Primary Button (Main actions)
```tsx
<Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600
                   text-white font-semibold py-3 px-6 rounded-lg
                   hover:from-blue-600 hover:to-purple-700
                   hover:shadow-lg hover:scale-[1.02]
                   active:scale-[0.98]
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed">
  {loading ? (
    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
  ) : (
    'Submit'
  )}
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" className="border-2 border-gray-300 dark:border-gray-600
                                     hover:bg-gray-50 dark:hover:bg-gray-700
                                     hover:border-gray-400 dark:hover:border-gray-500
                                     transition-colors">
  Cancel
</Button>
```

### Input Field Design Standards

```tsx
<Input className="bg-white dark:bg-gray-800
                  border border-gray-300 dark:border-gray-600
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                  rounded-lg px-4 py-3
                  text-gray-900 dark:text-white
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  transition-all duration-200" />
```

### Animation Standards - ALWAYS INCLUDE

**MANDATORY: All interactive elements MUST have smooth transitions**

```css
/* Default for most interactions */
transition-all duration-200

/* For color changes */
transition-colors duration-300

/* For scale/position changes */
transition-transform duration-200
```

#### Hover Effects - REQUIRED
```css
hover:scale-[1.02]      /* Subtle lift */
hover:shadow-xl         /* Enhanced shadow */
hover:brightness-110    /* Subtle brightness increase */
```

#### Loading States - REQUIRED
```tsx
/* Spinner icon */
<Loader2 className="h-4 w-4 animate-spin" />

/* Skeleton loader */
<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
```

### Typography Standards - Professional Hierarchy

```css
/* H1 - Page titles */
text-3xl font-bold text-gray-900 dark:text-white mb-2

/* H2 - Section titles */
text-2xl font-semibold text-gray-900 dark:text-white mb-2

/* H3 - Subsection titles */
text-xl font-medium text-gray-900 dark:text-white mb-2

/* Body text */
text-base text-gray-600 dark:text-gray-300 leading-relaxed

/* Secondary text */
text-sm text-gray-500 dark:text-gray-400
```

### Glass Morphism Effects (Modern Premium Look)

```css
/* Glass container */
bg-white/10 backdrop-blur-md border border-white/20

/* Dark mode glass */
dark:bg-gray-800/50 dark:backdrop-blur-md dark:border-gray-700/30
```

---

### ✅ QUALITY CHECKLIST - VERIFY BEFORE OUTPUT

Before outputting ANY code, verify it includes:

- [ ] **Gradient background** for full-page layouts (`bg-gradient-to-br`)
- [ ] **Deep shadows** on main containers (`shadow-xl` or `shadow-2xl`)
- [ ] **Proper spacing** - Cards use `p-8`, not `p-4`
- [ ] **Rounded corners** - `rounded-xl` or `rounded-2xl` on cards
- [ ] **Smooth transitions** - `transition-all duration-200` on interactive elements
- [ ] **Hover effects** - `hover:scale-[1.02] hover:shadow-xl` on buttons
- [ ] **Loading states** - `<Loader2 className="animate-spin" />` for async actions
- [ ] **Icons** - lucide-react icons where appropriate
- [ ] **Dark mode** - `dark:` variants on ALL color classes
- [ ] **Typography hierarchy** - `text-3xl font-bold` for H1, proper sizing
- [ ] **Color contrast** - WCAG AA compliance (4.5:1 minimum)
- [ ] **Professional polish** - Looks like modern SaaS product, NOT a wireframe

### ❌ FORBIDDEN PATTERNS - REJECT CODE WITH THESE

```tsx
// ❌ WRONG - Plain, unstyled (REJECT THIS)
<div className="bg-white">
  <input type="email" />
  <button>Submit</button>
</div>

// ❌ WRONG - Minimal styling (REJECT THIS)
<form className="p-4 border">
  <Input placeholder="Email" />
  <Button>Submit</Button>
</form>

// ❌ WRONG - No visual hierarchy (REJECT THIS)
<div className="bg-white p-4 rounded">
  <h1>Login</h1>
  <input placeholder="Email" />
</div>

// ✅ CORRECT - Production-ready (ACCEPT THIS)
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50
               dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
               flex items-center justify-center p-4">
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
                 shadow-purple-500/10 p-8 max-w-md w-full">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
      Welcome Back
    </h1>
    {/* Properly styled form with all required elements */}
  </div>
</div>
```

### 🎯 QUALITY STANDARD EXAMPLES

**Example 1: Login Form Container**
```tsx
// THIS is the quality standard - copy this pattern
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50
               dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
               flex items-center justify-center p-4">
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
                 shadow-purple-500/10 p-8 w-full max-w-md backdrop-blur-sm
                 border border-gray-200 dark:border-gray-700">
    {/* Content */}
  </div>
</div>
```

**Example 2: Styled Button with Loading State**
```tsx
// THIS is the quality standard - copy this pattern
<Button
  type="submit"
  disabled={isLoading}
  className="w-full bg-gradient-to-r from-blue-500 to-purple-600
           hover:from-blue-600 hover:to-purple-700
           text-white font-semibold h-12 rounded-lg
           shadow-lg shadow-purple-500/30
           hover:shadow-xl hover:shadow-purple-500/40
           hover:scale-[1.02] active:scale-[0.98]
           transition-all duration-200
           disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? (
    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...</>
  ) : (
    'Sign In'
  )}
</Button>
```

**Example 3: Input Field with Icon**
```tsx
// THIS is the quality standard - copy this pattern
<div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
  <Input
    type="email"
    placeholder="you@example.com"
    className="pl-10 bg-gray-50 dark:bg-gray-900
             border-gray-300 dark:border-gray-600
             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
             rounded-lg h-12 transition-all duration-200"
  />
</div>
```

---

## 4. COMPONENT STRUCTURE

### shadcn/ui Component Usage
- **USE** shadcn/ui for ALL these UI elements:
  - Buttons: `<Button variant="default|outline|ghost" size="sm|default|lg">`
  - Inputs: `<Input type="text|email|password" />`
  - Cards: `<Card><CardHeader><CardTitle>`, `<CardContent>`
  - Dialogs/Modals: `<Dialog><DialogContent><DialogHeader>`
  - Select dropdowns: `<Select><SelectTrigger><SelectContent>`
  - Tabs: `<Tabs><TabsList><TabsTrigger><TabsContent>`
  - Alerts: `<Alert variant="default|destructive">`
  - Badges: `<Badge variant="default|secondary|outline">`
  - Forms: `<Form><FormField><FormItem><FormLabel><FormControl>`

### Component File Pattern
```typescript
// REQUIRED structure for all components
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// ... other imports

interface ComponentNameProps {
  // TypeScript interface for props
}

export const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState<Type>(initialValue)

  // Handlers
  const handleAction = async () => {
    try {
      // Implementation
    } catch (error) {
      console.error('Error:', error)
      // User feedback
    }
  }

  // Render
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  )
}
```

### Form Pattern (MANDATORY for all forms)
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Zod schema (MANDATORY)
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof formSchema>

export const MyForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Handle submission
    } catch (error) {
      // Handle error
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Loading States Pattern
```typescript
const [isLoading, setIsLoading] = useState(false)

// In handler
setIsLoading(true)
try {
  await asyncOperation()
} finally {
  setIsLoading(false)
}

// In JSX
{isLoading ? (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Loading...</span>
  </div>
) : (
  <Button>Action</Button>
)}
```

### Error States Pattern
```typescript
const [error, setError] = useState<string | null>(null)

// In handler
try {
  await asyncOperation()
  setError(null)
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred')
}

// In JSX
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

## 5. FILE STRUCTURE RULES

### ⚠️ CRITICAL: File Extension Rules

**MANDATORY: Use correct file extensions or code will fail with syntax errors**

❌ **FORBIDDEN - JSX in .ts files:**
```typescript
// ❌ WRONG: src/hooks/useAuth.ts (will cause syntax error!)
export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={...}>  // ERROR: JSX in .ts file!
      {children}
    </AuthContext.Provider>
  )
}
```

✅ **REQUIRED - JSX requires .tsx:**
```typescript
// ✅ CORRECT: src/hooks/useAuth.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={...}>  // ✓ JSX in .tsx file
      {children}
    </AuthContext.Provider>
  )
}
```

**File Extension Rules (MEMORIZE THIS):**
1. **React Components** → `.tsx` (use `.tsx` if JSX present)
2. **React Hooks with JSX** → `.tsx` (any hook returning JSX)
3. **Context Providers** → `.tsx` (always use JSX)
4. **Pure TypeScript** → `.ts` (no JSX, only types/functions)
5. **Type Definitions** → `.ts` or `.d.ts` (no JSX)

**Quick Check:**
- Does the file contain `<SomeComponent>` syntax? → **USE .tsx**
- Does the file contain `return (...)` with JSX? → **USE .tsx**
- Does the file only have types/functions? → **USE .ts**

### Minimum Files Required
- **MINIMUM 2 FILES** for simple apps
- **MINIMUM 8 FILES** for medium apps (dashboards, multi-page)
- **MINIMUM 12 FILES** for complex apps (auth, data tables, forms)

### File Organization
```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── [Feature]Card.tsx      # Feature components
│   ├── [Feature]Form.tsx
│   └── [Feature]List.tsx
├── lib/
│   └── utils.ts               # cn() utility and helpers
├── types/
│   └── index.ts               # TypeScript interfaces
├── App.tsx                    # Main app component
└── main.tsx                   # Entry point
```

### Import Path Pattern
```typescript
// CORRECT
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

// INCORRECT
import { Button } from './components/ui/button'
import { Button } from '../ui/button'
```

## 6. OUTPUT FORMAT

### JSON Structure (MANDATORY)
```json
{
  "explanation": "Brief 2-3 sentence description of what was built",
  "files": [
    {
      "path": "src/App.tsx",
      "content": "// Full file content",
      "language": "typescript"
    }
  ],
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "instructions": "Run 'npm install' then 'npm run dev'"
}
```

### File Content Requirements
- **COMPLETE** files only (no partial code)
- **NO** placeholders or TODOs
- **INCLUDE** all necessary imports
- **INCLUDE** proper TypeScript types
- **INCLUDE** error handling
- **INCLUDE** loading states
- **VALID** syntax (must pass TypeScript compilation)

## 7. QUALITY CHECKLIST

Before generating output, verify:

### Functionality ✓
- [ ] All requested features are fully implemented
- [ ] No placeholder functions or TODOs
- [ ] All user interactions work as expected
- [ ] All forms validate input correctly
- [ ] All async operations handle errors

### Code Quality ✓
- [ ] TypeScript strict mode passes
- [ ] No `any` types used
- [ ] All props have interfaces
- [ ] All components are properly typed
- [ ] No console errors or warnings

### UI/UX ✓
- [ ] Uses only shadcn/ui components
- [ ] Uses only Tailwind CSS for styling
- [ ] Uses only lucide-react for icons
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode implemented
- [ ] Loading states for all async actions
- [ ] Error states with user-friendly messages

### Accessibility ✓
- [ ] All buttons/links have focus states
- [ ] All images have alt text
- [ ] All forms have labels
- [ ] Color contrast ≥ 4.5:1
- [ ] Keyboard navigation works

### File Structure ✓
- [ ] Minimum file count met (2-12 based on complexity)
- [ ] Files organized in proper directories
- [ ] Import paths use `@/` alias
- [ ] shadcn/ui components in `components/ui/`

## 8. EXAMPLES OF WHAT TO AVOID

### ❌ BAD: Placeholder Functions
```typescript
const handleSubmit = () => {
  // TODO: Implement submission logic
  console.log('Form submitted')
}
```

### ✅ GOOD: Full Implementation
```typescript
const handleSubmit = async (data: FormData) => {
  setIsLoading(true)
  setError(null)

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error('Submission failed')

    const result = await response.json()
    setSuccess(true)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred')
  } finally {
    setIsLoading(false)
  }
}
```

### ❌ BAD: Mock Data Without Implementation
```typescript
const features = [
  { name: 'Feature 1', status: 'Coming soon' },
  { name: 'Feature 2', status: 'Coming soon' },
]
```

### ✅ GOOD: Real Data with Implementation
```typescript
const features = [
  {
    name: 'Dashboard Analytics',
    description: 'View real-time metrics and insights',
    icon: BarChart3,
    href: '/dashboard/analytics',
  },
  {
    name: 'User Management',
    description: 'Manage team members and permissions',
    icon: Users,
    href: '/dashboard/users',
  },
]
```

---

## SUMMARY: NON-NEGOTIABLE REQUIREMENTS

1. ✅ React 18+ TypeScript ONLY
2. ✅ Tailwind CSS ONLY (no custom CSS)
3. ✅ shadcn/ui components ONLY (no other UI libraries)
4. ✅ lucide-react icons ONLY
5. ✅ NO placeholders, TODOs, or incomplete code
6. ✅ FULL validation with Zod for all forms
7. ✅ FULL error handling for all async operations
8. ✅ FULL accessibility (WCAG 2.1 AA)
9. ✅ FULL responsive design (mobile-first)
10. ✅ MINIMUM file count based on complexity

**If any requirement is violated, the output is INVALID and MUST be regenerated.**
