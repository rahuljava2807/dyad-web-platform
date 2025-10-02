# Yavi Studio - Architecture Overview

## Component Hierarchy

```
YaviStudioLayout
├── YaviStudioHeader
│   ├── Logo + Brand Name
│   ├── API Status Indicator
│   └── New Project Button
│
├── YaviStudioSidebar
│   ├── Industry Templates Section
│   │   ├── Legal Template Button
│   │   ├── Construction Template Button
│   │   ├── Healthcare Template Button
│   │   └── Financial Template Button
│   │
│   └── Resources Section
│       ├── Documentation Link
│       └── Settings Link
│
└── Main Content Area (children)
    └── YaviStudioDashboard (page.tsx)
        ├── Welcome Section
        ├── Quick Start Cards (4)
        └── Recent Projects Section
```

## Data Flow (Phase 1)

Currently static/presentational only. Phase 2 will add:

```
User Action → Component → Service Layer → Yavi.ai API
    ↓
Component State Update
    ↓
UI Re-render
```

## Component Details

### YaviStudioLayout
**Purpose**: Main wrapper providing consistent layout structure

**Props**:
- `children: React.ReactNode` - Content to render in main area

**Features**:
- Gradient background
- Sticky header
- Fixed sidebar
- Scrollable content area

**Used by**:
- `page.tsx` (YaviStudioDashboard)
- Future: Project pages, template pages

---

### YaviStudioHeader
**Purpose**: Top navigation bar with branding and actions

**Props**: None (static for Phase 1)

**Features**:
- Yavi Studio logo (gradient square)
- Brand name and company attribution
- API connection status (animated pulse)
- New Project button (links to `/dashboard/projects/new`)

**Future Enhancements** (Phase 2+):
- User profile dropdown
- Notifications bell
- Search functionality
- Dynamic API status

---

### YaviStudioSidebar
**Purpose**: Left navigation for templates and resources

**Props**: None (static for Phase 1)

**Features**:
- 4 Industry template buttons with icons
- Color-coded by industry
- Resources section with links
- Hover states and transitions

**Future Enhancements** (Phase 2+):
- Active state highlighting
- Template filtering
- Recent templates
- Favorites/bookmarks

---

### YaviStudioDashboard (page.tsx)
**Purpose**: Main landing page for Yavi Studio

**State** (Phase 1): None - purely presentational

**Sections**:
1. **Welcome Banner**
   - Title: "Welcome to Yavi Studio"
   - Tagline about document intelligence

2. **Quick Start Cards** (4)
   - Legal Contract Analyzer
   - Project Dashboard (Construction)
   - Patient Insights (Healthcare)
   - Invoice Processor (Financial)

3. **Recent Projects**
   - Empty state message
   - Ready for project data in Phase 2

**Future Enhancements** (Phase 2+):
- Project creation modals
- Template selection
- Recent projects list
- Analytics/stats cards

---

## Theme Configuration

### YaviStudioTheme (config file)

```typescript
{
  brand: {
    name: 'Yavi Studio',
    tagline: 'Build Intelligent Applications with Document AI',
    company: 'Nimbusnext Inc.'
  },

  colors: {
    primary: { ... },      // Blue shades
    secondary: { ... },    // Purple shades
    success: { ... },      // Green shades
    industries: {
      legal: '#1E40AF',
      construction: '#EA580C',
      healthcare: '#059669',
      financial: '#7C3AED'
    }
  }
}
```

This configuration is **imported but not actively used yet**. Phase 2 will:
- Use for dynamic theming
- Industry-specific color application
- Brand consistency checks

---

## Styling Architecture

### Global Styles (globals.css)

```css
@layer base {
  /* Base styles: font, antialiasing */
}

@layer components {
  .yavi-gradient { ... }
  .yavi-card { ... }
  .yavi-button-primary { ... }
  .yavi-studio-layout { ... }
}
```

### Tailwind Extensions (tailwind.config.ts)

```javascript
{
  extend: {
    fontFamily: {
      display: 'Plus Jakarta Sans',
      sans: 'Inter',
      mono: 'Fira Code'
    },
    colors: {
      yavi: { ... }
    }
  }
}
```

### Component-Level Styles

All components use Tailwind utility classes directly:
- No CSS modules
- No styled-components
- Consistent class naming

---

## Routing Structure

```
/dashboard                           (Main Dyad dashboard)
    ↓
/dashboard/yavi-studio              (Yavi Studio landing)
    ↓
[Future] /dashboard/yavi-studio/[template]
    ↓
[Future] /dashboard/yavi-studio/projects/[id]
```

### Navigation Flow

```
User clicks "Yavi Studio" button
    ↓
Next.js router navigates to /dashboard/yavi-studio
    ↓
YaviStudioDashboard page.tsx loads
    ↓
Wraps content in YaviStudioLayout
    ↓
Layout renders Header + Sidebar + Content
```

---

## Integration Points

### With Main Dyad Platform

**Current**:
- Button in main dashboard header
- Shared UI components (Button, Card from `@/components/ui`)
- Shared global styles
- Common authentication (NextAuth ready)

**Future** (Phase 2):
- Shared project database
- Common API key storage
- Unified user settings
- Cross-platform notifications

### With Yavi.ai Platform

