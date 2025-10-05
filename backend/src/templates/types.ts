/**
 * Template System Types
 * Defines the structure for pre-built application templates
 */

export interface TemplateMetadata {
  id: string;
  name: string;
  category: 'auth' | 'dashboard' | 'form' | 'landing' | 'data';
  description: string;
  tags: string[];
  preview?: string; // URL to preview image
}

export interface TemplateFile {
  path: string;
  content: string;
  language: string;
}

export interface Template {
  metadata: TemplateMetadata;
  files: TemplateFile[];
}

export type TemplateCategory = 'auth' | 'dashboard' | 'form' | 'landing' | 'data';
