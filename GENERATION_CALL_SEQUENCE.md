# Complete Application Generation Call Sequence

This document provides the complete sequence of class and method calls when generating an application in the Dyad Web Platform (Yavi Studio Builder v3).

**Last Updated:** 2025-10-10
**Purpose:** Developer reference for understanding the complete generation flow from user click to AI-generated code with full validation pipeline.

---

## Table of Contents

1. [High-Level Flow Overview](#high-level-flow-overview)
2. [Detailed Call Sequence](#detailed-call-sequence)
3. [File Locations Reference](#file-locations-reference)
4. [Validation Pipeline Details](#validation-pipeline-details)
5. [Key Data Transformations](#key-data-transformations)

---

## High-Level Flow Overview

```
User Click (Generate Button)
    ↓
Frontend: Builder v3 Component
    ↓
Frontend: GenerationService
    ↓
Frontend: Next.js API Route (/api/generation/start)
    ↓
Backend: Express Generation Router (/api/generate)
    ↓
Backend: AI Service (generateCode)
    ↓
Backend: OpenAI/Anthropic/Google AI SDK
    ↓
Backend: Validation Pipeline (4 validators)
    ↓
Backend: Path Alias Conversion
    ↓
Backend: Scaffold Bundling (shadcn/ui components)
    ↓
Frontend: Receive & Display Files
    ↓
Frontend: Sandpack Preview
```

---

## Detailed Call Sequence

### PHASE 1: User Interaction → Frontend Handler

**File:** `frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx`
**Lines:** 35-115

#### 1.1 User Click Handler
```typescript
// Class: BuilderV3Page (Functional Component)
// Method: handleGeneration(prompt: string, settings: any)
// Location: frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx:35-115

const handleGeneration = async (prompt: string, settings: any) => {
  // Step 1: Set generation status
  setGenerationStatus('generating')
  setGeneratedFiles([])
  setProgress({ current: 0, total: 0 })

  // Step 2: Create or get project from Zustand store
  let project = currentProject
  if (!project) {
    project = createProject(
      `${settings.selectedIndustry || 'Generated'} App`,
      settings.selectedIndustry || 'general',
      prompt
    )
  }

  // Step 3: Call GenerationService
  await generationService.generateApplication(
    prompt,
    settings,
    {
      onThinkingStep: (step) => { /* Update thinking panel */ },
      onThinkingSummary: (summary) => { /* Update summary */ },
      onFileStart: (file) => { /* Add file to list */ },
      onContentChunk: (chunk) => { /* Stream content */ },
      onFileComplete: (file) => { /* Mark file complete */ },
      onProgress: (prog) => { /* Update progress bar */ },
      onComplete: (files) => { /* Show preview */ },
      onError: (error) => { /* Show error */ }
    }
  )
}
```

**State Updates:**
- `generationStatus` → 'generating'
- `generatedFiles` → []
- `progress` → { current: 0, total: 0 }

---

### PHASE 2: Generation Service → API Call

**File:** `frontend/src/services/GenerationService.ts`
**Lines:** 28-106

#### 2.1 GenerationService.generateApplication()
```typescript
// Class: GenerationService
// Method: async generateApplication(prompt, settings, callbacks)
// Location: frontend/src/services/GenerationService.ts:28-106

async generateApplication(
  prompt: string,
  settings: GenerationSettings,
  callbacks: GenerationCallbacks
): Promise<void> {
  try {
    // Step 1: Make POST request to Next.js API route
    const response = await fetch('/api/generation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, settings })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to start generation')
    }

    // Step 2: Parse response
    const data = await response.json()
    const { files, sessionId, thinking } = data

    // Step 3: Handle thinking data (if provided)
    if (thinking) {
      if (thinking.summary) {
        callbacks.onThinkingSummary?.(thinking.summary)
      }
      if (thinking.steps && Array.isArray(thinking.steps)) {
        for (const step of thinking.steps) {
          callbacks.onThinkingStep?.({
            title: step.title,
            description: step.description
          })
        }
      }
    }

    // Step 4: Simulate streaming for UX (since response is non-streaming)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // File start callback
      callbacks.onFileStart({
        path: file.path,
        name: file.path.split('/').pop() || file.path,
        language: file.path.endsWith('.tsx') || file.path.endsWith('.ts')
          ? 'typescript'
          : file.path.endsWith('.json')
            ? 'json'
            : 'markdown'
      })

      // File complete callback
      callbacks.onFileComplete({
        path: file.path,
        content: file.content,
        language: /* same logic */,
        summary: file.summary
      })

      // Progress callback
      callbacks.onProgress?.({
        current: i + 1,
        total: files.length
      })

      // Small delay to show progress (100ms)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Step 5: Complete callback
    callbacks.onComplete(files)

  } catch (error) {
    callbacks.onError(error)
  }
}
```

**API Call:**
- **Method:** POST
- **Endpoint:** `/api/generation/start`
- **Body:** `{ prompt, settings }`

---

### PHASE 3: Next.js API Route → Backend Proxy

**File:** `frontend/src/app/api/generation/start/route.ts`
**Lines:** 5-61

#### 3.1 POST Handler
```typescript
// Route: POST /api/generation/start
// Location: frontend/src/app/api/generation/start/route.ts:5-61

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse request body
    const body = await request.json()
    const { prompt, settings } = body

    // Step 2: Call backend AI service
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context: {
          framework: 'react',
          language: 'typescript',
          industry: settings?.selectedIndustry || 'general',
        },
        userId: 'anonymous', // TODO: Get from auth
        provider: settings?.provider || 'openai',
      }),
    })

    // Step 3: Handle errors
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Generation failed' },
        { status: response.status }
      )
    }

    // Step 4: Parse backend response
    const data = await response.json()

    // Step 5: Generate session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Step 6: Return enriched response
    return NextResponse.json({
      sessionId,
      files: data.files || [],
      explanation: data.explanation || '',
      dependencies: data.dependencies || [],
      thinking: data.thinking || null,
      source: data.source || 'ai',
      templateId: data.templateId || null,
      templateName: data.templateName || null,
    })

  } catch (error) {
    console.error('Generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate application' },
      { status: 500 }
    )
  }
}
```

**Backend API Call:**
- **Method:** POST
- **Endpoint:** `http://localhost:5001/api/generate`
- **Body:** `{ prompt, context, userId, provider }`

---

### PHASE 4: Backend Express Router

**File:** `backend/src/routes/generation.ts`
**Lines:** 191-276

#### 4.1 POST /api/generate Handler
```typescript
// Router: POST /api/generate
// Location: backend/src/routes/generation.ts:191-276

router.post('/generate', async (req: Request, res: Response) => {
  const { prompt, context, userId, provider } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  try {
    // Step 1: Check for template match (DISABLED in current version)
    console.log('🔍 Skipping template match - testing AI generation...')
    const template = null

    // Step 2: Call AI Service for code generation
    console.log('🚀 No template match, generating with enhanced AI prompts...')

    const result = await aiService.generateCode({
      prompt,
      context: context || {
        framework: 'react',
        language: 'typescript',
      },
      userId: userId || 'anonymous',
      provider: provider || 'openai',
    })

    console.log(`✅ Generated ${result.files.length} files with AI`)

    // Step 3: Return the generated code
    res.json({
      code: result.code,
      explanation: result.explanation,
      files: result.files,
      dependencies: result.dependencies,
      instructions: result.instructions,
      source: 'ai',
    })

  } catch (error) {
    console.error('❌ Generation error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate application'
    })
  }
})
```

**Key Service Call:**
- **Class:** `aiService` (singleton instance)
- **Method:** `generateCode(request)`

---

### PHASE 5: AI Service - Core Generation Logic

**File:** `backend/src/services/ai.ts`
**Lines:** 291-1234

#### 5.1 AIService.generateCode() - Main Method

```typescript
// Class: AIService
// Method: async generateCode(request: GenerateCodeRequest)
// Location: backend/src/services/ai.ts:291-1234

async generateCode(request: GenerateCodeRequest) {
  let enhancedPrompt = request.prompt

  try {
    // Step 1: Check for API keys, return mock if none configured
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY &&
        !process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.AZURE_OPENAI_API_KEY) {
      console.log('🚧 No API key configured, returning mock response')
      return { /* mock response */ }
    }

    // Step 2: Initialize AI provider and model
    const provider = request.provider || this.defaultProvider
    const model = this.getModelInstance(provider)

    // Step 3: Build enhanced prompt with component instructions
    const componentConfig = getComponentInstructions(request.prompt)
    enhancedPrompt += `\n\n${componentConfig.instructions}\n`

    // Step 4: Add industry template enhancement (if applicable)
    if (request.context?.industry && request.context?.templateId) {
      const template = getTemplate(request.context.industry, request.context.templateId)
      if (template) {
        const templateEnhancement = getTemplatePromptEnhancement(template)
        enhancedPrompt += `\n\n${templateEnhancement}\n`
      }
    }

    // Step 5: Add CRITICAL production quality requirements
    enhancedPrompt += `
      🚨 CRITICAL GENERATION REQUIREMENTS 🚨
      1. Generate COMPLETE application with 6-10 files minimum
      2. Use ONLY Tailwind CSS utility classes
      3. Include realistic mock data
      4. Add TypeScript types
      5. Implement smooth transitions
      6. Make it production-ready
      ... (see full requirements in file)
    `

    // Step 6: Build system prompt (loads from AI_RULES.md + smart context)
    const systemPrompt = await this.buildSystemPrompt(request.prompt, request.context)

    // Step 7: Call AI SDK with structured output (Zod schema)
    const result = await generateObject({
      model,
      system: systemPrompt,
      prompt: enhancedPrompt,
      schema: z.object({
        code: z.string().optional(),
        explanation: z.string(),
        files: z.array(z.object({
          path: z.string(),
          content: z.string(),
          type: z.enum(['create', 'modify', 'delete']),
        })).min(2),
        dependencies: z.array(z.string()).optional(),
        instructions: z.string().optional(),
      }),
    })

    console.log(`✅ Generated code: ${result.object.files.length} files`)

    // ==========================================
    // VALIDATION & TRANSFORMATION PIPELINE
    // ==========================================

    // Step 8: VALIDATE TAILWIND CSS CLASSES
    const hasGenericClasses = this.validateTailwindClasses(result.object.files)
    if (hasGenericClasses) {
      console.warn('Generic class names detected, regenerating...')
      // Retry with stricter Tailwind enforcement prompt
      const retryResult = await this.retryWithTailwindEnforcement(...)
      return this.processValidationPipeline(retryResult.object)
    }

    // Step 9: CHECK FOR ECHO (AI just repeating prompt as text)
    const isEchoingPrompt = this.detectEcho(result.object.files, request.prompt)
    if (isEchoingPrompt) {
      console.warn('AI echoing prompt, regenerating...')
      const antiEchoResult = await this.retryWithAntiEcho(...)
      return this.processValidationPipeline(antiEchoResult.object)
    }

    // Step 10: VALIDATE CONTENT QUALITY
    const hasQualityIssues = this.validateQuality(result.object.files)
    // (Currently disabled: ENABLE_QUALITY_RETRY = false)

    // Step 11: ENFORCE MINIMUM FILE COUNT
    if (result.object.files.length < 6) {
      console.warn('Only generated ${result.object.files.length} files, regenerating...')
      const retryResult = await this.retryWithMinimumFiles(...)
      return this.processValidationPipeline(retryResult.object)
    }

    // Step 12: RUN COMPREHENSIVE VALIDATION
    const validationResult = comprehensiveValidation(
      result.object.files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.path.endsWith('.tsx') || f.path.endsWith('.ts')
          ? 'typescript'
          : 'json'
      })),
      'default'
    )

    const report = generateValidationReport(validationResult)
    console.log(report)

    // Step 13: SCAFFOLD INTEGRATION (Bundle shadcn/ui components)
    console.log('🎨 [Scaffold Integration] Analyzing code for component usage...')
    const usedComponents = detectUsedComponents(result.object.files)

    if (usedComponents.length > 0) {
      console.log(`Detected ${usedComponents.length} components:`, usedComponents)
      const scaffoldFiles = bundleScaffoldComponents(usedComponents)

      // Add scaffold files to result
      for (const scaffoldFile of scaffoldFiles) {
        result.object.files.push({
          path: scaffoldFile.path,
          content: scaffoldFile.content,
          type: 'create'
        })
      }
      console.log(`✅ Total files with scaffold: ${result.object.files.length}`)
    }

    // Step 14: CONVERT PATH ALIASES (@/ → relative paths for Sandpack)
    this.convertPathAliases(result.object.files)

    // Step 15: OUTPUT VALIDATOR (Structured quality checks)
    console.log('🔍 [Output Validator] Running quality checks...')
    const outputValidation = outputValidator.validate(result.object.files)
    console.log(outputValidator.formatResults(outputValidation))

    // Check for CRITICAL errors (missing imports, JSX in .ts files)
    const criticalErrors = outputValidation.errors.filter(e =>
      e.type === 'missing_import' ||
      (e.type === 'quality' && e.message.includes('JSX syntax but uses .ts extension'))
    )

    if (criticalErrors.length > 0) {
      console.error('❌ CRITICAL errors detected:')
      criticalErrors.forEach(e => console.error(`  - ${e.message}`))
      throw new Error(`Output validation failed with ${criticalErrors.length} critical error(s)`)
    }

    // Step 16: STYLING VALIDATOR (Production quality checks)
    console.log('🎨 [Styling Validator] Running production quality checks...')
    const stylingValidation = stylingValidator.validate(result.object.files)
    console.log(stylingValidator.formatResults(stylingValidation))

    if (!stylingValidation.isValid) {
      console.warn(`⚠️  Production quality below threshold: ${stylingValidation.score}/100`)
      // Non-blocking - log for monitoring but allow generation to proceed
    }

    // Step 17: DEPENDENCY VALIDATOR (Auto-fix missing packages)
    console.log('📦 [Dependency Validator] Checking import/dependency consistency...')
    const dependencyValidation = await dependencyValidator.validate(result.object.files)
    console.log(dependencyValidator.formatResults(dependencyValidation))

    if (!dependencyValidation.isValid) {
      console.log('🔧 Attempting auto-fix...')
      const fixedPackageJson = dependencyValidator.autoFix(
        result.object.files,
        dependencyValidation
      )

      if (fixedPackageJson) {
        const packageJsonIndex = result.object.files.findIndex(f =>
          f.path.endsWith('package.json')
        )
        if (packageJsonIndex !== -1) {
          result.object.files[packageJsonIndex].content = fixedPackageJson.content
          console.log(`✅ Auto-fixed package.json with ${dependencyValidation.summary.missingPackages} missing packages`)
        }
      }
    }

    // Step 18: PREVIEW VALIDATOR (Optional - headless browser validation)
    const enablePreviewValidation = process.env.ENABLE_PREVIEW_VALIDATION === 'true'
    if (enablePreviewValidation) {
      console.log('🌐 [Preview Validator] Running headless browser validation...')
      const previewValidation = await previewValidator.validate(result.object.files)
      console.log(previewValidator.formatResults(previewValidation))
      // Non-blocking experimental feature
    }

    // Step 19: Return final validated result
    return result.object

  } catch (error: any) {
    console.error('❌ Error generating code:', error)

    // Check for JSON parsing errors (apostrophe/escape issues)
    const isJSONParseError = error?.message?.includes('JSON') ||
                             error?.message?.includes('parse')

    if (isJSONParseError) {
      console.log('🔄 Retrying with JSON-safe prompt...')
      const safeResult = await this.retryWithJSONSafety(...)
      return this.processValidationPipeline(safeResult.object)
    }

    throw new Error('Failed to generate code. Please try again.')
  }
}
```

---

### PHASE 6: AI Service - Sub-Methods

#### 6.1 buildSystemPrompt()
```typescript
// Method: async buildSystemPrompt(prompt: string, context?: GenerationContext)
// Location: backend/src/services/ai.ts:175-289

private async buildSystemPrompt(prompt: string, context?: GenerationContext): Promise<string> {
  // Step 1: Load base rules from AI_RULES.md
  let systemPrompt = await aiRulesLoader.loadRules()

  // Step 2: Inject Smart Context (relevant existing files)
  try {
    const relevantContext = await smartContext.getRelevantContext(prompt)
    if (relevantContext) {
      systemPrompt += `\n\n${relevantContext}`
    }
  } catch (error) {
    console.warn('[buildSystemPrompt] Smart context failed:', error)
  }

  // Step 3: Append context-specific information
  if (context?.framework) {
    systemPrompt += `\n\nFramework: ${context.framework}...`
  }

  if (context?.language) {
    systemPrompt += `\n\nPrimary language: ${context.language}...`
  }

  // Step 4: Add CRITICAL styling emphasis (2000+ char section)
  systemPrompt += `
    ═══════════════════════════════════════
    🚨 CRITICAL STYLING REQUIREMENT 🚨
    ═══════════════════════════════════════

    1. 🎨 GRADIENT BACKGROUNDS - MANDATORY
    2. 💎 DEEP SHADOWS - MANDATORY
    3. 📐 GENEROUS SPACING
    4. 🎭 SMOOTH ANIMATIONS
    5. 🔤 TYPOGRAPHY HIERARCHY
    6. 🎨 BORDER RADIUS
    7. 🌓 DARK MODE
    8. ✨ VISUAL POLISH CHECKLIST
    ...
  `

  return systemPrompt
}
```

**Called By:** `generateCode()` at line 411
**Calls:**
- `aiRulesLoader.loadRules()` - Loads AI_RULES.md content
- `smartContext.getRelevantContext(prompt)` - Analyzes prompt and injects relevant files

---

#### 6.2 convertPathAliases()
```typescript
// Method: private convertPathAliases(files: any[]): void
// Location: backend/src/services/ai.ts:137-169

private convertPathAliases(files: any[]): void {
  console.log('🔧 [Path Conversion] Converting @/ aliases to relative paths for Sandpack...')

  const pathMapping = { '@/': 'src/' }

  for (const file of files) {
    if (!file.path.match(/\.(tsx?|jsx?)$/)) continue

    let convertedContent = file.content

    // Match: from '@/components/ui/button'
    const importRegex = /from\s+['"](@\/[^'"]+)['"]/g

    convertedContent = convertedContent.replace(importRegex, (match, importPath) => {
      const alias = importPath.substring(0, 2)  // '@/'
      const importFile = importPath.substring(2) // 'components/ui/button'
      const fromPath = path.dirname(file.path)   // 'src/components'
      const toPath = path.join(pathMapping[alias], importFile) // 'src/components/ui/button'
      let relativePath = path.relative(fromPath, toPath) // '../ui/button'

      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath
      }

      return `from "${relativePath}"`
    })

    if (convertedContent !== file.content) {
      file.content = convertedContent
      console.log(`🔧 [Path Conversion] Converted imports in ${file.path}`)
    }
  }

  console.log('✅ [Path Conversion] All @/ aliases converted to relative paths')
}
```

**Purpose:** Sandpack doesn't support TypeScript path aliases (`@/`), so we convert them to relative paths
**Example Transformation:**
```typescript
// BEFORE:
import { Button } from '@/components/ui/button'

// AFTER (in src/components/Dashboard.tsx):
import { Button } from './ui/button'
```

---

### PHASE 7: Validation Pipeline

#### 7.1 Output Validator

**File:** `backend/src/services/outputValidator.ts`
**Class:** `OutputValidator`
**Method:** `validate(files: GeneratedFile[])`

```typescript
// Location: backend/src/services/outputValidator.ts:49-88

validate(files: GeneratedFile[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  for (const file of files) {
    if (!this.isCodeFile(file)) continue

    // Run all validators
    const fileErrors = [
      ...this.validateNoPlaceholders(file),       // TODO, FIXME, etc.
      ...this.validateFileExtensions(file),       // JSX in .ts files
      ...this.validateImports(file),              // Missing cn() import
      ...this.validateShadcnUsage(file),          // Custom buttons vs shadcn
      ...this.validateFormValidation(file),       // Zod validation
      ...this.validateAccessibility(file),        // Alt text, aria-labels
      ...this.validateNoInlineStyles(file),       // style={{}} forbidden
    ]

    const fileWarnings = [
      ...this.validateNoConsoleLogs(file),        // console.log
      ...this.validateNoAnyTypes(file),           // TypeScript 'any'
    ]

    errors.push(...fileErrors)
    warnings.push(...fileWarnings)
  }

  return { isValid: errors.length === 0, errors, warnings }
}
```

**Key Checks:**
- ✅ No placeholders (TODO, FIXME, "Implementation goes here")
- ✅ Correct file extensions (JSX → .tsx, not .ts)
- ✅ Missing imports detected (especially `cn()` utility)
- ✅ shadcn/ui components used instead of custom
- ✅ Forms have Zod validation
- ✅ Accessibility (alt text, aria-labels)
- ✅ No inline styles (Tailwind only)

---

#### 7.2 Styling Validator

**File:** `backend/src/services/stylingValidator.ts`
**Class:** `StylingValidator`
**Method:** `validate(files: GeneratedFile[])`

```typescript
// Location: backend/src/services/stylingValidator.ts:66-181

validate(files: GeneratedFile[]): StylingValidationResult {
  const errors: StylingError[] = []
  const warnings: StylingWarning[] = []
  const details: QualityCheckDetails = {
    hasGradientBackgrounds: false,
    hasDeepShadows: false,
    hasProperSpacing: false,
    hasSmoothTransitions: false,
    hasHoverEffects: false,
    hasTypographyHierarchy: false,
    hasBorderRadius: false,
    hasDarkMode: false,
    hasIcons: false,
    hasLoadingStates: false,
    wireframeQuality: 0,
  }

  for (const file of componentFiles) {
    // Run 10 styling checks
    const gradientCheck = this.checkGradientBackgrounds(file)
    const shadowCheck = this.checkDeepShadows(file)
    const spacingCheck = this.checkProperSpacing(file)
    const transitionCheck = this.checkSmoothTransitions(file)
    const hoverCheck = this.checkHoverEffects(file)
    const typographyCheck = this.checkTypographyHierarchy(file)
    const borderRadiusCheck = this.checkBorderRadius(file)
    const darkModeCheck = this.checkDarkMode(file)
    const iconCheck = this.checkIcons(file)
    const loadingCheck = this.checkLoadingStates(file)

    // Update details and collect errors
    if (gradientCheck.found) details.hasGradientBackgrounds = true
    errors.push(...gradientCheck.errors)
    // ... (repeat for all checks)
  }

  // Calculate scores
  details.wireframeQuality = this.calculateWireframeScore(details)
  const score = this.calculateProductionScore(details, errors.length, warnings.length)

  // Determine validity (score >= 70 = production-ready)
  const isValid = score >= 70

  return { isValid, errors, warnings, score, details }
}
```

**Scoring:**
- **Wireframe Score:** 100 (pure wireframe) → 0 (production-ready)
  - Deducts 15 points for gradients
  - Deducts 15 points for deep shadows
  - Deducts 10 points for spacing, transitions, typography, etc.

- **Production Score:** 0-100
  - Starts at (100 - wireframeScore)
  - Deducts 5 points per error
  - Deducts 2 points per warning

**Threshold:** Score ≥ 70 = Production-ready

---

#### 7.3 Dependency Validator

**File:** `backend/src/services/dependencyValidator.ts`
**Class:** `DependencyValidator`
**Method:** `validate(files: GeneratedFile[])`

```typescript
// Location: backend/src/services/dependencyValidator.ts:79-215

async validate(files: GeneratedFile[]): Promise<DependencyValidationResult> {
  const errors: DependencyError[] = []
  const warnings: DependencyWarning[] = []

  // Step 1: Find package.json
  const packageJsonFile = files.find(f => f.path.endsWith('package.json'))
  if (!packageJsonFile) {
    return { isValid: false, errors: [{ type: 'no_package_json', ... }], ... }
  }

  // Step 2: Parse declared dependencies
  const packageJson = JSON.parse(packageJsonFile.content)
  const declaredDependencies = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]

  // Step 3: Extract all imports from code files
  const packageUsage = new Map<string, string[]>()

  for (const file of codeFiles) {
    const imports = this.extractImports(file.content)
    for (const packageName of imports) {
      if (!packageUsage.has(packageName)) {
        packageUsage.set(packageName, [])
      }
      packageUsage.get(packageName)!.push(file.path)
    }
  }

  // Step 4: Check for missing dependencies
  for (const [packageName, usedInFiles] of packageUsage.entries()) {
    if (!declaredDependencies.includes(packageName)) {
      const npmInfo = await this.getNpmPackageInfo(packageName)
      const suggestedVersion = npmInfo.latestVersion || SUGGESTED_VERSIONS[packageName] || 'latest'

      errors.push({
        type: 'missing_dependency',
        message: `Package "${packageName}" is imported but not in dependencies`,
        packageName,
        usedInFiles,
        suggestedVersion,
      })
    }
  }

  // Step 5: Check for deprecated APIs
  this.checkDeprecatedAPIs(codeFiles, warnings)

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalImports,
      uniquePackages: packageUsage.size,
      missingPackages: errors.length,
      declaredDependencies: declaredDependencies.length,
    },
  }
}
```

**Auto-Fix Method:**
```typescript
// Location: backend/src/services/dependencyValidator.ts:385-430

autoFix(files: GeneratedFile[], validationResult: DependencyValidationResult): GeneratedFile | null {
  const packageJsonFile = files.find(f => f.path.endsWith('package.json'))
  const packageJson = JSON.parse(packageJsonFile.content)

  // Add missing dependencies
  for (const error of validationResult.errors) {
    if (error.type === 'missing_dependency' && error.suggestedVersion) {
      if (!packageJson.dependencies) {
        packageJson.dependencies = {}
      }
      packageJson.dependencies[error.packageName] = error.suggestedVersion
      console.log(`Auto-fix: Added "${error.packageName}": "${error.suggestedVersion}"`)
    }
  }

  // Sort dependencies alphabetically
  const sorted = Object.keys(packageJson.dependencies).sort().reduce((acc, key) => {
    acc[key] = packageJson.dependencies[key]
    return acc
  }, {})
  packageJson.dependencies = sorted

  return {
    path: packageJsonFile.path,
    content: JSON.stringify(packageJson, null, 2),
    language: 'json',
  }
}
```

**Example Auto-Fix:**
```json
// BEFORE:
{
  "dependencies": {
    "react": "^18.2.0"
  }
}

// AFTER (auto-fixed):
{
  "dependencies": {
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "recharts": "^2.10.0"
  }
}
```

---

#### 7.4 Preview Validator (Optional)

**File:** `backend/src/services/previewValidator.ts`
**Status:** Experimental (disabled by default)
**Enable:** Set `ENABLE_PREVIEW_VALIDATION=true` in `.env`

**Purpose:** Launches headless browser (Puppeteer) to render preview and detect runtime errors

---

### PHASE 8: Scaffold Bundling

**File:** `backend/src/lib/scaffoldBundler.ts`

#### 8.1 detectUsedComponents()
```typescript
// Function: detectUsedComponents(files: GeneratedFile[]): string[]

export function detectUsedComponents(files: GeneratedFile[]): string[] {
  const usedComponents = new Set<string>()

  for (const file of files) {
    const content = file.content

    // Match: import { Button } from '@/components/ui/button'
    const importRegex = /from ['"]@\/components\/ui\/([^'"]+)['"]/g

    let match
    while ((match = importRegex.exec(content)) !== null) {
      const componentPath = match[1] // 'button', 'input', 'dialog', etc.
      usedComponents.add(componentPath)
    }
  }

  return Array.from(usedComponents)
}
```

**Example:**
```typescript
// Input files contain:
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'

// Returns:
['button', 'input', 'dialog']
```

---

#### 8.2 bundleScaffoldComponents()
```typescript
// Function: bundleScaffoldComponents(componentNames: string[]): GeneratedFile[]

export function bundleScaffoldComponents(componentNames: string[]): GeneratedFile[] {
  const files: GeneratedFile[] = []

  for (const componentName of componentNames) {
    const componentPath = path.join(SCAFFOLD_DIR, `${componentName}.tsx`)

    if (fs.existsSync(componentPath)) {
      const content = fs.readFileSync(componentPath, 'utf-8')

      files.push({
        path: `/src/components/ui/${componentName}.tsx`,
        content,
        language: 'typescript'
      })

      console.log(`Bundled scaffold: ${componentName}.tsx`)
    }
  }

  // Always include cn() utility
  if (componentNames.length > 0) {
    const utilsPath = path.join(SCAFFOLD_DIR, 'lib/utils.ts')
    if (fs.existsSync(utilsPath)) {
      files.push({
        path: '/src/lib/utils.ts',
        content: fs.readFileSync(utilsPath, 'utf-8'),
        language: 'typescript'
      })
      console.log('Bundled scaffold: lib/utils.ts (cn() utility)')
    }
  }

  return files
}
```

**Result:** Auto-bundles shadcn/ui component files into the generation output

---

### PHASE 9: Return to Frontend

#### 9.1 Response Journey
```
Backend aiService.generateCode()
  ↓ returns result.object
Backend Express router /api/generate
  ↓ res.json({ files, explanation, ... })
Frontend Next.js API route /api/generation/start
  ↓ NextResponse.json({ sessionId, files, ... })
Frontend GenerationService.generateApplication()
  ↓ calls callbacks (onFileStart, onFileComplete, onProgress, onComplete)
Frontend Builder v3 Component
  ↓ updates state (generatedFiles, progress, generationStatus)
  ↓ triggers Sandpack preview render
```

---

## File Locations Reference

### Frontend Files

| File | Location | Lines | Purpose |
|------|----------|-------|---------|
| Builder v3 Page | `frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx` | 35-115 | User interaction handler |
| Generation Service | `frontend/src/services/GenerationService.ts` | 28-106 | API client with callbacks |
| Generation Start API | `frontend/src/app/api/generation/start/route.ts` | 5-61 | Next.js API route (proxy) |

### Backend Files

| File | Location | Lines | Purpose |
|------|----------|-------|---------|
| Generation Router | `backend/src/routes/generation.ts` | 191-276 | Express route handler |
| AI Service | `backend/src/services/ai.ts` | 291-1234 | Core generation logic |
| - buildSystemPrompt | `backend/src/services/ai.ts` | 175-289 | System prompt builder |
| - convertPathAliases | `backend/src/services/ai.ts` | 137-169 | Path conversion |
| Output Validator | `backend/src/services/outputValidator.ts` | 49-88 | Structured validation |
| Styling Validator | `backend/src/services/stylingValidator.ts` | 66-181 | Production quality checks |
| Dependency Validator | `backend/src/services/dependencyValidator.ts` | 79-215 | Import/dependency checks |
| - autoFix | `backend/src/services/dependencyValidator.ts` | 385-430 | Auto-fix package.json |
| Scaffold Bundler | `backend/src/lib/scaffoldBundler.ts` | - | Component detection/bundling |

---

## Validation Pipeline Details

### Execution Order

1. **Tailwind CSS Validation** (inline, lines 441-547)
   - Detects generic class names like `className="metric-card"`
   - Triggers retry if found

2. **Echo Detection** (lines 549-664)
   - Checks if AI is just repeating prompt as text
   - Triggers retry with anti-echo instructions

3. **Quality Validation** (lines 666-759)
   - Checks file line count (min 30 lines)
   - Checks for placeholders
   - Currently disabled (ENABLE_QUALITY_RETRY = false)

4. **Minimum File Count** (lines 761-881)
   - Enforces minimum 6 files
   - Triggers retry with forceful prompt

5. **Comprehensive Validation** (lines 883-902)
   - Legacy validator from `lib/fileValidator.ts`
   - Logs but doesn't block

6. **Scaffold Integration** (lines 904-953)
   - Detects `@/components/ui/*` imports
   - Bundles shadcn/ui components

7. **Path Conversion** (line 956)
   - Converts `@/` to relative paths

8. **Output Validator** (lines 958-992)
   - Structured quality checks
   - **CRITICAL errors block generation**

9. **Styling Validator** (lines 994-1018)
   - Production quality scoring
   - **Non-blocking** (logs warnings)

10. **Dependency Validator** (lines 1020-1073)
    - Checks import/dependency consistency
    - **Auto-fixes package.json**

11. **Preview Validator** (lines 1075-1105)
    - Optional headless browser test
    - **Experimental** (disabled by default)

---

## Key Data Transformations

### 1. User Input → Enhanced Prompt
```typescript
// INPUT
{
  prompt: "Create a financial dashboard",
  settings: { selectedIndustry: "fintech", provider: "openai" }
}

// OUTPUT (enhancedPrompt)
`Create a financial dashboard

// + Component instructions from componentSelector
Use shadcn/ui Button, Card, Input components...

// + Industry template enhancement
Financial dashboards require compliance with SOX, PCI-DSS...

// + Critical requirements (2000+ chars)
🚨 CRITICAL GENERATION REQUIREMENTS 🚨
1. Generate COMPLETE application with 6-10 files minimum
2. Use ONLY Tailwind CSS utility classes
...`
```

---

### 2. AI Response → Structured Object
```typescript
// AI SDK Response (Zod schema)
{
  code: "", // Deprecated
  explanation: "A production-ready financial dashboard...",
  files: [
    {
      path: "src/App.tsx",
      content: "import React...",
      type: "create"
    },
    {
      path: "src/components/Dashboard.tsx",
      content: "'use client'...",
      type: "create"
    },
    ...
  ],
  dependencies: ["react", "react-dom"],
  instructions: "Run npm install && npm run dev"
}
```

---

### 3. Path Alias Conversion
```typescript
// BEFORE (AI-generated)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dashboard } from '@/components/Dashboard'

// AFTER (Sandpack-compatible)
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Dashboard } from '../Dashboard'
```

---

### 4. Dependency Auto-Fix
```typescript
// BEFORE (AI-generated package.json)
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}

// DETECTED IMPORTS
import { motion } from 'framer-motion'
import { BarChart } from 'recharts'
import { Camera } from 'lucide-react'

// AFTER (auto-fixed)
{
  "dependencies": {
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.0"
  }
}
```

---

### 5. Scaffold Bundling
```typescript
// DETECTED IMPORTS
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// BUNDLED FILES ADDED
[
  {
    path: '/src/components/ui/button.tsx',
    content: '/* shadcn/ui Button component */',
    language: 'typescript'
  },
  {
    path: '/src/components/ui/input.tsx',
    content: '/* shadcn/ui Input component */',
    language: 'typescript'
  },
  {
    path: '/src/lib/utils.ts',
    content: 'export function cn(...) { /* clsx + tailwind-merge */ }',
    language: 'typescript'
  }
]
```

---

## Summary

This complete sequence shows how a user's button click travels through:

1. **Frontend UI** → Builder v3 component captures user input
2. **Frontend Service** → GenerationService makes API call with callbacks
3. **Next.js Proxy** → API route forwards to backend
4. **Backend Router** → Express route calls AI service
5. **AI Service** → Builds enhanced prompt, calls AI SDK, runs validation pipeline
6. **Validation** → 4 validators check quality, styling, dependencies, output
7. **Transformation** → Path conversion, scaffold bundling, auto-fixes
8. **Return** → Files flow back through API layers to frontend
9. **Render** → Sandpack preview displays generated application

**Total Time:** ~5-15 seconds (depending on AI provider, file count, validation complexity)

**Key Success Metrics:**
- ✅ Minimum 6-10 files generated
- ✅ Zero CRITICAL validation errors
- ✅ Production quality score ≥ 70/100
- ✅ All dependencies auto-fixed in package.json
- ✅ Path aliases converted for Sandpack compatibility

---

**Document Version:** 1.0
**Last Updated:** 2025-10-10
**Maintained By:** Dyad Platform Engineering Team
