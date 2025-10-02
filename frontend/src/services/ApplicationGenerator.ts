import { WidgetRegistry, WidgetConfig } from '../widgets/WidgetRegistry';
import { YaviConnectorService } from './YaviConnector';

export interface GenerationSettings {
  industry: string;
  framework?: 'react' | 'next' | 'vue';
  styling?: 'tailwind' | 'css' | 'styled-components';
  includeYaviIntegration?: boolean;
  widgets?: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export class EnhancedApplicationGenerator {
  private yaviConnector = new YaviConnectorService();

  async generateWithWidgets(
    prompt: string,
    industry: string,
    settings: GenerationSettings
  ): Promise<GeneratedFile[]> {
    // Analyze prompt to determine needed widgets
    const requiredWidgets = await this.analyzePromptForWidgets(prompt, industry);

    // Generate base application structure
    const baseFiles = await this.generateBaseStructure(prompt, settings);

    // Add industry-specific widgets
    const widgetFiles = await this.generateWidgetIntegrations(
      requiredWidgets,
      industry
    );

    // Create Yavi data connections
    const dataFiles = await this.generateDataConnections(industry);

    // Combine all files
    return [...baseFiles, ...widgetFiles, ...dataFiles];
  }

  private async analyzePromptForWidgets(prompt: string, industry: string): Promise<string[]> {
    // Use AI to determine which widgets are needed
    const widgetMap: Record<string, Record<string, string>> = {
      legal: {
        'contract': 'ContractAnalyzer',
        'case': 'CaseManager',
        'compliance': 'ComplianceChecker',
        'legal': 'ContractAnalyzer'
      },
      construction: {
        'project': 'ProjectDashboard',
        'safety': 'SafetyCompliance',
        'budget': 'BudgetTracker',
        'construction': 'ProjectDashboard'
      },
      healthcare: {
        'patient': 'PatientInsights',
        'medication': 'MedicationTracker',
        'billing': 'BillingAnalyzer',
        'health': 'PatientInsights'
      },
      financial: {
        'invoice': 'InvoiceProcessor',
        'advisor': 'FinancialAdvisor',
        'fraud': 'FraudDetector',
        'financial': 'InvoiceProcessor'
      }
    };

    const widgets: string[] = [];
    const industryWidgets = widgetMap[industry] || {};

    for (const [keyword, widget] of Object.entries(industryWidgets)) {
      if (prompt.toLowerCase().includes(keyword)) {
        if (!widgets.includes(widget)) {
          widgets.push(widget);
        }
      }
    }

    // If no widgets found, add default widget for the industry
    if (widgets.length === 0) {
      const defaultWidgets: Record<string, string> = {
        legal: 'ContractAnalyzer',
        construction: 'ProjectDashboard',
        healthcare: 'PatientInsights',
        financial: 'InvoiceProcessor'
      };
      const defaultWidget = defaultWidgets[industry];
      if (defaultWidget) {
        widgets.push(defaultWidget);
      }
    }

    return widgets;
  }

  private async generateBaseStructure(
    prompt: string,
    settings: GenerationSettings
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Generate main page
    files.push({
      path: '/src/app/page.tsx',
      content: this.generateMainPageContent(prompt, settings),
      language: 'tsx'
    });

    // Generate package.json
    files.push({
      path: '/package.json',
      content: this.generatePackageJson(settings),
      language: 'json'
    });

    // Generate tailwind config
    if (settings.styling === 'tailwind') {
      files.push({
        path: '/tailwind.config.ts',
        content: this.generateTailwindConfig(),
        language: 'typescript'
      });
    }

    return files;
  }

  private generateMainPageContent(prompt: string, settings: GenerationSettings): string {
    return `'use client';

import React from 'react';
import { YaviDataService } from '../services/yaviDataService';

export default function HomePage() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      const dataService = new YaviDataService();
      await dataService.initialize();
      // Load initial data
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ${settings.industry.charAt(0).toUpperCase() + settings.industry.slice(1)} Application
          </h1>
          <p className="text-xl text-gray-600">
            ${prompt}
          </p>
        </div>

        <div className="mt-12">
          {/* Widget components will be integrated here */}
        </div>
      </div>
    </div>
  );
}
`;
  }

  private generatePackageJson(settings: GenerationSettings): string {
    return JSON.stringify({
      name: `${settings.industry}-app`,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        next: '^14.2.0',
        'lucide-react': '^0.344.0',
        '@yavi-studio/core': '^1.0.0'
      },
      devDependencies: {
        typescript: '^5',
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        tailwindcss: '^3.4.1',
        postcss: '^8',
        autoprefixer: '^10.0.1'
      }
    }, null, 2);
  }

  private generateTailwindConfig(): string {
    return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        }
      }
    },
  },
  plugins: [],
}
export default config
`;
  }

  private async generateWidgetIntegrations(
    widgets: string[],
    industry: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    for (const widget of widgets) {
      const config = WidgetRegistry.getWidgetConfig(industry, widget);

      if (!config) continue;

      // Generate widget integration file
      files.push({
        path: `/src/components/${widget}Integration.tsx`,
        content: this.generateWidgetIntegration(widget, config, industry),
        language: 'tsx'
      });
    }

    return files;
  }

  private generateWidgetIntegration(
    widgetName: string,
    config: WidgetConfig,
    industry: string
  ): string {
    return `'use client';

import React from 'react';
import { ${widgetName} } from '@yavi-studio/widgets/${industry}/${widgetName}';
import { YaviConnectorService } from '../services/YaviConnector';

export const ${widgetName}Integration: React.FC = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const connector = new YaviConnectorService();
      const namespace = await connector.connectToNamespace('${config.yaviNamespace}');

      // Fetch and process data
      const processedData = await connector.processDocument(
        new File([], 'document'),
        namespace.id,
        ${JSON.stringify(config.dataExtractors)}
      );

      setData(processedData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ${widgetName}...</p>
      </div>
    );
  }

  return <${widgetName} data={data} />;
};
`;
  }

  private async generateDataConnections(industry: string): Promise<GeneratedFile[]> {
    return [{
      path: '/src/services/yaviDataService.ts',
      content: this.generateYaviDataService(industry),
      language: 'typescript'
    }];
  }

  private generateYaviDataService(industry: string): string {
    const extractorMap: Record<string, string[]> = {
      legal: ['parties', 'terms', 'obligations', 'risks'],
      construction: ['milestones', 'budget', 'timeline', 'permits'],
      healthcare: ['diagnosis', 'medications', 'vitals', 'allergies'],
      financial: ['line-items', 'totals', 'tax', 'vendor']
    };

    return `import { YaviConnectorService } from './YaviConnector';

export class YaviDataService {
  private connector: YaviConnectorService;
  private namespace: string = '${industry}';

  constructor() {
    this.connector = new YaviConnectorService();
  }

  async initialize() {
    await this.connector.connectToNamespace(this.namespace);
  }

  async queryDocuments(query: string) {
    return this.connector.queryDocuments(this.namespace, query, 50);
  }

  async processDocument(file: File) {
    return this.connector.processDocument(
      file,
      this.namespace,
      this.getExtractorsForIndustry()
    );
  }

  private getExtractorsForIndustry(): string[] {
    const extractors: Record<string, string[]> = ${JSON.stringify(extractorMap, null, 2)};

    return extractors[this.namespace] || [];
  }
}
`;
  }
}

// Export singleton instance
export const applicationGenerator = new EnhancedApplicationGenerator();
