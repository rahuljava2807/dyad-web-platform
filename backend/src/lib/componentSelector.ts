/**
 * Component Selection System
 *
 * Maps user intent/feature type to required shadcn-ui components and dependencies.
 * This ensures AI generates code with the right component library imports.
 */

export interface ComponentLibraryConfig {
  components: string[];
  dependencies: string[];
  imports: string[];
  validationSchema?: boolean;
  fileStructure: string[];
}

export const COMPONENT_LIBRARY: Record<string, ComponentLibraryConfig> = {
  // Authentication & Forms
  'auth': {
    components: ['Button', 'Input', 'Card', 'Label'],
    dependencies: [],
    imports: [
      'import { Button } from "@/components/ui/button"',
      'import { Input } from "@/components/ui/input"',
      'import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"',
      'import { Label } from "@/components/ui/label"',
    ],
    validationSchema: true,
    fileStructure: [
      'components/AuthForm.tsx',
      'components/AuthPage.tsx',
      'app/page.tsx'
    ]
  },

  'login': {
    components: ['Button', 'Input', 'Card', 'Label'],
    dependencies: [],
    imports: [
      'import { Button } from "@/components/ui/button"',
      'import { Input } from "@/components/ui/input"',
      'import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"',
      'import { Label } from "@/components/ui/label"',
    ],
    validationSchema: true,
    fileStructure: [
      'components/LoginForm.tsx',
      'components/AuthPage.tsx',
      'app/page.tsx'
    ]
  },

  'signup': {
    components: ['Button', 'Input', 'Card', 'Label', 'Checkbox'],
    dependencies: [],
    imports: [
      'import { Button } from "@/components/ui/button"',
      'import { Input } from "@/components/ui/input"',
      'import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"',
      'import { Label } from "@/components/ui/label"',
      'import { Checkbox } from "@/components/ui/checkbox"',
    ],
    validationSchema: true,
    fileStructure: [
      'components/SignupForm.tsx',
      'components/AuthPage.tsx',
      'app/page.tsx'
    ]
  },

  // Dashboard & Data Display
  'dashboard': {
    components: ['Card', 'Badge', 'Progress', 'Tabs', 'Select', 'Button'],
    dependencies: [],
    imports: [
      'import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"',
      'import { Badge } from "@/components/ui/badge"',
      'import { Progress } from "@/components/ui/progress"',
      'import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"',
      'import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"',
      'import { Button } from "@/components/ui/button"',
    ],
    validationSchema: false,
    fileStructure: [
      'components/Dashboard.tsx',
      'components/StatsCard.tsx',
      'components/DataTable.tsx',
      'app/page.tsx'
    ]
  },

  // Forms & Input
  'form': {
    components: ['Button', 'Input', 'Form', 'Label', 'Textarea', 'Select', 'Checkbox', 'Toast'],
    dependencies: ['react-hook-form', 'zod', '@hookform/resolvers'],
    imports: [
      'import { Button } from "@/components/ui/button"',
      'import { Input } from "@/components/ui/input"',
      'import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"',
      'import { Label } from "@/components/ui/label"',
      'import { Textarea } from "@/components/ui/textarea"',
      'import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"',
      'import { Checkbox } from "@/components/ui/checkbox"',
      'import { useToast } from "@/hooks/use-toast"',
      'import { useForm } from "react-hook-form"',
      'import { zodResolver } from "@hookform/resolvers/zod"',
      'import * as z from "zod"',
    ],
    validationSchema: true,
    fileStructure: [
      'components/DynamicForm.tsx',
      'components/FormPage.tsx',
      'lib/validations/formSchema.ts',
      'app/page.tsx'
    ]
  },

  // Settings & Configuration
  'settings': {
    components: ['Card', 'Button', 'Input', 'Form', 'Label', 'Switch', 'Tabs', 'Toast'],
    dependencies: ['react-hook-form', 'zod', '@hookform/resolvers'],
    imports: [
      'import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"',
      'import { Button } from "@/components/ui/button"',
      'import { Input } from "@/components/ui/input"',
      'import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"',
      'import { Label } from "@/components/ui/label"',
      'import { Switch } from "@/components/ui/switch"',
      'import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"',
      'import { useToast } from "@/hooks/use-toast"',
      'import { useForm } from "react-hook-form"',
      'import { zodResolver } from "@hookform/resolvers/zod"',
      'import * as z from "zod"',
    ],
    validationSchema: true,
    fileStructure: [
      'components/SettingsForm.tsx',
      'components/SettingsPage.tsx',
      'lib/validations/settingsSchema.ts',
      'app/page.tsx'
    ]
  },

  // Dialog & Modals
  'dialog': {
    components: ['Dialog', 'Button', 'Input', 'Form', 'Label'],
    dependencies: [],
    imports: [
      'import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"',
      'import { Button } from "@/components/ui/button"',
      'import { Input } from "@/components/ui/input"',
      'import { Label } from "@/components/ui/label"',
    ],
    validationSchema: false,
    fileStructure: [
      'components/CustomDialog.tsx',
      'components/DialogPage.tsx',
      'app/page.tsx'
    ]
  },

  // Navigation
  'navigation': {
    components: ['Button', 'DropdownMenu', 'Avatar'],
    dependencies: [],
    imports: [
      'import { Button } from "@/components/ui/button"',
      'import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"',
      'import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"',
    ],
    validationSchema: false,
    fileStructure: [
      'components/Navigation.tsx',
      'components/UserMenu.tsx',
      'app/page.tsx'
    ]
  },

  // Default fallback
  'default': {
    components: ['Button', 'Card', 'Input', 'Label'],
    dependencies: [],
    imports: [
      'import { Button } from "@/components/ui/button"',
      'import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"',
      'import { Input } from "@/components/ui/input"',
      'import { Label } from "@/components/ui/label"',
    ],
    validationSchema: false,
    fileStructure: [
      'components/MainComponent.tsx',
      'app/page.tsx'
    ]
  }
};

