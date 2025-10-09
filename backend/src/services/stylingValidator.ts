/**
 * Styling Quality Validator Service
 *
 * Validates that AI-generated code meets production-quality visual standards.
 * Checks for gradients, shadows, animations, spacing, and other design requirements.
 *
 * This validator enforces the "🎨 VISUAL DESIGN STANDARDS" section from AI_RULES.md
 */

export interface StylingValidationResult {
  isValid: boolean
  errors: StylingError[]
  warnings: StylingWarning[]
  score: number // 0-100, production-ready should be 80+
  details: QualityCheckDetails
}

export interface StylingError {
  type: 'gradient' | 'shadow' | 'spacing' | 'animation' | 'typography' | 'dark_mode' | 'border_radius'
  message: string
  filePath: string
  severity: 'critical' | 'high' | 'medium'
}

export interface StylingWarning {
  type: 'hover_effect' | 'icon_missing' | 'loading_state' | 'contrast'
  message: string
  filePath: string
}

export interface QualityCheckDetails {
  hasGradientBackgrounds: boolean
  hasDeepShadows: boolean
  hasProperSpacing: boolean
  hasSmoothTransitions: boolean
  hasHoverEffects: boolean
  hasTypographyHierarchy: boolean
  hasBorderRadius: boolean
  hasDarkMode: boolean
  hasIcons: boolean
  hasLoadingStates: boolean
  wireframeQuality: number // 0-100, lower is more wireframe-like
}

export interface GeneratedFile {
  path: string
  content: string
  language: string
}

export class StylingValidator {
  private static instance: StylingValidator

  private constructor() {}

  static getInstance(): StylingValidator {
    if (!StylingValidator.instance) {
      StylingValidator.instance = new StylingValidator()
    }
    return StylingValidator.instance
  }

  /**
   * Main validation method - validates production-quality styling
   */
  validate(files: GeneratedFile[]): StylingValidationResult {
    const errors: StylingError[] = []
    const warnings: StylingWarning[] = []

    console.log(`[StylingValidator] Validating ${files.length} files for production quality...`)

    // Initialize quality check details
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

    // Filter component files (TSX/JSX)
    const componentFiles = files.filter(f =>
      f.path.endsWith('.tsx') || f.path.endsWith('.jsx')
    )

    if (componentFiles.length === 0) {
      console.log('[StylingValidator] No component files to validate')
      return {
        isValid: true,
        errors: [],
        warnings: [],
        score: 100,
        details,
      }
    }

    // Run all styling checks
    for (const file of componentFiles) {
      // Skip config/test files
      if (this.shouldSkipFile(file)) continue

      // 1. Check for gradient backgrounds
      const gradientCheck = this.checkGradientBackgrounds(file)
      if (gradientCheck.found) details.hasGradientBackgrounds = true
      errors.push(...gradientCheck.errors)

      // 2. Check for deep shadows
      const shadowCheck = this.checkDeepShadows(file)
      if (shadowCheck.found) details.hasDeepShadows = true
      errors.push(...shadowCheck.errors)

      // 3. Check for proper spacing
      const spacingCheck = this.checkProperSpacing(file)
      if (spacingCheck.found) details.hasProperSpacing = true
      errors.push(...spacingCheck.errors)

      // 4. Check for smooth transitions
      const transitionCheck = this.checkSmoothTransitions(file)
      if (transitionCheck.found) details.hasSmoothTransitions = true
      errors.push(...transitionCheck.errors)

      // 5. Check for hover effects
      const hoverCheck = this.checkHoverEffects(file)
      if (hoverCheck.found) details.hasHoverEffects = true
      warnings.push(...hoverCheck.warnings)

      // 6. Check for typography hierarchy
      const typographyCheck = this.checkTypographyHierarchy(file)
      if (typographyCheck.found) details.hasTypographyHierarchy = true
      errors.push(...typographyCheck.errors)

      // 7. Check for border radius
      const borderRadiusCheck = this.checkBorderRadius(file)
      if (borderRadiusCheck.found) details.hasBorderRadius = true
      errors.push(...borderRadiusCheck.errors)

      // 8. Check for dark mode
      const darkModeCheck = this.checkDarkMode(file)
      if (darkModeCheck.found) details.hasDarkMode = true
      errors.push(...darkModeCheck.errors)

      // 9. Check for lucide-react icons
      const iconCheck = this.checkIcons(file)
      if (iconCheck.found) details.hasIcons = true
      warnings.push(...iconCheck.warnings)

      // 10. Check for loading states
      const loadingCheck = this.checkLoadingStates(file)
      if (loadingCheck.found) details.hasLoadingStates = true
      warnings.push(...loadingCheck.warnings)
    }

    // Calculate wireframe quality score (0-100, higher = more wireframe-like)
    details.wireframeQuality = this.calculateWireframeScore(details)

    // Calculate overall production quality score (0-100, higher = better)
    const score = this.calculateProductionScore(details, errors.length, warnings.length)

    // Determine if code is valid (score >= 70 = production-ready)
    const isValid = score >= 70

    if (isValid) {
      console.log(`[StylingValidator] ✅ Styling validation passed (Score: ${score}/100, Wireframe: ${details.wireframeQuality}/100)`)
    } else {
      console.log(`[StylingValidator] ❌ Styling validation failed (Score: ${score}/100, Too wireframe-like: ${details.wireframeQuality}/100)`)
    }

    return {
      isValid,
      errors,
      warnings,
      score,
      details,
    }
  }

