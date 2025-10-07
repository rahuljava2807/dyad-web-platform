/**
 * Industry-Specific Form Templates
 * Phase 2: Strategic Enterprise Platform Enhancement
 */

export interface IndustryTemplate {
  id: string
  name: string
  industry: 'healthcare' | 'fintech' | 'legal' | 'ecommerce' | 'saas'
  description: string
  compliance: string[]
  components: TemplateComponent[]
  validationRules: ValidationRule[]
  mockData: any
  documentation: string
}

export interface TemplateComponent {
  name: string
  type: 'form' | 'input' | 'select' | 'textarea' | 'file' | 'custom'
  props: Record<string, any>
  validation?: ValidationRule[]
}

export interface ValidationRule {
  field: string
  type: 'required' | 'email' | 'phone' | 'regex' | 'custom'
  message: string
  params?: any
}

// ==================== HEALTHCARE TEMPLATES ====================

export const healthcareTemplates: IndustryTemplate[] = [
  {
    id: 'patient-intake',
    name: 'Patient Intake Form',
    industry: 'healthcare',
    description: 'HIPAA-compliant patient intake with medical history',
    compliance: ['HIPAA', 'GDPR'],
    components: [
      {
        name: 'PersonalInformation',
        type: 'form',
        props: {
          fields: [
            'firstName',
            'lastName',
            'dateOfBirth',
            'ssn',
            'phoneNumber',
            'email',
            'emergencyContact'
          ]
        },
        validation: [
          { field: 'ssn', type: 'regex', message: 'Invalid SSN format', params: { pattern: /^\d{3}-\d{2}-\d{4}$/ } },
          { field: 'phoneNumber', type: 'phone', message: 'Invalid phone number' }
        ]
      },
      {
        name: 'MedicalHistory',
        type: 'form',
        props: {
          fields: [
            'currentMedications',
            'allergies',
            'pastSurgeries',
            'familyHistory',
            'chronicConditions'
          ]
        }
      },
      {
        name: 'InsuranceInformation',
        type: 'form',
        props: {
          fields: [
            'insuranceProvider',
            'policyNumber',
            'groupNumber',
            'subscriberName',
            'subscriberDOB'
          ]
        }
      }
    ],
    validationRules: [],
    mockData: {},
    documentation: `
Patient Intake Form - HIPAA Compliant

PRIVACY NOTICE: This form collects Protected Health Information (PHI)
ENCRYPTION: All data transmitted over TLS 1.3
AUDIT: All access logged with user ID and timestamp
RETENTION: Records kept for 7 years per HIPAA requirements

Fields:
- SSN: Masked input (***-**-1234)
- Medical History: Conditional logic (if allergies → show severity)
- Insurance: Real-time eligibility verification (optional integration)
    `
  },
  {
    id: 'consent-form',
    name: 'Medical Consent Form',
    industry: 'healthcare',
    description: 'Digital consent with signature capture',
    compliance: ['HIPAA', 'eConsent regulations'],
    components: [
      {
        name: 'ConsentAgreement',
        type: 'custom',
        props: {
          requireSignature: true,
          requireWitness: false,
          consentTypes: [
            'treatmentConsent',
            'privacyPractices',
            'financialResponsibility'
          ]
        }
      }
    ],
    validationRules: [
      { field: 'signature', type: 'required', message: 'Signature is required' },
      { field: 'consentDate', type: 'required', message: 'Date is required' }
    ],
    mockData: {},
    documentation: 'Includes digital signature capture with timestamp'
  }
]

// ==================== FINTECH TEMPLATES ====================

