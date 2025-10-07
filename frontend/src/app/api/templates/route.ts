/**
 * Industry Templates API Route
 *
 * Provides access to industry-specific form templates for the frontend.
 * This enables the UI to show template options when creating new projects.
 */

import { NextRequest, NextResponse } from 'next/server'

// Template types (mirrored from backend)
interface IndustryTemplate {
  id: string
  name: string
  industry: 'healthcare' | 'fintech' | 'legal' | 'ecommerce' | 'saas'
  description: string
  compliance: string[]
  components: {
    name: string
    type: string
    props: Record<string, any>
  }[]
}

// Mock templates (in production, this would fetch from backend)
const TEMPLATES: Record<string, IndustryTemplate[]> = {
  healthcare: [
    {
      id: 'patient-intake',
      name: 'Patient Intake Form',
      industry: 'healthcare',
      description: 'HIPAA-compliant patient intake with medical history',
      compliance: ['HIPAA', 'GDPR'],
      components: [
        { name: 'PersonalInformation', type: 'form', props: { fields: ['firstName', 'lastName', 'dateOfBirth', 'ssn'] } },
        { name: 'MedicalHistory', type: 'form', props: { fields: ['allergies', 'medications'] } },
        { name: 'InsuranceInformation', type: 'form', props: { fields: ['provider', 'policyNumber'] } }
      ]
    },
    {
      id: 'consent-form',
      name: 'Medical Consent Form',
      industry: 'healthcare',
      description: 'Digital consent with signature capture',
      compliance: ['HIPAA', 'eConsent regulations'],
      components: [
        { name: 'ConsentAgreement', type: 'custom', props: { requireSignature: true } }
      ]
    }
  ],
  fintech: [
    {
      id: 'kyc-verification',
      name: 'KYC Verification Form',
      industry: 'fintech',
      description: 'Know Your Customer compliance form',
      compliance: ['KYC', 'AML', 'PATRIOT Act'],
      components: [
        { name: 'IdentityVerification', type: 'form', props: { fields: ['fullLegalName', 'ssn', 'governmentID'] } },
        { name: 'DocumentUpload', type: 'file', props: { required: true } },
        { name: 'RiskAssessment', type: 'form', props: { fields: ['sourceOfFunds', 'politicallyExposed'] } }
      ]
    },
    {
      id: 'investment-profile',
      name: 'Investment Profile & Risk Assessment',
      industry: 'fintech',
      description: 'Investment suitability questionnaire',
      compliance: ['SEC', 'FINRA', 'Reg BI'],
      components: [
        { name: 'InvestorProfile', type: 'form', props: { fields: ['investmentExperience', 'riskTolerance'] } }
      ]
    }
  ],
  legal: [
    {
      id: 'client-intake',
      name: 'Legal Client Intake Form',
      industry: 'legal',
      description: 'Client intake with conflict checking',
      compliance: ['Attorney-Client Privilege', 'Bar Association Rules'],
      components: [
        { name: 'ClientInformation', type: 'form', props: { fields: ['clientName', 'caseType', 'opposingParty'] } },
        { name: 'ConflictCheck', type: 'custom', props: { checkAgainst: ['existingClients'] } }
      ]
    },
    {
      id: 'retainer-agreement',
      name: 'Retainer Agreement Form',
      industry: 'legal',
      description: 'Fee agreement with e-signature',
      compliance: ['Model Rules of Professional Conduct'],
      components: [
        { name: 'FeeStructure', type: 'form', props: { fields: ['feeType', 'hourlyRate', 'retainerAmount'] } },
        { name: 'SignatureBlock', type: 'custom', props: { requireClientSignature: true } }
      ]
    }
  ],
  ecommerce: [
    {
      id: 'checkout-form',
      name: 'Optimized Checkout Form',
      industry: 'ecommerce',
      description: 'High-conversion checkout with address validation',
      compliance: ['PCI-DSS (for payment)', 'GDPR'],
      components: [
        { name: 'ShippingAddress', type: 'form', props: { fields: ['fullName', 'addressLine1', 'city'] } },
        { name: 'PaymentInformation', type: 'custom', props: { paymentMethods: ['creditCard', 'paypal'] } },
        { name: 'OrderReview', type: 'custom', props: { showItemSummary: true } }
      ]
    },
    {
      id: 'product-review',
      name: 'Product Review Form',
      industry: 'ecommerce',
      description: 'Customer review with photo/video upload',
      compliance: ['FTC Guidelines'],
      components: [
        { name: 'ReviewContent', type: 'form', props: { fields: ['rating', 'reviewTitle', 'reviewBody'] } },
        { name: 'MediaUpload', type: 'file', props: { acceptedTypes: ['image/*', 'video/*'] } }
      ]
    }
  ],
  saas: [
    {
      id: 'user-onboarding',
      name: 'SaaS User Onboarding',
      industry: 'saas',
      description: 'Multi-step onboarding wizard',
      compliance: ['GDPR', 'CCPA'],
      components: [
        { name: 'AccountSetup', type: 'form', props: { fields: ['companyName', 'industry', 'teamSize'] } },
        { name: 'TeamInvitation', type: 'custom', props: { allowBulkInvite: true } },
        { name: 'IntegrationSetup', type: 'custom', props: { integrations: ['slack', 'salesforce'] } }
      ]
    },
    {
      id: 'support-ticket',
      name: 'Support Ticket Form',
      industry: 'saas',
      description: 'Smart ticket creation with auto-routing',
      compliance: [],
      components: [
        { name: 'TicketDetails', type: 'form', props: { fields: ['subject', 'category', 'priority'] } },
        { name: 'FileAttachment', type: 'file', props: { maxSize: 25 * 1024 * 1024 } }
      ]
    }
  ]
}

/**
 * GET /api/templates
 * Get all templates or filter by industry
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const templateId = searchParams.get('templateId')

    // Get specific template
    if (industry && templateId) {
      const templates = TEMPLATES[industry as keyof typeof TEMPLATES]
      const template = templates?.find(t => t.id === templateId)

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ template })
    }

    // Get all templates for an industry
    if (industry) {
      const templates = TEMPLATES[industry as keyof typeof TEMPLATES] || []
      return NextResponse.json({ templates })
    }

    // Get all templates grouped by industry
    return NextResponse.json({
      templates: TEMPLATES,
      industries: Object.keys(TEMPLATES),
      totalCount: Object.values(TEMPLATES).flat().length
    })

  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/templates/validate
 * Validate if a template can be used for a given prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, industry, templateId } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Basic validation logic
    const templates = industry ? TEMPLATES[industry as keyof typeof TEMPLATES] : Object.values(TEMPLATES).flat()
    const matchingTemplates = templates.filter(template => {
      const promptLower = prompt.toLowerCase()
      const nameLower = template.name.toLowerCase()
      const descLower = template.description.toLowerCase()

      return promptLower.includes(nameLower) ||
             nameLower.includes(promptLower) ||
             descLower.includes(promptLower)
    })

    return NextResponse.json({
      matches: matchingTemplates.length > 0,
      suggestions: matchingTemplates.slice(0, 3),
      count: matchingTemplates.length
    })

  } catch (error) {
    console.error('Error validating template:', error)
    return NextResponse.json(
      { error: 'Failed to validate template' },
      { status: 500 }
    )
  }
}