  /**
   * Check if file should be skipped
   */
  private shouldSkipFile(file: GeneratedFile): boolean {
    const skipPatterns = [
      'package.json',
      'tsconfig',
      'README',
      '.test.',
      '.spec.',
      'vite.config',
      'tailwind.config',
    ]
    return skipPatterns.some(pattern => file.path.includes(pattern))
  }

  /**
   * 1. Check for gradient backgrounds (MANDATORY for full-page layouts)
   */
  private checkGradientBackgrounds(file: GeneratedFile): { found: boolean; errors: StylingError[] } {
    const errors: StylingError[] = []
    const content = file.content

    // Look for full-page container patterns
    const hasFullPageContainer = /className=["'][^"']*(?:min-h-screen|h-screen|h-full)[^"']*["']/i.test(content)

    if (!hasFullPageContainer) {
      // Not a full-page layout, skip gradient check
      return { found: false, errors: [] }
    }

    // Check if it has gradient backgrounds
    const gradientPatterns = [
      /bg-gradient-to-(?:br|r|l|t|b|tr|tl|bl)/,
      /from-\w+-\d+/,
      /via-\w+-\d+/,
      /to-\w+-\d+/,
    ]

    const hasGradient = gradientPatterns.every(pattern => pattern.test(content))

    if (!hasGradient) {
      errors.push({
        type: 'gradient',
        message: `${file.path}: Full-page layout missing gradient background. Use: bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50`,
        filePath: file.path,
        severity: 'critical',
      })
      return { found: false, errors }
    }

    return { found: true, errors: [] }
  }

  /**
   * 2. Check for deep shadows (MANDATORY for cards and containers)
   */
  private checkDeepShadows(file: GeneratedFile): { found: boolean; errors: StylingError[] } {
    const errors: StylingError[] = []
    const content = file.content

    // Look for card/container patterns
    const hasCards = /className=["'][^"']*(?:bg-white|bg-gray-800|rounded)[^"']*["']/i.test(content)

    if (!hasCards) {
      // No cards found, skip shadow check
      return { found: false, errors: [] }
    }

    // Check for deep shadows
    const hasDeepShadows = /shadow-(?:xl|2xl)/.test(content)
    const hasShadowAccent = /shadow-\w+-\d+\/\d+/.test(content) // e.g., shadow-purple-500/10

    if (!hasDeepShadows) {
      errors.push({
        type: 'shadow',
        message: `${file.path}: Cards/containers missing deep shadows. Use: shadow-xl or shadow-2xl with color accent (shadow-purple-500/10)`,
        filePath: file.path,
        severity: 'high',
      })
      return { found: false, errors }
    }

    return { found: true, errors: [] }
  }

  /**
   * 3. Check for proper spacing (p-8 minimum for cards)
   */
  private checkProperSpacing(file: GeneratedFile): { found: boolean; errors: StylingError[] } {
    const errors: StylingError[] = []
    const content = file.content

    // Look for card patterns
    const hasCards = /className=["'][^"']*(?:bg-white|bg-gray-800|rounded)[^"']*["']/i.test(content)

    if (!hasCards) {
      return { found: false, errors: [] }
    }

    // Check for generous spacing (p-8, p-10, p-12, etc.)
    const hasGenerousSpacing = /p-(?:8|10|12|16)/.test(content)

    // Check for cramped spacing (p-4 or less)
    const hasCrampedSpacing = /p-[1-4]\b/.test(content)

    if (hasCrampedSpacing && !hasGenerousSpacing) {
      errors.push({
        type: 'spacing',
        message: `${file.path}: Cards have cramped spacing (p-4 or less). Use p-8 minimum for professional polish`,
        filePath: file.path,
        severity: 'medium',
      })
      return { found: false, errors }
    }

    return { found: hasGenerousSpacing, errors: [] }
  }

  /**
   * 4. Check for smooth transitions (MANDATORY on interactive elements)
   */
  private checkSmoothTransitions(file: GeneratedFile): { found: boolean; errors: StylingError[] } {
    const errors: StylingError[] = []
    const content = file.content

    // Look for interactive elements (buttons, links, cards with hover)
    const hasInteractive = /(?:Button|button|onClick|href|hover:)/.test(content)

    if (!hasInteractive) {
      return { found: false, errors: [] }
    }

    // Check for transition classes
    const hasTransitions = /transition-(?:all|colors|transform|opacity|shadow)/.test(content)
    const hasDuration = /duration-\d+/.test(content)

    if (!hasTransitions || !hasDuration) {
      errors.push({
        type: 'animation',
        message: `${file.path}: Interactive elements missing smooth transitions. Add: transition-all duration-200`,
        filePath: file.path,
        severity: 'high',
      })
      return { found: false, errors }
    }

    return { found: true, errors: [] }
  }

  /**
   * 5. Check for hover effects (buttons, links)
   */
  private checkHoverEffects(file: GeneratedFile): { found: boolean; warnings: StylingWarning[] } {
    const warnings: StylingWarning[] = []
    const content = file.content

    // Look for buttons
    const hasButtons = /(?:Button|button|btn)/.test(content)

    if (!hasButtons) {
      return { found: false, warnings: [] }
    }

    // Check for hover effects
    const hasHoverScale = /hover:scale-\[1\.\d+\]/.test(content)
    const hasHoverShadow = /hover:shadow-(?:lg|xl|2xl)/.test(content)
    const hasHoverColor = /hover:(?:bg|text|border)-\w+-\d+/.test(content)

    const hasAnyHover = hasHoverScale || hasHoverShadow || hasHoverColor

    if (!hasAnyHover) {
      warnings.push({
        type: 'hover_effect',
        message: `${file.path}: Buttons missing hover effects. Add: hover:scale-[1.02] hover:shadow-xl`,
        filePath: file.path,
      })
      return { found: false, warnings }
    }

    return { found: true, warnings: [] }
  }

  /**
   * 6. Check for typography hierarchy
   */
  private checkTypographyHierarchy(file: GeneratedFile): { found: boolean; errors: StylingError[] } {
    const errors: StylingError[] = []
    const content = file.content

    // Look for headings
    const hasHeadings = /<h[1-6]/i.test(content)

    if (!hasHeadings) {
      return { found: false, errors: [] }
    }

    // Check for proper heading styles
    const hasH1Styles = /text-(?:3xl|4xl|5xl).*font-bold/.test(content) || /font-bold.*text-(?:3xl|4xl|5xl)/.test(content)
    const hasH2Styles = /text-(?:2xl|3xl).*font-(?:semibold|bold)/.test(content) || /font-(?:semibold|bold).*text-(?:2xl|3xl)/.test(content)

    if (!hasH1Styles && !hasH2Styles) {
      errors.push({
        type: 'typography',
        message: `${file.path}: Headings missing proper typography hierarchy. Use: text-3xl font-bold for H1, text-2xl font-semibold for H2`,
        filePath: file.path,
        severity: 'medium',
      })
      return { found: false, errors }
    }

    return { found: true, errors: [] }
  }

  /**
   * 7. Check for border radius standards
   */
  private checkBorderRadius(file: GeneratedFile): { found: boolean; errors: StylingError[] } {
    const errors: StylingError[] = []
    const content = file.content

    // Look for rounded elements
    const hasRoundedElements = /rounded/.test(content)

    if (!hasRoundedElements) {
      errors.push({
        type: 'border_radius',
        message: `${file.path}: Elements missing modern border radius. Use: rounded-xl for components, rounded-2xl for cards`,
        filePath: file.path,
        severity: 'medium',
      })
      return { found: false, errors }
    }

    // Check for modern rounded styles (xl, 2xl)
    const hasModernRounded = /rounded-(?:xl|2xl)/.test(content)

    if (!hasModernRounded) {
      errors.push({
        type: 'border_radius',
        message: `${file.path}: Using basic 'rounded' instead of rounded-xl or rounded-2xl. Upgrade for modern look`,
        filePath: file.path,
        severity: 'medium',
      })
      return { found: false, errors }
    }

    return { found: true, errors: [] }
  }

  /**
   * 8. Check for dark mode support
   */
  private checkDarkMode(file: GeneratedFile): { found: boolean; errors: StylingError[] } {
    const errors: StylingError[] = []
    const content = file.content

    // Look for color classes
    const hasColorClasses = /(?:bg|text|border)-(?:white|gray|blue|purple|pink|red|green)-\d+/.test(content)

    if (!hasColorClasses) {
      return { found: false, errors: [] }
    }

    // Check for dark: variants
    const hasDarkMode = /dark:(?:bg|text|border)-\w+-\d+/.test(content)

    if (!hasDarkMode) {
      errors.push({
        type: 'dark_mode',
        message: `${file.path}: Missing dark mode variants. Add dark: prefix to all color classes`,
        filePath: file.path,
        severity: 'high',
      })
      return { found: false, errors }
    }

    return { found: true, errors: [] }
  }

  /**
   * 9. Check for lucide-react icons
   */
  private checkIcons(file: GeneratedFile): { found: boolean; warnings: StylingWarning[] } {
    const warnings: StylingWarning[] = []
    const content = file.content

    // Check if file imports lucide-react
    const hasLucideImport = /from ['"]lucide-react['"]/.test(content)

    // Look for buttons or interactive elements
    const hasInteractive = /(?:Button|button|onClick)/.test(content)

    if (hasInteractive && !hasLucideImport) {
      warnings.push({
        type: 'icon_missing',
        message: `${file.path}: Consider adding lucide-react icons for visual polish`,
        filePath: file.path,
      })
      return { found: false, warnings }
    }

    return { found: hasLucideImport, warnings: [] }
  }

  /**
   * 10. Check for loading states
   */
  private checkLoadingStates(file: GeneratedFile): { found: boolean; warnings: StylingWarning[] } {
    const warnings: StylingWarning[] = []
    const content = file.content

    // Look for async operations
    const hasAsync = /(?:onClick|onSubmit|async|await|fetch|api)/.test(content)

    if (!hasAsync) {
      return { found: false, warnings: [] }
    }

    // Check for loading state handling
    const hasLoadingState = /(?:isLoading|loading|isPending|Loader2|Spinner|animate-spin)/.test(content)

    if (!hasLoadingState) {
      warnings.push({
        type: 'loading_state',
        message: `${file.path}: Async operations missing loading states. Add <Loader2 className="animate-spin" /> from lucide-react`,
        filePath: file.path,
      })
      return { found: false, warnings }
    }

    return { found: true, warnings: [] }
  }

  /**
   * Calculate wireframe quality score (0-100, higher = more wireframe-like)
   */
  private calculateWireframeScore(details: QualityCheckDetails): number {
    let wireframeScore = 100 // Start at 100 (pure wireframe)

    // Deduct points for each production quality feature
    if (details.hasGradientBackgrounds) wireframeScore -= 15
    if (details.hasDeepShadows) wireframeScore -= 15
    if (details.hasProperSpacing) wireframeScore -= 10
    if (details.hasSmoothTransitions) wireframeScore -= 10
    if (details.hasHoverEffects) wireframeScore -= 10
    if (details.hasTypographyHierarchy) wireframeScore -= 10
    if (details.hasBorderRadius) wireframeScore -= 10
    if (details.hasDarkMode) wireframeScore -= 10
    if (details.hasIcons) wireframeScore -= 5
    if (details.hasLoadingStates) wireframeScore -= 5

    return Math.max(0, wireframeScore)
  }

  /**
   * Calculate overall production quality score (0-100, higher = better)
   */
  private calculateProductionScore(
    details: QualityCheckDetails,
    errorCount: number,
    warningCount: number
  ): number {
    // Start with quality check score (100 - wireframe score)
    let score = 100 - details.wireframeQuality

    // Deduct points for errors (critical issues)
    score -= errorCount * 5

    // Deduct points for warnings (minor issues)
    score -= warningCount * 2

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Format validation results for logging/display
   */
  formatResults(result: StylingValidationResult): string {
    let output = '\n=== STYLING VALIDATION RESULTS ===\n'

    output += `\n📊 PRODUCTION QUALITY SCORE: ${result.score}/100`
    output += `\n📐 WIREFRAME QUALITY: ${result.details.wireframeQuality}/100 (lower is better)`

    if (result.score >= 90) {
      output += '\n✨ EXCELLENT - Production-ready, modern SaaS quality!\n'
    } else if (result.score >= 70) {
      output += '\n✅ GOOD - Production-ready with minor improvements needed\n'
    } else if (result.score >= 50) {
      output += '\n⚠️  FAIR - Needs significant styling improvements\n'
    } else {
      output += '\n❌ POOR - Wireframe quality, NOT production-ready\n'
    }

    output += '\n🎨 QUALITY CHECKS:\n'
    output += `  ${result.details.hasGradientBackgrounds ? '✅' : '❌'} Gradient backgrounds\n`
    output += `  ${result.details.hasDeepShadows ? '✅' : '❌'} Deep shadows\n`
    output += `  ${result.details.hasProperSpacing ? '✅' : '❌'} Proper spacing (p-8+)\n`
    output += `  ${result.details.hasSmoothTransitions ? '✅' : '❌'} Smooth transitions\n`
    output += `  ${result.details.hasHoverEffects ? '✅' : '❌'} Hover effects\n`
    output += `  ${result.details.hasTypographyHierarchy ? '✅' : '❌'} Typography hierarchy\n`
    output += `  ${result.details.hasBorderRadius ? '✅' : '❌'} Modern border radius\n`
    output += `  ${result.details.hasDarkMode ? '✅' : '❌'} Dark mode support\n`
    output += `  ${result.details.hasIcons ? '✅' : '⚠️ '} Icon usage\n`
    output += `  ${result.details.hasLoadingStates ? '✅' : '⚠️ '} Loading states\n`

    if (result.errors.length > 0) {
      output += '\n❌ ERRORS:\n'
      for (const error of result.errors) {
        output += `  - [${error.severity.toUpperCase()}] ${error.message}\n`
      }
    }

    if (result.warnings.length > 0) {
      output += '\n⚠️  WARNINGS:\n'
      for (const warning of result.warnings) {
        output += `  - ${warning.message}\n`
      }
    }

    if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
      output += '\n🎉 All styling checks passed! Code is production-ready!\n'
    }

    output += '\n=================================\n'
    return output
  }
}

// Export singleton instance
export const stylingValidator = StylingValidator.getInstance()
