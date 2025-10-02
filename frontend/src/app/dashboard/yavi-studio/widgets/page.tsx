'use client';

import React, { useState } from 'react';
import { YaviStudioLayout } from '@/components/layouts/YaviStudioLayout';
import { DynamicWidget, WidgetCatalog } from '@/widgets/WidgetRegistry';
import { Code, Zap, BookOpen } from 'lucide-react';

type Industry = 'legal' | 'construction' | 'healthcare' | 'financial';

export default function WidgetsPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('legal');
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  const industryColors = {
    legal: 'blue',
    construction: 'orange',
    healthcare: 'green',
    financial: 'purple'
  };

  const handleWidgetSelect = (widgetName: string) => {
    setSelectedWidget(widgetName);
    setShowCode(false);
  };

  const getCodeExample = () => {
    if (!selectedWidget) return '';

    return `import { ${selectedWidget} } from '@yavi-studio/widgets/${selectedIndustry}/${selectedWidget}';

export default function MyApp() {
  return (
    <div>
      <${selectedWidget}
        ${selectedIndustry === 'legal' ? 'documentId="contract-123"' :
          selectedIndustry === 'construction' ? 'projectId="project-456"' :
          selectedIndustry === 'healthcare' ? 'patientId="patient-789"' :
          'batchId="batch-012"'
        }
      />
    </div>
  );
}`;
  };

  return (
    <YaviStudioLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Industry Widget Library
            </h1>
            <p className="text-gray-600">
              Pre-built, intelligent widgets powered by Yavi.ai for rapid application development
            </p>
          </div>

          {/* Industry Selector */}
          <div className="mb-8">
            <div className="flex gap-4">
              {(Object.keys(WidgetCatalog) as Industry[]).map((industry) => (
                <button
                  key={industry}
                  onClick={() => {
                    setSelectedIndustry(industry);
                    setSelectedWidget(null);
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedIndustry === industry
                      ? `bg-${industryColors[industry]}-600 text-white shadow-lg`
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {industry.charAt(0).toUpperCase() + industry.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Widget Catalog */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Available Widgets
                </h2>
                <div className="space-y-3">
                  {WidgetCatalog[selectedIndustry].map((widget) => (
                    <button
                      key={widget.name}
                      onClick={() => handleWidgetSelect(widget.name)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedWidget === widget.name
                          ? `border-${widget.color}-500 bg-${widget.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{widget.icon}</span>
                        <span className="font-semibold text-gray-900">
                          {widget.displayName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{widget.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedWidget && (
                <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold mb-4">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowCode(!showCode)}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Code className="w-4 h-4" />
                      {showCode ? 'Hide' : 'View'} Code Example
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Use in App Builder
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Widget Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold">
                    {selectedWidget
                      ? WidgetCatalog[selectedIndustry].find(w => w.name === selectedWidget)?.displayName
                      : 'Select a widget to preview'
                    }
                  </h2>
                </div>

                <div className="p-6">
                  {selectedWidget ? (
                    showCode ? (
                      <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                        <pre className="text-sm text-gray-100">
                          <code>{getCodeExample()}</code>
                        </pre>
                      </div>
                    ) : (
                      <DynamicWidget
                        industry={selectedIndustry}
                        type={selectedWidget}
                        props={{
                          documentId: 'demo-doc-123',
                          projectId: 'demo-project-456',
                          patientId: 'demo-patient-789',
                          batchId: 'demo-batch-012'
                        }}
                      />
                    )
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Select a widget from the catalog to see a live preview</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Widget Info */}
              {selectedWidget && !showCode && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    💡 Widget Features
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Real-time data extraction with Yavi.ai RAG</li>
                    <li>• Automatic document processing and analysis</li>
                    <li>• Industry-specific intelligence and insights</li>
                    <li>• Fully customizable and extensible</li>
                    <li>• Built with React and TypeScript</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </YaviStudioLayout>
  );
}
