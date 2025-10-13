/**
 * Dependency Validator Service
 *
 * Validates that all npm package imports have corresponding entries in package.json.
 * Prevents runtime errors like "Could not find dependency: 'package-name'"
 *
 * This is critical for Sandpack preview - all imported packages MUST be in dependencies.
 */

export interface DependencyValidationResult {
  isValid: boolean
  errors: DependencyError[]
  warnings: DependencyWarning[]
  summary: {
    totalImports: number
    uniquePackages: number
    missingPackages: number
    declaredDependencies: number
  }
}

export interface DependencyError {
  type: 'missing_dependency' | 'no_package_json' | 'invalid_package_json'
  message: string
  packageName: string
  usedInFiles: string[]
  suggestedVersion?: string
}

export interface DependencyWarning {
  type: 'unused_dependency' | 'outdated_api'
  message: string
  packageName?: string
}

export interface GeneratedFile {
  path: string
  content: string
  language: string
}

// Common package versions (keep updated)
const SUGGESTED_VERSIONS: Record<string, string> = {
  'react': '^18.2.0',
  'react-dom': '^18.2.0',
  'react-router-dom': '^6.20.0',
  'framer-motion': '^10.16.0',
  'lucide-react': '^0.294.0',
  'recharts': '^2.10.0',
  'zod': '^3.22.0',
  'react-hook-form': '^7.48.0',
  '@hookform/resolvers': '^3.3.2',
  'date-fns': '^2.30.0',
  'clsx': '^2.0.0',
  'tailwind-merge': '^2.1.0',
  '@radix-ui/react-dialog': '^1.0.5',
  '@radix-ui/react-dropdown-menu': '^2.0.6',
  '@radix-ui/react-select': '^2.0.0',
  '@radix-ui/react-tabs': '^1.0.4',
  '@radix-ui/react-toast': '^1.1.5',
  '@radix-ui/react-tooltip': '^1.0.7',
}

export class DependencyValidator {
  private static instance: DependencyValidator

  private constructor() {}

  static getInstance(): DependencyValidator {
    if (!DependencyValidator.instance) {
      DependencyValidator.instance = new DependencyValidator()
    }
    return DependencyValidator.instance
  }

  /**
   * Main validation method - validates dependency consistency
   */
  async validate(files: GeneratedFile[]): Promise<DependencyValidationResult> {
    const errors: DependencyError[] = []
    const warnings: DependencyWarning[] = []

    console.log(`[DependencyValidator] Validating ${files.length} files for dependency consistency...`)

    // 1. Find package.json
    const packageJsonFile = files.find(f => f.path.endsWith('package.json'))

    if (!packageJsonFile) {
      errors.push({
        type: 'no_package_json',
        message: 'No package.json found in generated files',
        packageName: 'package.json',
        usedInFiles: [],
      })

      return {
        isValid: false,
        errors,
        warnings,
        summary: {
          totalImports: 0,
          uniquePackages: 0,
          missingPackages: 1,
          declaredDependencies: 0,
        },
      }
    }

    // 2. Parse package.json dependencies
    let declaredDependencies: string[] = []
    try {
      const packageJson = JSON.parse(packageJsonFile.content)
      const deps = packageJson.dependencies || {}
      const devDeps = packageJson.devDependencies || {}
      declaredDependencies = [...Object.keys(deps), ...Object.keys(devDeps)]
    } catch (error) {
      errors.push({
        type: 'invalid_package_json',
        message: 'package.json is not valid JSON',
        packageName: 'package.json',
        usedInFiles: [packageJsonFile.path],
      })

      return {
        isValid: false,
        errors,
        warnings,
        summary: {
          totalImports: 0,
          uniquePackages: 0,
          missingPackages: 1,
          declaredDependencies: 0,
        },
      }
    }

    // 3. Extract all imports from code files
    const codeFiles = files.filter(f =>
      f.path.endsWith('.tsx') ||
      f.path.endsWith('.ts') ||
      f.path.endsWith('.jsx') ||
      f.path.endsWith('.js')
    )

    // Map of package name to files that import it
    const packageUsage = new Map<string, string[]>()
    let totalImports = 0

    for (const file of codeFiles) {
      const imports = this.extractImports(file.content)
      totalImports += imports.length

      for (const packageName of imports) {
        if (!packageUsage.has(packageName)) {
          packageUsage.set(packageName, [])
        }
        packageUsage.get(packageName)!.push(file.path)
      }
    }

    // 4. Check for missing dependencies
    const uniquePackages = packageUsage.size
    let missingPackages = 0

    for (const [packageName, usedInFiles] of packageUsage.entries()) {
      if (!declaredDependencies.includes(packageName)) {
        missingPackages++

        const npmInfo = await this.getNpmPackageInfo(packageName);
        const suggestedVersion = npmInfo.latestVersion || SUGGESTED_VERSIONS[packageName] || 'latest';

        errors.push({
          type: 'missing_dependency',
          message: `Package "${packageName}" is imported but not in dependencies array`,
          packageName,
          usedInFiles,
          suggestedVersion,
        })

        if (npmInfo.typesPackage && !declaredDependencies.includes(npmInfo.typesPackage)) {
          missingPackages++;
          errors.push({
            type: 'missing_dependency',
            message: `Types for package "${packageName}" are available but not in dependencies array`,
            packageName: npmInfo.typesPackage,
            usedInFiles,
            suggestedVersion: 'latest',
          });
        }
      }
    }

    // 5. Check for deprecated APIs
    this.checkDeprecatedAPIs(codeFiles, warnings)

    const isValid = errors.length === 0

    if (isValid) {
      console.log(`[DependencyValidator] ✅ All ${uniquePackages} packages are declared in dependencies`)
    } else {
      console.log(`[DependencyValidator] ❌ Found ${missingPackages} missing dependencies`)
    }

    return {
      isValid,
      errors,
      warnings,
      summary: {
        totalImports,
        uniquePackages,
        missingPackages,
        declaredDependencies: declaredDependencies.length,
      },
    }
  }

