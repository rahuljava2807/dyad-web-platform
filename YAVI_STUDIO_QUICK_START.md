# Yavi Studio - Quick Start Guide

## What is Yavi Studio?

**Yavi Studio** is an AI application builder that's part of the Yavi.ai ecosystem. It allows SMBs to build document-intelligent applications using a visual, no-code interface powered by Yavi.ai's RAG (Retrieval-Augmented Generation) technology.

### Key Differentiators
- **NOT a Dyad clone** - Complementary product in the Yavi ecosystem
- **Vertical application** - Focused on document intelligence
- **Industry-specific** - Tailored templates for Legal, Construction, Healthcare, Financial

## How to Access

### Option 1: From Main Dashboard
1. Start the development server: `npm run dev --prefix frontend`
2. Navigate to `http://localhost:3000/dashboard`
3. Click the **"Yavi Studio"** button in the header (with sparkles icon ✨)

### Option 2: Direct URL
- Navigate directly to: `http://localhost:3000/dashboard/yavi-studio`

## Current Features (Phase 1)

### 🎨 Branding
- **Yavi Studio** name with gradient logo
- **"by Nimbusnext"** attribution
- Consistent color scheme (Blue + Purple)

### 🏗️ Layout
- **Header**: Branding, API status, New Project button
- **Sidebar**: Industry templates and resources
- **Main Area**: Welcome message and quick start cards

### 🏭 Industry Templates (4 Categories)

1. **Legal** (Blue 🔵)
   - Contract Analyzer
   - Extract key terms and clauses

2. **Construction** (Orange 🟠)
   - Project Dashboard
   - Track projects and documents

3. **Healthcare** (Green 🟢)
   - Patient Insights
   - Summarize medical records

4. **Financial** (Purple 🟣)
   - Invoice Processor
   - Extract and process data

## Visual Preview

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Yavi Studio by Nimbusnext    ● Connected  [New +]   │
├───────────┬─────────────────────────────────────────────────┤
│           │ Welcome to Yavi Studio                          │
│ Industry  │ Build document-intelligent applications...     │
│ Templates │                                                 │
│           │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │
│ • Legal   │ │Legal  │ │Constr.│ │Health │ │Financ │       │
│ • Constr. │ │Analyz.│ │Dashb. │ │Insig. │ │Proces │       │
│ • Health  │ └───────┘ └───────┘ └───────┘ └───────┘       │
│ • Financ. │                                                 │
│           │ Recent Projects                                 │
│ Resources │ No projects yet...                              │
│ • Docs    │                                                 │
│ • Settings│                                                 │
└───────────┴─────────────────────────────────────────────────┘
```

## Color Palette

### Primary Colors
- **Blue**: `#1E3A8A` to `#2563EB` (Primary brand)
- **Purple**: `#7C3AED` to `#9333EA` (Secondary brand)

### Industry Colors
- **Legal**: `#1E40AF` (Deep Blue)
- **Construction**: `#EA580C` (Orange)
- **Healthcare**: `#059669` (Green)
- **Financial**: `#7C3AED` (Purple)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Yavi classes
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Inter, Plus Jakarta Sans, Fira Code
- **State**: Zustand (ready for Phase 2)
- **Azure**: Identity + Storage Blob (installed)

## File Organization

```
frontend/src/
├── config/
│   └── yaviStudioTheme.ts          # Brand configuration
│
├── components/
│   ├── layouts/
│   │   └── YaviStudioLayout.tsx    # Main wrapper
│   ├── Header/
│   │   └── YaviStudioHeader.tsx    # Top nav
│   └── Sidebar/
│       └── YaviStudioSidebar.tsx   # Left nav
│
└── app/
    └── dashboard/
        └── yavi-studio/
            └── page.tsx            # Main page
```

## Utility Classes

Yavi Studio includes custom Tailwind classes:

```css
.yavi-gradient           /* Blue to purple gradient */
.yavi-card              /* Consistent card styling */
.yavi-button-primary    /* Primary button style */
.yavi-studio-layout     /* Layout background gradient */
```

## Navigation Structure

```
/ (Home)
└── /dashboard
    ├── Main Dashboard (Projects list)
    ├── /yavi-studio ← NEW!
    │   └── Yavi Studio Interface
    ├── /projects
    │   ├── /new
    │   └── /[id]
    └── /settings
```

## What's Next? (Phase 2)

1. **API Key Management**
   - Settings page for Yavi.ai credentials
   - Secure storage

2. **Yavi.ai Integration**
   - Service layer for API calls
   - Connection testing

3. **Project Creation**
   - Industry template selection
   - Configuration wizard

4. **Document Processing**
   - Upload interface
   - RAG-powered Q&A

## Quick Commands

```bash
# Start development
npm run dev --prefix frontend

# Access Yavi Studio
# → http://localhost:3000/dashboard/yavi-studio

# Build for production
npm run build --prefix frontend

# Start production server
npm start --prefix frontend
```

## Important Links

- **Main Dashboard**: `/dashboard`
- **Yavi Studio**: `/dashboard/yavi-studio`
- **Settings**: `/dashboard/settings`
- **New Project**: `/dashboard/projects/new`

## Troubleshooting

### Yavi Studio page not loading?
1. Ensure dev server is running
2. Check console for errors
3. Verify file exists: `frontend/src/app/dashboard/yavi-studio/page.tsx`

### Styles not applying?
1. Check `globals.css` is imported in `layout.tsx`
2. Verify Tailwind config includes `src/**/*.{ts,tsx}`
3. Clear `.next` cache and rebuild

### Components not found?
1. Check import paths use `@/` alias
2. Verify files exist in `frontend/src/components/`
3. Check file extensions are `.tsx`

## Support

For issues or questions:
1. Check `PHASE_1_COMPLETE.md` for detailed documentation
2. Review component files for implementation details
3. Refer to Yavi.ai integration docs (coming in Phase 2)

---

**Phase 1**: Foundation ✅ COMPLETE
**Phase 2**: Functionality 🚧 NEXT
**Phase 3**: Templates 📋 PLANNED
**Phase 4**: Deployment 🚀 PLANNED

Enjoy building with Yavi Studio!
