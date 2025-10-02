'use client';

import React from 'react';
import Link from 'next/link';

export const YaviStudioHeader: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
          <span className="font-semibold text-xl text-gray-900">Yavi Studio</span>
          <span className="text-sm text-gray-500">by Nimbusnext</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* API Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Connected to Yavi.ai</span>
        </div>

        {/* User Menu */}
        <Link
          href="/dashboard/projects/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <span className="text-white">New Project</span>
        </Link>
      </div>
    </header>
  );
};
