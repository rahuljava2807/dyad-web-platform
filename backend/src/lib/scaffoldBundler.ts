import * as fs from 'fs'
import * as path from 'path'

export interface GeneratedFile {
  path: string
  content: string
  language: string
}

/**
 * Scaffold Component Bundler
 *
 * Copies shadcn/ui components from the scaffold directory into generated projects.
 * This allows generated code to use pre-built, production-ready components instead
 * of inline Tailwind components.
 *
 * Architecture:
 * - Scaffold Location: /dyad-main/scaffold/src/components/ui/
 * - 49 shadcn/ui components available
 * - All components depend on lib/utils.ts for cn() helper
 * - Components use @/ alias for imports
 */

// Path to scaffold directory (adjust based on project structure)
const SCAFFOLD_BASE = path.resolve(__dirname, '../../../../dyad-main/scaffold/src')
const SCAFFOLD_COMPONENTS = path.join(SCAFFOLD_BASE, 'components/ui')
const SCAFFOLD_LIB = path.join(SCAFFOLD_BASE, 'lib')

/**
 * Component name to filename mapping
 * Maps common component names to their scaffold filenames
 */
const COMPONENT_FILE_MAP: Record<string, string> = {
  'Button': 'button.tsx',
  'Card': 'card.tsx',
  'Input': 'input.tsx',
  'Label': 'label.tsx',
  'Form': 'form.tsx',
  'Select': 'select.tsx',
  'Dialog': 'dialog.tsx',
  'Sheet': 'sheet.tsx',
  'Popover': 'popover.tsx',
  'Tabs': 'tabs.tsx',
  'Table': 'table.tsx',
  'Accordion': 'accordion.tsx',
  'Alert': 'alert.tsx',
  'AlertDialog': 'alert-dialog.tsx',
  'Avatar': 'avatar.tsx',
  'Badge': 'badge.tsx',
  'Breadcrumb': 'breadcrumb.tsx',
  'Calendar': 'calendar.tsx',
  'Carousel': 'carousel.tsx',
  'Chart': 'chart.tsx',
  'Checkbox': 'checkbox.tsx',
  'Collapsible': 'collapsible.tsx',
  'Command': 'command.tsx',
  'ContextMenu': 'context-menu.tsx',
  'DatePicker': 'date-picker.tsx',
  'Dropdown': 'dropdown-menu.tsx',
  'DropdownMenu': 'dropdown-menu.tsx',
  'HoverCard': 'hover-card.tsx',
  'Menubar': 'menubar.tsx',
  'NavigationMenu': 'navigation-menu.tsx',
  'Pagination': 'pagination.tsx',
  'Progress': 'progress.tsx',
  'RadioGroup': 'radio-group.tsx',
  'ScrollArea': 'scroll-area.tsx',
  'Separator': 'separator.tsx',
  'Skeleton': 'skeleton.tsx',
  'Slider': 'slider.tsx',
  'Switch': 'switch.tsx',
  'Textarea': 'textarea.tsx',
  'Toast': 'toast.tsx',
  'Toaster': 'toaster.tsx',
  'Toggle': 'toggle.tsx',
  'ToggleGroup': 'toggle-group.tsx',
  'Tooltip': 'tooltip.tsx',
}

/**
 * Reads a file from the scaffold directory
 */
