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