**Current**: None (Phase 1 is UI only)

**Future** (Phase 2):
- API client service
- Document upload to Yavi.ai
- RAG query interface
- Response streaming
- Analytics integration

---

## State Management Strategy

### Phase 1 (Current)
- No state management needed
- Static components
- Client-side only

### Phase 2 (Planned)
```
Zustand Store
├── API Keys (encrypted)
├── Active Project
├── Document List
├── Chat History
└── User Preferences

React Query
├── Project CRUD
├── Document Upload/List
├── Yavi.ai API calls
└── Cache management
```

---

## Security Considerations

### Phase 1 (Implemented)
- Client-side rendering only
- No API keys stored
- No sensitive data

### Phase 2 (Planned)
- API keys encrypted in backend
- Secure Azure Blob storage
- NextAuth session validation
- CORS configuration
- Environment variable protection

---

## Performance Optimization

### Current
- Static components (fast render)
- Code splitting via Next.js
- Automatic font optimization
- Image optimization ready

### Future (Phase 2+)
- React Query caching
- Lazy loading for templates
- Virtual scrolling for project lists
- Web Workers for heavy processing
- Service Worker for offline support

---

## Testing Strategy

### Phase 1 (Not yet implemented)
Recommended:
- Component unit tests (Vitest)
- Accessibility tests
- Visual regression tests

### Phase 2 (Planned)
- Integration tests for API calls
- E2E tests with Playwright
- Load testing for document processing
- Security penetration testing

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Azure App Service               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     Next.js Frontend            │   │
│  │  - Static assets                │   │
│  │  - API routes                   │   │
│  │  - Yavi Studio UI               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     Backend Services            │   │
│  │  - Auth (NextAuth)              │   │
│  │  - Project API                  │   │
│  │  - Yavi.ai Proxy                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           │              │
           │              │
           ▼              ▼
    ┌──────────┐   ┌──────────────┐
    │PostgreSQL│   │Azure Storage │
    │ Database │   │     Blob     │
    └──────────┘   └──────────────┘
           │
           │
           ▼
    ┌─────────────┐
    │  Yavi.ai    │
    │  Platform   │
    └─────────────┘
```

---

## API Design (Phase 2)

### Internal APIs (Next.js API routes)

```
POST   /api/yavi-studio/projects        Create project
GET    /api/yavi-studio/projects        List projects
GET    /api/yavi-studio/projects/:id    Get project
PUT    /api/yavi-studio/projects/:id    Update project
DELETE /api/yavi-studio/projects/:id    Delete project

POST   /api/yavi-studio/documents       Upload document
GET    /api/yavi-studio/documents/:id   Get document
POST   /api/yavi-studio/query           Query documents (RAG)
GET    /api/yavi-studio/chat/:id        Get chat history
```

### External APIs (Yavi.ai)

```
POST   /api/v1/rag/ingest              Ingest documents
POST   /api/v1/rag/query               Query knowledge base
GET    /api/v1/documents/:id           Get document status
DELETE /api/v1/documents/:id           Delete document
```

---

## Development Workflow

```
1. Feature Branch
   ↓
2. Local Development
   ↓
3. Component Development
   ↓
4. Integration Testing
   ↓
5. PR Review
   ↓
6. Merge to Main
   ↓
7. Deploy to Staging
   ↓
8. QA Testing
   ↓
9. Deploy to Production
```

---

## Monitoring & Analytics (Future)

```
Vercel Analytics
├── Page views
├── User interactions
├── Performance metrics
└── Error tracking

Application Insights
├── API performance
├── Error logging
├── Custom events
└── User sessions

Yavi.ai Analytics
├── Document processing
├── Query performance
├── Token usage
└── Cost tracking
```

---

## Extension Points

### Custom Templates
Future developers can add templates by:
1. Adding entry to sidebar config
2. Creating template component
3. Defining template schema
4. Implementing template logic

### Custom Industries
To add new industries:
1. Update `yaviStudioTheme.ts` colors
2. Add icon to sidebar
3. Create industry-specific templates
4. Update documentation

### Plugin System (Future)
```typescript
interface YaviStudioPlugin {
  name: string
  version: string
  templates: Template[]
  components: Component[]
  routes: Route[]
}
```

---

## Dependencies

### Production
- Next.js 14
- React 18
- Tailwind CSS 3
- Radix UI (various)
- Lucide React (icons)
- Zustand (state)
- React Query (data)
- Azure SDK (storage)

### Development
- TypeScript 5
- ESLint
- Prettier
- Vitest (future)
- Playwright (future)

---

## Environment Variables

### Required for Phase 2
```bash
# Yavi.ai Integration
NEXT_PUBLIC_YAVI_API_URL=https://api.yavi.ai
YAVI_API_KEY=your_api_key

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME=your_account
AZURE_STORAGE_ACCOUNT_KEY=your_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# Database
DATABASE_URL=postgresql://...
```

---

## License & Attribution

**Yavi Studio** is built by:
- **Company**: Nimbusnext Inc.
- **Platform**: Part of Yavi.ai ecosystem
- **Base Framework**: Dyad Web Platform

All rights reserved to respective owners.

---

**Document Version**: 1.0
**Phase**: 1 (Foundation Complete)
**Last Updated**: October 2, 2025
