import React, { lazy, Suspense } from 'react';

// Lazy load widgets for performance
const widgets = {
  legal: {
    ContractAnalyzer: lazy(() => import('./legal/ContractAnalyzer').then(m => ({ default: m.ContractAnalyzer }))),
  },
  construction: {
    ProjectDashboard: lazy(() => import('./construction/ProjectDashboard').then(m => ({ default: m.ProjectDashboard }))),
  },
  healthcare: {
    PatientInsights: lazy(() => import('./healthcare/PatientInsights').then(m => ({ default: m.PatientInsights }))),
  },
  financial: {
    InvoiceProcessor: lazy(() => import('./financial/InvoiceProcessor').then(m => ({ default: m.InvoiceProcessor }))),
  }
};

export interface WidgetConfig {
  imports: string[];
  dataExtractors: string[];
  yaviNamespace: string;
  description?: string;
  requiredProps?: string[];
}

const widgetConfigs: Record<string, Record<string, WidgetConfig>> = {
  legal: {
    ContractAnalyzer: {
      imports: ['YaviConnectorService', 'FileText', 'AlertTriangle', 'Calendar', 'Users', 'DollarSign'],
      dataExtractors: ['parties', 'terms', 'obligations', 'financials', 'risks'],
      yaviNamespace: 'legal-contracts',
      description: 'Analyzes legal contracts and extracts key terms, parties, obligations, and risk factors',
      requiredProps: ['documentId']
    }
  },
  construction: {
    ProjectDashboard: {
      imports: ['YaviConnectorService', 'Building', 'TrendingUp', 'Clock', 'DollarSign', 'FileText'],
      dataExtractors: ['milestones', 'budget', 'timeline', 'safety', 'permits'],
      yaviNamespace: 'construction-projects',
      description: 'Tracks construction project progress, budget, and document management',
      requiredProps: ['projectId']
    }
  },
  healthcare: {
    PatientInsights: {
      imports: ['YaviConnectorService', 'Heart', 'Activity', 'Pill', 'FileText', 'AlertCircle'],
      dataExtractors: ['diagnosis', 'medications', 'vitals', 'allergies', 'risk-factors'],
      yaviNamespace: 'healthcare-records',
      description: 'Provides AI-powered patient health insights and risk assessment',
      requiredProps: ['patientId']
    }
  },
  financial: {
    InvoiceProcessor: {
      imports: ['YaviConnectorService', 'Receipt', 'DollarSign', 'TrendingUp', 'FileText', 'CheckCircle'],
      dataExtractors: ['invoice-items', 'totals', 'tax', 'vendor', 'payment-terms'],
      yaviNamespace: 'financial-documents',
      description: 'Automated invoice processing with OCR and data extraction',
      requiredProps: ['batchId']
    }
  }
};

export const WidgetRegistry = {
  getWidget: (industry: string, widgetType: string) => {
    return (widgets as any)[industry]?.[widgetType];
  },

  getAllWidgets: (industry: string) => {
    return (widgets as any)[industry] || {};
  },

  getWidgetConfig: (industry: string, widgetType: string): WidgetConfig | undefined => {
    return widgetConfigs[industry]?.[widgetType];
  },

  getAllWidgetConfigs: (industry: string): Record<string, WidgetConfig> => {
    return widgetConfigs[industry] || {};
  },

  getAvailableIndustries: (): string[] => {
    return Object.keys(widgets);
  },

  getWidgetTypes: (industry: string): string[] => {
    return Object.keys((widgets as any)[industry] || {});
  }
};

export const DynamicWidget: React.FC<{
  industry: string;
  type: string;
  props?: any;
}> = ({ industry, type, props }) => {
  const Widget = WidgetRegistry.getWidget(industry, type);

  if (!Widget) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Widget not found</h3>
        <p className="text-red-600 text-sm">
          Unable to load widget: {industry}/{type}
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<WidgetLoader />}>
      <Widget {...props} />
    </Suspense>
  );
};

const WidgetLoader = () => (
  <div className="p-8 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p className="mt-4 text-gray-600">Loading widget...</p>
  </div>
);

// Widget catalog for UI display
export const WidgetCatalog = {
  legal: [
    {
      name: 'ContractAnalyzer',
      displayName: 'Contract Analyzer',
      description: 'Analyze contracts and extract key terms, parties, and risk factors',
      icon: '📄',
      color: 'blue'
    }
  ],
  construction: [
    {
      name: 'ProjectDashboard',
      displayName: 'Project Dashboard',
      description: 'Track construction projects, budgets, and timelines',
      icon: '🏗️',
      color: 'orange'
    }
  ],
  healthcare: [
    {
      name: 'PatientInsights',
      displayName: 'Patient Insights',
      description: 'AI-powered patient health insights and risk assessment',
      icon: '🏥',
      color: 'green'
    }
  ],
  financial: [
    {
      name: 'InvoiceProcessor',
      displayName: 'Invoice Processor',
      description: 'Automated invoice processing with OCR and extraction',
      icon: '💰',
      color: 'purple'
    }
  ]
};