export const fintechTemplates: IndustryTemplate[] = [
  {
    id: 'kyc-verification',
    name: 'KYC Verification Form',
    industry: 'fintech',
    description: 'Know Your Customer compliance form',
    compliance: ['KYC', 'AML', 'PATRIOT Act'],
    components: [
      {
        name: 'IdentityVerification',
        type: 'form',
        props: {
          fields: [
            'fullLegalName',
            'dateOfBirth',
            'ssn',
            'governmentID',
            'addressProof'
          ]
        }
      },
      {
        name: 'DocumentUpload',
        type: 'file',
        props: {
          acceptedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          maxSize: 5 * 1024 * 1024, // 5MB
          required: true,
          documents: [
            { type: 'governmentID', label: 'Government-issued ID' },
            { type: 'addressProof', label: 'Proof of Address' }
          ]
        }
      },
      {
        name: 'RiskAssessment',
        type: 'form',
        props: {
          fields: [
            'sourceOfFunds',
            'expectedTransactionVolume',
            'purposeOfAccount',
            'politicallyExposed'
          ]
        }
      }
    ],
    validationRules: [
      { field: 'ssn', type: 'regex', message: 'Invalid SSN', params: { pattern: /^\d{3}-\d{2}-\d{4}$/ } },
      { field: 'politicallyExposed', type: 'custom', message: 'PEP check required' }
    ],
    mockData: {},
    documentation: `
KYC Verification Form

COMPLIANCE: Bank Secrecy Act, USA PATRIOT Act
VERIFICATION: Auto-verify against government databases
DOCUMENT SCANNING: OCR for ID extraction
RISK SCORING: Automated risk calculation
    `
  },
  {
    id: 'investment-profile',
    name: 'Investment Profile & Risk Assessment',
    industry: 'fintech',
    description: 'Investment suitability questionnaire',
    compliance: ['SEC', 'FINRA', 'Reg BI'],
    components: [
      {
        name: 'InvestorProfile',
        type: 'form',
        props: {
          fields: [
            'investmentExperience',
            'financialSituation',
            'investmentObjectives',
            'riskTolerance',
            'timeHorizon'
          ]
        }
      }
    ],
    validationRules: [],
    mockData: {},
    documentation: 'Calculates suitability score for investment recommendations'
  }
]

// ==================== LEGAL TEMPLATES ====================

export const legalTemplates: IndustryTemplate[] = [
  {
    id: 'client-intake',
    name: 'Legal Client Intake Form',
    industry: 'legal',
    description: 'Client intake with conflict checking',
    compliance: ['Attorney-Client Privilege', 'Bar Association Rules'],
    components: [
      {
        name: 'ClientInformation',
        type: 'form',
        props: {
          fields: [
            'clientName',
            'contactInfo',
            'caseType',
            'opposingParty',
            'matterDescription'
          ]
        }
      },
      {
        name: 'ConflictCheck',
        type: 'custom',
        props: {
          checkAgainst: ['existingClients', 'opposingParties', 'relatedMatters']
        }
      }
    ],
    validationRules: [
      { field: 'opposingParty', type: 'custom', message: 'Conflict check must pass' }
    ],
    mockData: {},
    documentation: 'Auto-runs conflict check against existing client database'
  },
  {
    id: 'retainer-agreement',
    name: 'Retainer Agreement Form',
    industry: 'legal',
    description: 'Fee agreement with e-signature',
    compliance: ['Model Rules of Professional Conduct'],
    components: [
      {
        name: 'FeeStructure',
        type: 'form',
        props: {
          fields: [
            'feeType', // hourly, flat, contingency
            'hourlyRate',
            'retainerAmount',
            'billingFrequency'
          ]
        }
      },
      {
        name: 'SignatureBlock',
        type: 'custom',
        props: {
          requireClientSignature: true,
          requireAttorneySignature: true
        }
      }
    ],
    validationRules: [],
    mockData: {},
    documentation: 'Generates PDF retainer agreement with digital signatures'
  }
]

// ==================== E-COMMERCE TEMPLATES ====================

export const ecommerceTemplates: IndustryTemplate[] = [
  {
    id: 'checkout-form',
    name: 'Optimized Checkout Form',
    industry: 'ecommerce',
    description: 'High-conversion checkout with address validation',
    compliance: ['PCI-DSS (for payment)', 'GDPR'],
    components: [
      {
        name: 'ShippingAddress',
        type: 'form',
        props: {
          fields: [
            'fullName',
            'addressLine1',
            'addressLine2',
            'city',
            'state',
            'zipCode',
            'country'
          ],
          autoComplete: true,
          addressValidation: true
        }
      },
      {
        name: 'PaymentInformation',
        type: 'custom',
        props: {
          paymentMethods: ['creditCard', 'paypal', 'applePay', 'googlePay'],
          tokenize: true, // Never store raw card numbers
          supportedCards: ['visa', 'mastercard', 'amex', 'discover']
        }
      },
      {
        name: 'OrderReview',
        type: 'custom',
        props: {
          showItemSummary: true,
          showPricingBreakdown: true,
          allowCouponCode: true
        }
      }
    ],
    validationRules: [
      { field: 'creditCard', type: 'custom', message: 'Invalid card number (Luhn check)' },
      { field: 'zipCode', type: 'regex', message: 'Invalid ZIP code', params: { pattern: /^\d{5}(-\d{4})?$/ } }
    ],
    mockData: {},
    documentation: `
Optimized Checkout Flow

UX OPTIMIZATIONS:
- Address autocomplete with Google Maps API
- Real-time shipping cost calculation
- Express checkout options (Apple Pay, Google Pay)
- Guest checkout option
- Cart abandonment tracking

SECURITY:
- PCI-DSS compliant (never store card numbers)
- Tokenization via Stripe/Square
- 3D Secure support for EU cards
    `
  },
  {
    id: 'product-review',
    name: 'Product Review Form',
    industry: 'ecommerce',
    description: 'Customer review with photo/video upload',
    compliance: ['FTC Guidelines'],
    components: [
      {
        name: 'ReviewContent',
        type: 'form',
        props: {
          fields: [
            'rating', // 1-5 stars
            'reviewTitle',
            'reviewBody',
            'recommendProduct'
          ]
        }
      },
      {
        name: 'MediaUpload',
        type: 'file',
        props: {
          acceptedTypes: ['image/*', 'video/*'],
          maxFiles: 5,
          maxSize: 10 * 1024 * 1024 // 10MB
        }
      }
    ],
    validationRules: [
      { field: 'rating', type: 'required', message: 'Rating is required' },
      { field: 'reviewBody', type: 'custom', message: 'Review must be at least 50 characters' }
    ],
    mockData: {},
    documentation: 'Includes photo upload, star rating, verified purchase badge'
  }
]