function readScaffoldFile(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[ScaffoldBundler] File not found: ${filePath}`)
      return null
    }
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error(`[ScaffoldBundler] Error reading file ${filePath}:`, error)
    return null
  }
}

/**
 * Gets all available scaffold components
 */
export function getAvailableComponents(): string[] {
  try {
    if (!fs.existsSync(SCAFFOLD_COMPONENTS)) {
      console.warn(`[ScaffoldBundler] Scaffold components directory not found: ${SCAFFOLD_COMPONENTS}`)
      return []
    }

    const files = fs.readdirSync(SCAFFOLD_COMPONENTS)
    return files
      .filter(f => f.endsWith('.tsx'))
      .map(f => f.replace('.tsx', ''))
  } catch (error) {
    console.error('[ScaffoldBundler] Error listing components:', error)
    return []
  }
}

/**
 * Bundles scaffold components into generated files
 *
 * @param componentNames - Array of component names (e.g., ['Button', 'Card', 'Input'])
 * @returns Array of GeneratedFile objects containing component code
 *
 * @example
 * const files = bundleScaffoldComponents(['Button', 'Card', 'Input'])
 * // Returns:
 * // - components/ui/button.tsx
 * // - components/ui/card.tsx
 * // - components/ui/input.tsx
 * // - lib/utils.ts (automatically included)
 */
export function bundleScaffoldComponents(componentNames: string[]): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const bundled = new Set<string>()

  console.log(`[ScaffoldBundler] Bundling ${componentNames.length} components:`, componentNames)

  // Always include lib/utils.ts (required by all shadcn components)
  const utilsPath = path.join(SCAFFOLD_LIB, 'utils.ts')
  const utilsContent = readScaffoldFile(utilsPath)

  if (utilsContent) {
    files.push({
      path: 'lib/utils.ts',
      content: utilsContent,
      language: 'typescript'
    })
    bundled.add('utils')
    console.log('[ScaffoldBundler] ✓ Added lib/utils.ts')
  } else {
    console.warn('[ScaffoldBundler] ⚠️ Could not load lib/utils.ts - components may not work')
  }

  // Bundle each requested component
  for (const componentName of componentNames) {
    // Skip if already bundled
    if (bundled.has(componentName.toLowerCase())) {
      continue
    }

    // Get the filename for this component
    const fileName = COMPONENT_FILE_MAP[componentName]

    if (!fileName) {
      console.warn(`[ScaffoldBundler] ⚠️ Unknown component: ${componentName}`)
      continue
    }

    // Read the component file
    const componentPath = path.join(SCAFFOLD_COMPONENTS, fileName)
    const componentContent = readScaffoldFile(componentPath)

    if (!componentContent) {
      console.warn(`[ScaffoldBundler] ⚠️ Could not read component: ${componentName}`)
      continue
    }

    // Add to bundle (path conversion will happen centrally in ai.ts)
    files.push({
      path: `components/ui/${fileName}`,
      content: componentContent,
      language: 'typescript'
    })

    bundled.add(componentName.toLowerCase())
    console.log(`[ScaffoldBundler] ✓ Added components/ui/${fileName}`)
  }

  console.log(`[ScaffoldBundler] Successfully bundled ${files.length} files`)

  return files
}

/**
 * Bundles components based on industry template requirements
 * Automatically includes common dependencies
 */
export function bundleForIndustry(industry: string, templateId: string): GeneratedFile[] {
  // Define common component sets for each industry
  const industryComponents: Record<string, string[]> = {
    'healthcare': ['Button', 'Card', 'Input', 'Label', 'Form', 'Select', 'Checkbox', 'Textarea', 'Alert'],
    'fintech': ['Button', 'Card', 'Input', 'Label', 'Form', 'Select', 'Table', 'Badge', 'Alert'],
    'legal': ['Button', 'Card', 'Input', 'Label', 'Form', 'Textarea', 'Accordion', 'Tabs', 'Alert'],
    'ecommerce': ['Button', 'Card', 'Input', 'Label', 'Select', 'Badge', 'Carousel', 'Sheet', 'Toast'],
    'saas': ['Button', 'Card', 'Input', 'Label', 'Form', 'Select', 'Dialog', 'Sheet', 'Tabs', 'Table'],
    'general': ['Button', 'Card', 'Input', 'Label', 'Form', 'Select', 'Alert']
  }

  const components = industryComponents[industry] || industryComponents['general']
  console.log(`[ScaffoldBundler] Bundling for ${industry} industry:`, components)

  return bundleScaffoldComponents(components)
}

/**
 * Analyzes AI-generated code to detect which components are being used
 * Returns list of component names found in the code
 */
export function detectUsedComponents(generatedFiles: GeneratedFile[]): string[] {
  const componentNames = Object.keys(COMPONENT_FILE_MAP)
  const usedComponents = new Set<string>()

  for (const file of generatedFiles) {
    // Skip non-code files
    if (!file.path.match(/\.(tsx?|jsx?)$/)) continue

    const content = file.content

    // Look for component imports and usage
    for (const componentName of componentNames) {
      // Check for imports: import { Button } from '@/components/ui/button'
      const importPattern = new RegExp(`import.*${componentName}.*from.*['"]@/components/ui`, 'i')

      // Check for JSX usage: <Button>
      const jsxPattern = new RegExp(`<${componentName}[\\s>]`, 'g')

      if (importPattern.test(content) || jsxPattern.test(content)) {
        usedComponents.add(componentName)
      }
    }
  }

  return Array.from(usedComponents)
}

/**
 * Smart bundler that analyzes generated code and only includes used components
 */
export function bundleUsedComponents(generatedFiles: GeneratedFile[]): GeneratedFile[] {
  const usedComponents = detectUsedComponents(generatedFiles)

  if (usedComponents.length === 0) {
    console.log('[ScaffoldBundler] No scaffold components detected in generated code')
    return []
  }

  console.log(`[ScaffoldBundler] Detected ${usedComponents.length} components in use:`, usedComponents)
  return bundleScaffoldComponents(usedComponents)
}

/**
 * Validates that scaffold directory exists and is accessible
 */
export function validateScaffoldSetup(): { valid: boolean; message: string } {
  if (!fs.existsSync(SCAFFOLD_BASE)) {
    return {
      valid: false,
      message: `Scaffold directory not found: ${SCAFFOLD_BASE}`
    }
  }

  if (!fs.existsSync(SCAFFOLD_COMPONENTS)) {
    return {
      valid: false,
      message: `Scaffold components directory not found: ${SCAFFOLD_COMPONENTS}`
    }
  }

  if (!fs.existsSync(SCAFFOLD_LIB)) {
    return {
      valid: false,
      message: `Scaffold lib directory not found: ${SCAFFOLD_LIB}`
    }
  }

  const availableComponents = getAvailableComponents()

  if (availableComponents.length === 0) {
    return {
      valid: false,
      message: 'No components found in scaffold directory'
    }
  }

  return {
    valid: true,
    message: `Scaffold setup valid. ${availableComponents.length} components available.`
  }
}
