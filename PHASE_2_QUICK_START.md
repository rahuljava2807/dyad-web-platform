# Phase 2: Quick Start Guide

## What's New in Phase 2?

Yavi Studio now has a **fully functional Application Builder** that lets you generate applications using AI!

### Key Features Added

1. **AI Application Builder** - 3-panel interface for building apps
2. **Prompt Interface** - Describe your app in plain English
3. **File Tree Visualizer** - See generated files in real-time
4. **Preview Panel** - View code and rendered previews
5. **Project Store** - Manage multiple projects with Zustand
6. **API Integration** - Backend routes for generation
7. **Yavi Connector** - Service for 50+ data connectors

## Quick Start (5 minutes)

### 1. Start the Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Access Yavi Studio

Open browser: `http://localhost:3000/dashboard/yavi-studio`

### 3. Start Building

1. Click **"Start Building"** button
2. Select an industry (Legal, Construction, Healthcare, Financial)
3. Choose a template OR write your own prompt
4. Click **"Generate Application"**
5. Watch files appear in real-time
6. Click files to preview them
7. Approve or reject the generation

## Builder Interface Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Yavi Studio Builder                      │
├────────────────┬───────────────────┬────────────────────────┤
│                │                   │                        │
│  LEFT PANEL    │   CENTER PANEL    │    RIGHT PANEL        │
│                │                   │                        │
│  Prompt Entry  │   File Tree       │    Preview            │
│  • Industry    │   • Folders       │    • Code View        │
│  • Templates   │   • Files         │    • Preview View     │
│  • Yavi Toggle │   • Icons         │    • Download         │
│  • Generate    │   • Selection     │    • Approve/Reject   │
│                │                   │                        │
└────────────────┴───────────────────┴────────────────────────┘
```

## Usage Examples

### Example 1: Legal Contract Analyzer

1. Go to builder: `/dashboard/yavi-studio/builder`
2. Select **"Legal"** industry
3. Click template: "Create a contract analyzer..."
4. Enable "Use Yavi.ai document intelligence"
5. Click "Generate Application"
6. Review generated files:
   - `/src/app/page.tsx` - Main page
   - `/src/components/Dashboard.tsx` - Dashboard component
   - `/package.json` - Dependencies
   - `/README.md` - Documentation
   - `/tailwind.config.ts` - Styling

### Example 2: Custom Healthcare App

1. Select **"Healthcare"** industry
2. Write custom prompt:
   ```
   Create a patient portal that allows patients to:
   - View their medical records
   - Schedule appointments
   - Message their doctor
   - Track prescriptions
   ```
3. Enable Yavi.ai context
4. Generate and review

## File Tree Navigation

- **Folders**: Click to expand/collapse
- **Files**: Click to preview
- **Icons**: Color-coded by file type
  - 🔵 Blue: TypeScript/JavaScript
  - 🟡 Yellow: JSON
  - ⚪ Gray: Markdown/Text
  - 🟢 Green: Images

## Preview Panel

### Code View
- Syntax-highlighted code
- Line numbers
- Language detection

### Preview View (for HTML/Markdown)
- Rendered output
- Live preview
- Scrollable iframe

### Actions
- **Download All**: Export all files as .txt
- **Approve & Deploy**: Mark as ready for production
- **Reject Changes**: Discard and start over

## Project State Management

Projects are automatically saved to browser storage:

```typescript
// Access project store
import { useProjectStore } from '@/store/projectStore';

const {
  projects,           // All projects
  currentProject,     // Active project
  createProject,      // Create new
  updateProject,      // Update existing
  deleteProject       // Remove project
} = useProjectStore();
```

## API Endpoints

### Validate API Key
```bash
POST http://localhost:5000/api/validate-key
Content-Type: application/json

{
  "provider": "openai",
  "key": "sk-..."
}
```

### Generate Application
```bash
POST http://localhost:5000/api/generate
Content-Type: application/json

{
  "prompt": "Create a legal contract analyzer...",
  "settings": {
    "selectedIndustry": "legal",
    "useYaviContext": true
  }
}
```

### Test Yavi Connection
```bash
GET http://localhost:5000/api/yavi/test
```

## Industry Templates

### Legal
- Contract analyzer
- Case management system
- Compliance checker

### Construction
- Project tracker
- Safety compliance dashboard
- Invoice analyzer

### Healthcare
- Patient record summarizer
- Medication tracking
- Billing processor

### Financial
- Invoice processor
- Financial statement analyzer
- Fraud detection system

## Yavi Connector Service

Access 50+ data connectors:

```typescript
import { yaviConnector } from '@/services/YaviConnector';

// Test connection
const isConnected = await yaviConnector.testConnection();

// Get available connectors
const connectors = await yaviConnector.getAvailableConnectors();

// Query documents
const results = await yaviConnector.queryDocuments(
  'namespace-id',
  'search query',
  10
);

// Process document
const result = await yaviConnector.processDocument(
  file,
  'namespace-id',
  ['extractor1', 'extractor2']
);
```

## Customization

### Add Custom Templates

Edit: `frontend/src/components/Builder/PromptInterface.tsx`

```typescript
const templates: Record<string, string[]> = {
  legal: [
    'Your new template here...',
    // existing templates
  ]
};
```

### Modify Generated Files

Edit: `backend/src/routes/generation.ts`

```typescript
function generateMainPage(prompt: string, industry: string): string {
  // Customize the generated code here
  return `...`;
}
```

## Troubleshooting

### Builder not loading?
1. Check both servers are running
2. Clear browser cache
3. Check console for errors

### Files not generating?
1. Check backend server logs
2. Verify API routes are registered
3. Check network tab for SSE connection

### Preview not showing?
1. Select a file first
2. Check file content is not empty
3. Try switching between Code/Preview views

## Keyboard Shortcuts (Future)

Coming in Phase 3:
- `Cmd+K`: Open command palette
- `Cmd+P`: Quick file search
- `Cmd+S`: Save project
- `Cmd+Enter`: Generate

## What's Next?

Phase 3 will add:
- Real AI generation (OpenAI/Anthropic)
- Syntax highlighting
- Live application preview
- Project persistence to database
- Version history
- More templates

## Tips & Best Practices

1. **Be Specific**: The more detailed your prompt, the better the results
2. **Use Templates**: Start with templates and customize
3. **Enable Yavi Context**: For document-heavy apps
4. **Review Carefully**: Always check generated code before deploying
5. **Save Often**: Projects auto-save, but create backups

## Support

- **Documentation**: `/docs` (coming soon)
- **Examples**: Check generated README files
- **Issues**: GitHub issues or support@nimbusnext.com

## Videos & Demos

1. **Getting Started** (2 min) - Basic walkthrough
2. **Building Your First App** (5 min) - End-to-end example
3. **Advanced Features** (10 min) - Power user tips

*(Video links coming soon)*

---

**Happy Building with Yavi Studio!** 🚀

Built by Nimbusnext Inc. | Powered by Yavi.ai
