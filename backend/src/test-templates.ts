/**
 * Test Script: Industry Template Integration
 *
 * This script demonstrates how to use industry-specific templates
 * with the AI code generation service.
 */

import { aiService } from './services/ai'
import { getTemplate, getAllTemplates, type IndustryTemplate } from './lib/industryTemplates'

async function testTemplateIntegration() {
  console.log('🧪 Testing Industry Template Integration\n')
  console.log('=' .repeat(60))

  // Test 1: List all available templates
  console.log('\n📋 Available Templates by Industry:\n')
  const industries = ['healthcare', 'fintech', 'legal', 'ecommerce', 'saas'] as const

  for (const industry of industries) {
    const templates = getAllTemplates(industry)
    console.log(`\n${industry.toUpperCase()} (${templates.length} templates):`)
    templates.forEach(t => {
      console.log(`  - ${t.id}: ${t.name}`)
      console.log(`    Compliance: ${t.compliance.join(', ')}`)
    })
  }

  // Test 2: Get specific template details
  console.log('\n\n' + '='.repeat(60))
  console.log('\n🏥 Testing Healthcare Patient Intake Template:\n')

  const patientIntakeTemplate = getTemplate('healthcare', 'patient-intake')

  if (patientIntakeTemplate) {
    console.log(`Template: ${patientIntakeTemplate.name}`)
    console.log(`Industry: ${patientIntakeTemplate.industry}`)
    console.log(`Description: ${patientIntakeTemplate.description}`)
    console.log(`Compliance: ${patientIntakeTemplate.compliance.join(', ')}`)
    console.log(`\nComponents:`)
    patientIntakeTemplate.components.forEach(c => {
      console.log(`  - ${c.name} (${c.type})`)
      console.log(`    Fields: ${JSON.stringify(c.props.fields)}`)
    })
  }

  // Test 3: Generate code with healthcare template
  console.log('\n\n' + '='.repeat(60))
  console.log('\n🚀 Testing AI Generation with Patient Intake Template:\n')

  try {
    const result = await aiService.generateCode({
      prompt: 'Create a HIPAA-compliant patient intake form with medical history and insurance information',
      context: {
        framework: 'React + TypeScript',
        language: 'TypeScript',
        industry: 'healthcare',
        templateId: 'patient-intake',
      },
      provider: 'openai',
      userId: 'test-user-123'
    })

    console.log(`✅ Generation successful!`)
    console.log(`Files generated: ${result.files.length}`)
    console.log(`\nGenerated files:`)
    result.files.forEach(f => {
      const lines = f.content.split('\n').length
      console.log(`  - ${f.path} (${lines} lines, ${f.content.length} chars)`)
    })

    if (result.explanation) {
      console.log(`\nExplanation: ${result.explanation}`)
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Generation failed: ${error.message}`)
    } else {
      console.error('❌ Generation failed with unknown error')
    }
  }

  // Test 4: Fintech KYC template
  console.log('\n\n' + '='.repeat(60))
  console.log('\n💰 Testing Fintech KYC Verification Template:\n')

  const kycTemplate = getTemplate('fintech', 'kyc-verification')

  if (kycTemplate) {
    console.log(`Template: ${kycTemplate.name}`)
    console.log(`Compliance: ${kycTemplate.compliance.join(', ')}`)
    console.log(`Components: ${kycTemplate.components.map(c => c.name).join(', ')}`)
  }

  // Test 5: Legal client intake template
  console.log('\n\n' + '='.repeat(60))
  console.log('\n⚖️  Testing Legal Client Intake Template:\n')

  const legalTemplate = getTemplate('legal', 'client-intake')

  if (legalTemplate) {
    console.log(`Template: ${legalTemplate.name}`)
    console.log(`Compliance: ${legalTemplate.compliance.join(', ')}`)
    console.log(`Features: Conflict checking, attorney-client privilege`)
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('\n✅ Template Integration Test Complete!\n')
}

// Run tests if this file is executed directly
if (require.main === module) {
  testTemplateIntegration().catch(error => {
    console.error('Test failed:', error)
    process.exit(1)
  })
}

export { testTemplateIntegration }
