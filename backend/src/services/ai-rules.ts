import fs from 'fs/promises'
import path from 'path'

export interface AIRules {
  id: string
  projectId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

class AIRulesService {
  private rulesCache = new Map<string, AIRules>()

  /**
   * Get AI rules for a project
   */
  async getAIRules(projectId: string): Promise<AIRules | null> {
    try {
      // Check cache first
      if (this.rulesCache.has(projectId)) {
        return this.rulesCache.get(projectId)!
      }

      // Try to load from file system (for demo purposes)
      // In production, this would come from database
      const rulesPath = path.join(process.cwd(), 'projects', projectId, 'AI_RULES.md')
      
      try {
        const content = await fs.readFile(rulesPath, 'utf-8')
        const rules: AIRules = {
          id: `rules-${projectId}`,
          projectId,
          content,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        this.rulesCache.set(projectId, rules)
        return rules
      } catch (error) {
        // File doesn't exist, return default rules
        return this.getDefaultRules(projectId)
      }
    } catch (error) {
      console.error('Error loading AI rules:', error)
      return this.getDefaultRules(projectId)
    }
  }

  /**
   * Update AI rules for a project
   */
  async updateAIRules(projectId: string, content: string): Promise<AIRules> {
    try {
      const rules: AIRules = {
        id: `rules-${projectId}`,
        projectId,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save to file system (for demo purposes)
      // In production, this would save to database
      const rulesPath = path.join(process.cwd(), 'projects', projectId, 'AI_RULES.md')
      await fs.mkdir(path.dirname(rulesPath), { recursive: true })
      await fs.writeFile(rulesPath, content, 'utf-8')

      this.rulesCache.set(projectId, rules)
      return rules
    } catch (error) {
      console.error('Error updating AI rules:', error)
      throw new Error('Failed to update AI rules')
    }
  }

  /**
   * Get default AI rules for new projects
   */
  private getDefaultRules(projectId: string): AIRules {
    const defaultContent = `# AI Rules for Project

## Tech Stack
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS (NO generic class names like "card", "button", etc.)
- **Animations**: Framer Motion for smooth interactions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography

## Design Principles
- **Mobile-first**: Responsive design starting with mobile
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Lazy loading and code splitting
- **Modern UI**: Glassmorphism, gradients, and smooth animations

## Code Standards
- **TypeScript**: Strict typing with proper interfaces
- **Components**: Functional components with hooks
- **Error Handling**: Comprehensive try/catch blocks
- **Loading States**: Skeleton screens and spinners
- **Empty States**: Helpful messages with action buttons

## Database Rules
- **Backwards Compatible**: Add nullable columns with defaults
- **No Breaking Changes**: Avoid renames and deletions
- **Migrations**: Always include rollback procedures
- **Indexing**: Add indexes for frequently queried fields

## File Structure
- **Components**: Organized in feature folders
- **Utils**: Shared utilities and helpers
- **Types**: Centralized TypeScript definitions
- **Constants**: Configuration and theme values

## Forbidden Patterns
❌ Generic CSS classes: "card", "button", "container"
❌ Inline styles (use Tailwind utilities)
❌ Any components (use proper React components)
❌ Hardcoded values (use constants)
❌ Console.log in production code

## Required Patterns
✅ Tailwind utilities: "bg-white p-6 rounded-lg shadow-lg"
✅ Error boundaries for components
✅ Loading states for async operations
✅ Proper TypeScript interfaces
✅ Responsive design classes

## Quality Checklist
- [ ] All components have proper TypeScript types
- [ ] Tailwind classes are used instead of generic names
- [ ] Loading and error states are implemented
- [ ] Components are responsive and accessible
- [ ] Animations are smooth and purposeful
- [ ] Code follows consistent naming conventions
`

    const rules: AIRules = {
      id: `rules-${projectId}`,
      projectId,
      content: defaultContent,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.rulesCache.set(projectId, rules)
    return rules
  }

  /**
   * Get template rules for specific project types
   */
  getTemplateRules(templateType: string): string {
    const templates = {
      'dashboard': `# Dashboard Application Rules

## Specific Requirements
- **Metrics Cards**: 4-6 key performance indicators
- **Data Tables**: Sortable with pagination
- **Charts**: At least 2 different chart types
- **Filters**: Date ranges and category filters
- **Real-time Updates**: WebSocket or polling for live data

## Dashboard Components
- Navigation with user menu and notifications
- Sidebar with collapsible sections
- Main content area with grid layout
- Footer with system status and version

## Data Visualization
- Line charts for trends over time
- Bar charts for categorical comparisons
- Pie charts for distribution analysis
- KPI cards with trend indicators
`,

      'ecommerce': `# E-commerce Application Rules

## Core Features
- **Product Catalog**: Grid/list view with filters
- **Shopping Cart**: Persistent cart with quantity controls
- **Checkout**: Multi-step checkout process
- **User Accounts**: Registration, login, and profiles
- **Order Management**: Order history and tracking

## UI Components
- Product cards with image galleries
- Cart sidebar with item management
- Checkout forms with validation
- User dashboard with order history
- Admin panel for inventory management

## Business Logic
- Inventory tracking and stock alerts
- Price calculations with taxes and discounts
- Payment processing integration
- Shipping cost calculations
- Order status workflows
`,

      'blog-cms': `# Blog & CMS Application Rules

## Content Management
- **Rich Text Editor**: WYSIWYG with formatting
- **Media Library**: Image and file management
- **Categories & Tags**: Content organization
- **SEO Optimization**: Meta tags and structured data
- **Comments System**: Moderation and spam protection

## Publishing Features
- Draft and published content states
- Scheduled publishing
- Content versioning and history
- Author management and permissions
- Content analytics and insights

## Reader Experience
- Responsive article layouts
- Related content suggestions
- Social sharing buttons
- Reading progress indicators
- Dark mode support
`
    }

    return templates[templateType as keyof typeof templates] || templates['dashboard']
  }

  /**
   * Clear rules cache for a project
   */
  clearCache(projectId: string): void {
    this.rulesCache.delete(projectId)
  }

  /**
   * Validate AI rules content
   */
  validateRules(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!content.trim()) {
      errors.push('AI rules content cannot be empty')
    }

    if (content.length < 100) {
      errors.push('AI rules should be at least 100 characters long')
    }

    if (content.length > 10000) {
      errors.push('AI rules cannot exceed 10,000 characters')
    }

    // Check for required sections
    const requiredSections = ['Tech Stack', 'Design Principles', 'Code Standards']
    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    )

    if (missingSections.length > 0) {
      errors.push(`Missing required sections: ${missingSections.join(', ')}`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export const aiRulesService = new AIRulesService()
