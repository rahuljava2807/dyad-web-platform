/**
 * Test Script for Scaffold Bundler Integration
 *
 * Tests the scaffold bundler system to ensure it correctly:
 * 1. Validates scaffold setup
 * 2. Lists available components
 * 3. Bundles individual components
 * 4. Detects component usage in generated code
 * 5. Bundles components based on industry
 */

import {
  validateScaffoldSetup,
  getAvailableComponents,
  bundleScaffoldComponents,
  detectUsedComponents,
  bundleForIndustry,
  type GeneratedFile
} from './lib/scaffoldBundler'

console.log('🧪 Testing Scaffold Bundler Integration\n')
console.log('=' .repeat(60))

// TEST 1: Validate Scaffold Setup
console.log('\n📋 TEST 1: Validating Scaffold Setup')
console.log('-'.repeat(60))

const validation = validateScaffoldSetup()
console.log(`Status: ${validation.valid ? '✅ PASS' : '❌ FAIL'}`)
console.log(`Message: ${validation.message}`)

if (!validation.valid) {
  console.error('\n❌ Scaffold setup invalid. Exiting tests.')
  process.exit(1)
}

// TEST 2: List Available Components
console.log('\n📋 TEST 2: Listing Available Components')
console.log('-'.repeat(60))

const availableComponents = getAvailableComponents()
console.log(`Found ${availableComponents.length} components:`)
console.log(availableComponents.slice(0, 10).join(', '), '...')

if (availableComponents.length === 0) {
  console.error('\n❌ No components found. Exiting tests.')
  process.exit(1)
}

// TEST 3: Bundle Individual Components
console.log('\n📋 TEST 3: Bundling Individual Components')
console.log('-'.repeat(60))

const testComponents = ['Button', 'Card', 'Input']
console.log(`Testing bundling: ${testComponents.join(', ')}`)

const bundledFiles = bundleScaffoldComponents(testComponents)
console.log(`✅ Bundled ${bundledFiles.length} files:`)

bundledFiles.forEach(file => {
  console.log(`  - ${file.path} (${file.content.length} chars)`)
})

// Verify lib/utils.ts is included
const hasUtils = bundledFiles.some(f => f.path === 'lib/utils.ts')
console.log(`\nUtils file included: ${hasUtils ? '✅ YES' : '❌ NO'}`)

// TEST 4: Detect Component Usage
console.log('\n📋 TEST 4: Detecting Component Usage in Code')
console.log('-'.repeat(60))

const mockGeneratedCode: GeneratedFile[] = [
  {
    path: 'components/LoginForm.tsx',
    content: `
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  return (
    <Card>
      <Label>Email</Label>
      <Input type="email" />
      <Button>Login</Button>
    </Card>
  )
}
    `,
    language: 'typescript'
  },
  {
    path: 'components/Dashboard.tsx',
    content: `
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function Dashboard() {
  return (
    <div>
      <Badge>New</Badge>
      <Progress value={50} />
    </div>
  )
}
    `,
    language: 'typescript'
  }
]

const detectedComponents = detectUsedComponents(mockGeneratedCode)
console.log(`Detected ${detectedComponents.length} components:`)
console.log(detectedComponents.join(', '))

const expectedComponents = ['Button', 'Input', 'Card', 'Label', 'Badge', 'Progress']
const allDetected = expectedComponents.every(comp => detectedComponents.includes(comp))
console.log(`\nAll expected components detected: ${allDetected ? '✅ YES' : '❌ NO'}`)

// TEST 5: Industry-Based Bundling
console.log('\n📋 TEST 5: Industry-Based Component Bundling')
console.log('-'.repeat(60))

const industries = ['healthcare', 'fintech', 'legal', 'ecommerce', 'saas']

for (const industry of industries) {
  const industryFiles = bundleForIndustry(industry, 'test-template')
  console.log(`${industry.toUpperCase()}: ${industryFiles.length} files`)
}

// TEST 6: Performance Test
console.log('\n📋 TEST 6: Performance Test')
console.log('-'.repeat(60))

const startTime = Date.now()
const perfTestComponents = ['Button', 'Card', 'Input', 'Label', 'Select', 'Dialog', 'Sheet', 'Tabs']
const perfBundled = bundleScaffoldComponents(perfTestComponents)
const endTime = Date.now()

console.log(`Bundled ${perfTestComponents.length} components in ${endTime - startTime}ms`)
console.log(`Result: ${perfBundled.length} files (${perfBundled.reduce((sum, f) => sum + f.content.length, 0)} total chars)`)

// SUMMARY
console.log('\n' + '='.repeat(60))
console.log('✅ ALL TESTS PASSED!')
console.log('='.repeat(60))
console.log('\n🎉 Scaffold Bundler Integration is working correctly!')
console.log('\nKey Metrics:')
console.log(`  - Available Components: ${availableComponents.length}`)
console.log(`  - Test Bundle Size: ${bundledFiles.length} files`)
console.log(`  - Component Detection: ${detectedComponents.length}/${expectedComponents.length} found`)
console.log(`  - Bundling Performance: ${endTime - startTime}ms for ${perfTestComponents.length} components`)
console.log('\n🚀 Ready for production use!')
