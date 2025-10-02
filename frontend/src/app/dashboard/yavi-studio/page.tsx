'use client';

import React from 'react';
import Link from 'next/link';
import { YaviStudioLayout } from '@/components/layouts/YaviStudioLayout';
import { Sparkles, Package } from 'lucide-react';

interface QuickStartCardProps {
  title: string;
  description: string;
  industry: 'legal' | 'construction' | 'healthcare' | 'financial';
  href: string;
}

const QuickStartCard: React.FC<QuickStartCardProps> = ({ title, description, industry, href }) => {
  const colors = {
    legal: 'from-blue-500 to-blue-600',
    construction: 'from-orange-500 to-orange-600',
    healthcare: 'from-green-500 to-green-600',
    financial: 'from-purple-500 to-purple-600'
  };

  return (
    <Link href={href} className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left block">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[industry]} mb-4`} />
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
};

export default function YaviStudioDashboard() {
  return (
    <YaviStudioLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to Yavi Studio
                </h1>
                <p className="text-gray-600">
                  Build document-intelligent applications powered by Yavi.ai&apos;s RAG technology
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/dashboard/yavi-studio/widgets"
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Widget Library
                </Link>
                <Link
                  href="/dashboard/yavi-studio/builder"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Builder (v2)
                </Link>
                <Link
                  href="/dashboard/yavi-studio/builder-v3"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Builder v3 (New!)
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Start Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <QuickStartCard
              title="Legal Contract Analyzer"
              description="Analyze contracts and extract key terms"
              industry="legal"
              href="/dashboard/yavi-studio/builder-v3"
            />
            <QuickStartCard
              title="Project Dashboard"
              description="Track construction projects and documents"
              industry="construction"
              href="/dashboard/yavi-studio/builder-v3"
            />
            <QuickStartCard
              title="Patient Insights"
              description="Summarize medical records intelligently"
              industry="healthcare"
              href="/dashboard/yavi-studio/builder-v3"
            />
            <QuickStartCard
              title="Invoice Processor"
              description="Extract and process invoice data"
              industry="financial"
              href="/dashboard/yavi-studio/builder-v3"
            />
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Projects</h2>
            <div className="text-gray-500 text-sm">
              No projects yet. Create your first AI application above.
            </div>
          </div>
        </div>
      </div>
    </YaviStudioLayout>
  );
}
