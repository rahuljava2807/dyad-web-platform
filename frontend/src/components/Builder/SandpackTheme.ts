import { SandpackTheme } from '@codesandbox/sandpack-react';

export const yaviLightTheme: SandpackTheme = {
  colors: {
    surface1: '#ffffff',
    surface2: '#f8fafc',
    surface3: '#e2e8f0',
    clickable: '#3b82f6',
    base: '#1e293b',
    disabled: '#94a3b8',
    hover: '#dbeafe',
    accent: '#3b82f6',
    error: '#ef4444',
    errorSurface: '#fee2e2',
  },
  syntax: {
    plain: '#1e293b',
    comment: {
      color: '#64748b',
      fontStyle: 'italic',
    },
    keyword: '#7c3aed',
    tag: '#0ea5e9',
    punctuation: '#475569',
    definition: '#0891b2',
    property: '#0d9488',
    static: '#c026d3',
    string: '#16a34a',
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Fira Mono", Monaco, Consolas, "Ubuntu Mono", monospace',
    size: '14px',
    lineHeight: '1.6',
  },
};

export const yaviDarkTheme: SandpackTheme = {
  colors: {
    surface1: '#0f172a',
    surface2: '#1e293b',
    surface3: '#334155',
    clickable: '#60a5fa',
    base: '#e2e8f0',
    disabled: '#64748b',
    hover: '#1e40af',
    accent: '#60a5fa',
    error: '#f87171',
    errorSurface: '#7f1d1d',
  },
  syntax: {
    plain: '#e2e8f0',
    comment: {
      color: '#94a3b8',
      fontStyle: 'italic',
    },
    keyword: '#a78bfa',
    tag: '#38bdf8',
    punctuation: '#cbd5e1',
    definition: '#22d3ee',
    property: '#2dd4bf',
    static: '#e879f9',
    string: '#4ade80',
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Fira Mono", Monaco, Consolas, "Ubuntu Mono", monospace',
    size: '14px',
    lineHeight: '1.6',
  },
};
