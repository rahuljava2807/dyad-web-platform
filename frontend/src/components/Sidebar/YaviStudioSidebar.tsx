'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileCode,
  Briefcase,
  Building,
  Heart,
  DollarSign,
  Settings,
  BookOpen
} from 'lucide-react';

export const YaviStudioSidebar: React.FC = () => {
  const industries = [
    { id: 'legal', name: 'Legal', icon: Briefcase, color: 'text-blue-600' },
    { id: 'construction', name: 'Construction', icon: Building, color: 'text-orange-600' },
    { id: 'healthcare', name: 'Healthcare', icon: Heart, color: 'text-green-600' },
    { id: 'financial', name: 'Financial', icon: DollarSign, color: 'text-purple-600' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Industry Templates
        </h3>

        <nav className="space-y-1">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <button
                key={industry.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Icon className={`w-5 h-5 ${industry.color}`} />
                <span className="text-sm font-medium text-gray-900">{industry.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Resources
          </h3>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-900">Documentation</span>
            </button>
            <Link
              href="/dashboard/settings"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-900">Settings</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
};
