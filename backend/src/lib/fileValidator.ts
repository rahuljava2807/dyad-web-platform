/**
 * File Validation System
 *
 * Validates AI generation output to ensure multi-file architecture.
 * Enforces minimum file count and required file patterns.
 */

export interface GeneratedFile {
  path: string;
  content: string;
  language?: string;
  summary?: string;
}

export interface ValidationResult {
  isValid: boolean;
  files: GeneratedFile[];
  errors: string[];
  warnings: string[];
  fileCount: number;
}

export interface ValidationConfig {
  minFiles: number;
  requiredPatterns?: string[];
  requiredFileTypes?: string[];
}

/**
 * Validates generated files against requirements
 */
export function validateGeneratedFiles(
  files: GeneratedFile[],
  config: ValidationConfig = { minFiles: 3 }
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum file count
  if (files.length < config.minFiles) {
    errors.push(
      `Expected at least ${config.minFiles} files, but only ${files.length} were generated. ` +
      `Please generate more files to follow proper separation of concerns.`
    );
  }

  // Check for required file patterns
  if (config.requiredPatterns) {
    for (const pattern of config.requiredPatterns) {
      const hasPattern = files.some(f =>
        f.path.toLowerCase().includes(pattern.toLowerCase())
      );

      if (!hasPattern) {
        errors.push(`Missing required file pattern: "${pattern}"`);
      }
    }
  }

  // Check for required file types
  if (config.requiredFileTypes) {
    for (const type of config.requiredFileTypes) {
      const hasType = files.some(f => f.path.endsWith(type));

      if (!hasType) {
        warnings.push(`No ${type} file found. Consider adding one for better structure.`);
      }
    }
  }

  // Check for empty files
  const emptyFiles = files.filter(f => !f.content || f.content.trim().length === 0);
  if (emptyFiles.length > 0) {
    errors.push(
      `Found ${emptyFiles.length} empty file(s): ${emptyFiles.map(f => f.path).join(', ')}`
    );
  }

  // Check for duplicate files
  const paths = files.map(f => f.path);
  const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate files found: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    files,
    errors,
    warnings,
    fileCount: files.length
  };
}

/**
 * Validates auth-specific files (login, signup, etc.)
 */
export function validateAuthFiles(files: GeneratedFile[]): ValidationResult {
  return validateGeneratedFiles(files, {
    minFiles: 3,
    requiredPatterns: ['form', 'schema'],
    requiredFileTypes: ['.tsx', '.ts']
  });
}

/**
 * Validates dashboard files
 */
export function validateDashboardFiles(files: GeneratedFile[]): ValidationResult {
  return validateGeneratedFiles(files, {
    minFiles: 3,
    requiredPatterns: ['dashboard', 'card'],
    requiredFileTypes: ['.tsx']
  });
}

/**
 * Validates form files
 */
export function validateFormFiles(files: GeneratedFile[]): ValidationResult {
  return validateGeneratedFiles(files, {
    minFiles: 3,
    requiredPatterns: ['form', 'schema'],
    requiredFileTypes: ['.tsx', '.ts']
  });
}

/**
 * Checks if files use shadcn-ui components
 */
export function checkShadcnUsage(files: GeneratedFile[]): {
  usesShadcn: boolean;
  componentsFound: string[];
  suggestions: string[];
} {
  const shadcnImportPattern = /from\s+["']@\/components\/ui\/([\w-]+)["']/g;
  const componentsFound = new Set<string>();
  const suggestions: string[] = [];

  for (const file of files) {
    const matches = file.content.matchAll(shadcnImportPattern);
    for (const match of matches) {
      componentsFound.add(match[1]);
    }
  }

  const usesShadcn = componentsFound.size > 0;

  if (!usesShadcn) {
    suggestions.push('No shadcn-ui components detected. Consider using components from @/components/ui/*');
  }

  // Check for validation imports
  const usesValidation = files.some(f =>
    f.content.includes('react-hook-form') ||
    f.content.includes('zod') ||
    f.content.includes('zodResolver')
  );

  if (!usesValidation && files.some(f => f.path.includes('form') || f.path.includes('Form'))) {
    suggestions.push('Form detected but no validation library (zod/react-hook-form) found. Add validation for better UX.');
  }

  return {
    usesShadcn,
    componentsFound: Array.from(componentsFound),
    suggestions
  };
}

/**
 * Main validation function that combines all checks
 */
export function comprehensiveValidation(
  files: GeneratedFile[],
  featureType: 'auth' | 'dashboard' | 'form' | 'default' = 'default'
): ValidationResult & { shadcnCheck: ReturnType<typeof checkShadcnUsage> } {
  let validationResult: ValidationResult;

  // Select appropriate validator based on feature type
  switch (featureType) {
    case 'auth':
      validationResult = validateAuthFiles(files);
      break;
    case 'dashboard':
      validationResult = validateDashboardFiles(files);
      break;
    case 'form':
      validationResult = validateFormFiles(files);
      break;
    default:
      validationResult = validateGeneratedFiles(files, { minFiles: 3 });
  }

  // Add shadcn usage check
  const shadcnCheck = checkShadcnUsage(files);

  // Add shadcn suggestions to warnings
  validationResult.warnings.push(...shadcnCheck.suggestions);

  return {
    ...validationResult,
    shadcnCheck
  };
}

/**
 * Generates a human-readable validation report
 */
export function generateValidationReport(result: ValidationResult): string {
  let report = `📊 Validation Report\n`;
  report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  report += `Files Generated: ${result.fileCount}\n`;
  report += `Status: ${result.isValid ? '✅ PASSED' : '❌ FAILED'}\n\n`;

  if (result.errors.length > 0) {
    report += `❌ Errors (${result.errors.length}):\n`;
    result.errors.forEach((err, i) => {
      report += `  ${i + 1}. ${err}\n`;
    });
    report += `\n`;
  }

  if (result.warnings.length > 0) {
    report += `⚠️  Warnings (${result.warnings.length}):\n`;
    result.warnings.forEach((warn, i) => {
      report += `  ${i + 1}. ${warn}\n`;
    });
    report += `\n`;
  }

  if (result.isValid) {
    report += `✅ All validation checks passed!\n`;
  } else {
    report += `❌ Please fix the errors above and regenerate.\n`;
  }

  return report;
}