  /**
   * Extract npm package names from import statements
   * Excludes relative imports (./Component, ../utils)
   */
  private extractImports(content: string): string[] {
    const packages = new Set<string>()

    // Match all import statements
    // import { X } from 'package-name'
    // import X from 'package-name'
    // import * as X from 'package-name'
    // import 'package-name'
    const importRegex = /(?:import|export)(?:\s+(?:[\w*{}\s,]+)\s+from)?\s+['"]([^'"]+)['"]/g

    let match
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1]

      // Skip relative imports
      if (importPath.startsWith('.') || importPath.startsWith('/')) {
        continue
      }

      // Extract package name (handle scoped packages like @radix-ui/react-dialog)
      const packageName = this.extractPackageName(importPath)
      if (packageName) {
        packages.add(packageName)
      }
    }

    return Array.from(packages)
  }

  /**
   * Extract the npm package name from an import path
   * Examples:
   * - 'react' -> 'react'
   * - 'react-router-dom' -> 'react-router-dom'
   * - '@radix-ui/react-dialog' -> '@radix-ui/react-dialog'
   * - 'lodash/debounce' -> 'lodash'
   */
  private extractPackageName(importPath: string): string | null {
    // Scoped package (@org/package or @org/package/subpath)
    if (importPath.startsWith('@')) {
      const parts = importPath.split('/')
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`
      }
      return null
    }

    // Regular package (package or package/subpath)
    const parts = importPath.split('/')
    return parts[0] || null
  }

  private async getNpmPackageInfo(packageName: string): Promise<{ latestVersion: string | null, typesPackage: string | null }> {
    try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      if (!response.ok) {
        return { latestVersion: null, typesPackage: null };
      }
      const data = await response.json();
      const latestVersion = data['dist-tags']?.latest || null;

      const typesPackageName = `@types/${packageName}`;
      const typesResponse = await fetch(`https://registry.npmjs.org/${typesPackageName}`);
      const typesPackage = typesResponse.ok ? typesPackageName : null;

      return { latestVersion, typesPackage };
    } catch (error) {
      console.error(`[DependencyValidator] Error fetching npm package info for ${packageName}:`, error);
      return { latestVersion: null, typesPackage: null };
    }
  }

  /**
   * Check for deprecated APIs that should be updated
   */
  private checkDeprecatedAPIs(files: GeneratedFile[], warnings: DependencyWarning[]): void {
    for (const file of files) {
      const content = file.content

      // React Router v5 -> v6 migration
      // v5 uses Switch, v6 uses Routes
      if (content.includes('react-router-dom')) {
        if (content.includes('Switch')) {
          warnings.push({
            type: 'outdated_api',
            message: `${file.path}: Using deprecated Switch from react-router-dom v5. Upgrade to Routes (v6)`,
            packageName: 'react-router-dom',
          })
        }

        // v6 uses element prop, not component prop
        if (content.includes('<Route component=')) {
          warnings.push({
            type: 'outdated_api',
            message: `${file.path}: Using deprecated 'component' prop on Route. Use 'element' prop in react-router-dom v6`,
            packageName: 'react-router-dom',
          })
        }
      }

      // Framer Motion: animate vs initial/animate
      if (content.includes('framer-motion') && content.includes('animate={{')) {
        // This is actually OK, just a note
        // Could add more sophisticated checks here
      }
    }
  }

  /**
   * Format validation results for logging/display
   */
  formatResults(result: DependencyValidationResult): string {
    let output = '\n=== DEPENDENCY VALIDATION RESULTS ===\n'

    output += `\n📦 SUMMARY:\n`
    output += `  Total imports: ${result.summary.totalImports}\n`
    output += `  Unique packages: ${result.summary.uniquePackages}\n`
    output += `  Declared dependencies: ${result.summary.declaredDependencies}\n`
    output += `  Missing packages: ${result.summary.missingPackages}\n`

    if (result.isValid) {
      output += '\n✅ All imported packages are declared in dependencies!\n'
    } else {
      output += '\n❌ DEPENDENCY ERRORS DETECTED\n'
    }

    if (result.errors.length > 0) {
      output += '\n❌ ERRORS:\n'
      for (const error of result.errors) {
        output += `\n  📦 ${error.packageName}\n`
        output += `     Type: ${error.type}\n`
        output += `     Message: ${error.message}\n`

        if (error.usedInFiles.length > 0) {
          output += `     Used in:\n`
          for (const file of error.usedInFiles.slice(0, 5)) {
            output += `       - ${file}\n`
          }
          if (error.usedInFiles.length > 5) {
            output += `       ... and ${error.usedInFiles.length - 5} more files\n`
          }
        }

        if (error.suggestedVersion) {
          output += `     ✅ FIX: Add to package.json dependencies:\n`
          output += `        "${error.packageName}": "${error.suggestedVersion}"\n`
        }
      }
    }

    if (result.warnings.length > 0) {
      output += '\n⚠️  WARNINGS:\n'
      for (const warning of result.warnings) {
        output += `  - ${warning.message}\n`
      }
    }

    output += '\n====================================\n'
    return output
  }

  /**
   * Auto-fix: Generate corrected package.json with missing dependencies
   */
  autoFix(files: GeneratedFile[], validationResult: DependencyValidationResult): GeneratedFile | null {
    if (validationResult.isValid || validationResult.errors.length === 0) {
      return null
    }

    // Find package.json
    const packageJsonFile = files.find(f => f.path.endsWith('package.json'))
    if (!packageJsonFile) {
      return null
    }

    try {
      const packageJson = JSON.parse(packageJsonFile.content)

      // Add missing dependencies
      for (const error of validationResult.errors) {
        if (error.type === 'missing_dependency' && error.suggestedVersion) {
          if (!packageJson.dependencies) {
            packageJson.dependencies = {}
          }
          packageJson.dependencies[error.packageName] = error.suggestedVersion
          console.log(`[DependencyValidator] Auto-fix: Added "${error.packageName}": "${error.suggestedVersion}"`)
        }
      }

      // Sort dependencies alphabetically
      if (packageJson.dependencies) {
        const sorted = Object.keys(packageJson.dependencies)
          .sort()
          .reduce((acc, key) => {
            acc[key] = packageJson.dependencies[key]
            return acc
          }, {} as Record<string, string>)
        packageJson.dependencies = sorted
      }

      return {
        path: packageJsonFile.path,
        content: JSON.stringify(packageJson, null, 2),
        language: 'json',
      }
    } catch (error) {
      console.error('[DependencyValidator] Auto-fix failed:', error)
      return null
    }
  }
}

// Export singleton instance
export const dependencyValidator = DependencyValidator.getInstance()
