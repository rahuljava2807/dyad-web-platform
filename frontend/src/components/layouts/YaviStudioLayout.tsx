import React from 'react';
import { YaviStudioHeader } from '../Header/YaviStudioHeader';
import { YaviStudioSidebar } from '../Sidebar/YaviStudioSidebar';

export const YaviStudioLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Yavi Studio branding */}
      <YaviStudioHeader />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar with project navigation */}
        <YaviStudioSidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