/**
 * Analyzes user prompt and selects appropriate component configuration
 */
export function selectComponentLibrary(prompt: string): ComponentLibraryConfig {
  const lowercasePrompt = prompt.toLowerCase();

  // Authentication patterns
  if (
    lowercasePrompt.includes('login') ||
    lowercasePrompt.includes('sign in') ||
    lowercasePrompt.includes('signin')
  ) {
    return COMPONENT_LIBRARY['login'];
  }

  if (
    lowercasePrompt.includes('signup') ||
    lowercasePrompt.includes('sign up') ||
    lowercasePrompt.includes('register') ||
    lowercasePrompt.includes('registration')
  ) {
    return COMPONENT_LIBRARY['signup'];
  }

  if (
    lowercasePrompt.includes('auth') ||
    lowercasePrompt.includes('authentication')
  ) {
    return COMPONENT_LIBRARY['auth'];
  }

  // Dashboard patterns
  if (
    lowercasePrompt.includes('dashboard') ||
    lowercasePrompt.includes('analytics') ||
    lowercasePrompt.includes('metrics') ||
    lowercasePrompt.includes('stats')
  ) {
    return COMPONENT_LIBRARY['dashboard'];
  }

  // Form patterns
  if (
    lowercasePrompt.includes('form') ||
    lowercasePrompt.includes('input') ||
    lowercasePrompt.includes('survey') ||
    lowercasePrompt.includes('questionnaire')
  ) {
    return COMPONENT_LIBRARY['form'];
  }

  // Settings patterns
  if (
    lowercasePrompt.includes('settings') ||
    lowercasePrompt.includes('preferences') ||
    lowercasePrompt.includes('configuration') ||
    lowercasePrompt.includes('config')
  ) {
    return COMPONENT_LIBRARY['settings'];
  }

  // Dialog patterns
  if (
    lowercasePrompt.includes('dialog') ||
    lowercasePrompt.includes('modal') ||
    lowercasePrompt.includes('popup')
  ) {
    return COMPONENT_LIBRARY['dialog'];
  }

  // Navigation patterns
  if (
    lowercasePrompt.includes('navigation') ||
    lowercasePrompt.includes('navbar') ||
    lowercasePrompt.includes('menu') ||
    lowercasePrompt.includes('header')
  ) {
    return COMPONENT_LIBRARY['navigation'];
  }

  // Default fallback
  return COMPONENT_LIBRARY['default'];
}

/**
 * Generates scaffold component import instructions for AI prompt
 * Uses actual shadcn/ui components from scaffold library
 */
export function generateImportInstructions(config: ComponentLibraryConfig): string {
  return `
🎨 COMPONENT LIBRARY - SCAFFOLD INTEGRATION:

✅ USE SCAFFOLD COMPONENTS from shadcn/ui library:
The following components are PRE-BUILT and will be automatically included in your project.
Import them using @/components/ui/* paths:

REQUIRED IMPORTS (use exactly these import statements):
${config.imports.filter(imp => !imp.includes('react-hook-form') && !imp.includes('zod') && !imp.includes('@hookform/resolvers')).join('\n')}

// Also import the utility function:
import { cn } from "@/lib/utils"

COMPONENT EXAMPLES (these are already built, just import and use them):

// Button usage:
<Button variant="default">Click me</Button>
<Button variant="outline">Secondary</Button>
<Button variant="destructive">Delete</Button>

// Input & Label usage:
<Label htmlFor="email">Email Address</Label>
<Input type="email" id="email" placeholder="you@example.com" />

// Card usage:
<Card>
  <CardHeader>
    <CardTitle>Title Here</CardTitle>
    <CardDescription>Description here</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>

💡 These components have built-in TypeScript types, variants, and accessibility features.
DO NOT recreate these components - they will be automatically included in the generated project!

${config.validationSchema ? `
🔒 VALIDATION - MANUAL APPROACH (Preview Compatible):

⚠️ DO NOT use react-hook-form, zod, or yup (not supported in preview)

✅ INSTEAD: Use native React state with manual validation:

import { useState } from 'react'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

const [formData, setFormData] = useState<FormData>({ email: '', password: '' })
const [errors, setErrors] = useState<FormErrors>({})
const [isLoading, setIsLoading] = useState(false)

const validateForm = (): boolean => {
  const newErrors: FormErrors = {}

  if (!formData.email) {
    newErrors.email = 'Email is required'
  } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
    newErrors.email = 'Invalid email format'
  }

  if (!formData.password) {
    newErrors.password = 'Password is required'
  } else if (formData.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return

  setIsLoading(true)
  try {
    // API call here
    console.log('Form submitted:', formData)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setIsLoading(false)
  }
}
` : ''}

📁 FILE STRUCTURE:

You MUST generate these files:
${config.fileStructure.map((file, i) => `${i + 1}. ${file}`).join('\n')}

CRITICAL: Generate AT LEAST ${config.fileStructure.length} files!
`.trim();
}

/**
 * Main function to get component instructions for AI
 */
export function getComponentInstructions(prompt: string): {
  config: ComponentLibraryConfig;
  instructions: string;
} {
  const config = selectComponentLibrary(prompt);
  const instructions = generateImportInstructions(config);

  return { config, instructions };
}