// ==================== SAAS TEMPLATES ====================

export const saasTemplates: IndustryTemplate[] = [
  {
    id: 'user-onboarding',
    name: 'SaaS User Onboarding',
    industry: 'saas',
    description: 'Multi-step onboarding wizard',
    compliance: ['GDPR', 'CCPA'],
    components: [
      {
        name: 'AccountSetup',
        type: 'form',
        props: {
          fields: [
            'companyName',
            'industry',
            'teamSize',
            'useCase'
          ]
        }
      },
      {
        name: 'TeamInvitation',
        type: 'custom',
        props: {
          allowBulkInvite: true,
          roleSelection: true
        }
      },
      {
        name: 'IntegrationSetup',
        type: 'custom',
        props: {
          integrations: ['slack', 'salesforce', 'hubspot', 'zapier']
        }
      }
    ],
    validationRules: [],
    mockData: {},
    documentation: 'Progressive onboarding with skip options'
  },
  {
    id: 'support-ticket',
    name: 'Support Ticket Form',
    industry: 'saas',
    description: 'Smart ticket creation with auto-routing',
    compliance: [],
    components: [
      {
        name: 'TicketDetails',
        type: 'form',
        props: {
          fields: [
            'subject',
            'category', // bug, feature request, question
            'priority',
            'description',
            'affectedUsers'
          ]
        }
      },
      {
        name: 'FileAttachment',
        type: 'file',
        props: {
          acceptedTypes: ['image/*', 'video/*', 'application/pdf', '.log', '.txt'],
          maxSize: 25 * 1024 * 1024 // 25MB
        }
      }
    ],
    validationRules: [
      { field: 'description', type: 'custom', message: 'Must be at least 20 characters' }
    ],
    mockData: {},
    documentation: 'Auto-assigns based on category, includes screenshot tool'
  }
]

// ==================== TEMPLATE REGISTRY ====================

export const industryTemplateRegistry = {
  healthcare: healthcareTemplates,
  fintech: fintechTemplates,
  legal: legalTemplates,
  ecommerce: ecommerceTemplates,
  saas: saasTemplates
}

export function getTemplate(industry: string, templateId: string): IndustryTemplate | undefined {
  const templates = industryTemplateRegistry[industry as keyof typeof industryTemplateRegistry]
  return templates?.find(t => t.id === templateId)
}

export function getAllTemplates(industry?: string): IndustryTemplate[] {
  if (industry) {
    return industryTemplateRegistry[industry as keyof typeof industryTemplateRegistry] || []
  }
  return Object.values(industryTemplateRegistry).flat()
}

export function getTemplatePromptEnhancement(template: IndustryTemplate): string {
  return `
INDUSTRY TEMPLATE: ${template.name}
INDUSTRY: ${template.industry.toUpperCase()}
COMPLIANCE REQUIREMENTS: ${template.compliance.join(', ')}

${template.documentation}

SPECIFIC REQUIREMENTS FOR THIS TEMPLATE:
${template.components.map(c => `- ${c.name}: ${JSON.stringify(c.props, null, 2)}`).join('\n')}

VALIDATION RULES:
${template.validationRules.map(r => `- ${r.field}: ${r.message}`).join('\n')}

GENERATE A COMPLETE, PRODUCTION-READY IMPLEMENTATION OF THIS FORM.
  `
}
