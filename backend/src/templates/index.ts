/**
 * Template Library Index
 * Central registry of all available templates
 */

import { Template } from './types';
import { LoginFormTemplate } from './auth/LoginForm.template';
import { AnalyticsDashboardTemplate } from './dashboards/AnalyticsDashboard.template';
import { ContactFormTemplate } from './forms/ContactForm.template';

export const ALL_TEMPLATES: Template[] = [
  LoginFormTemplate,
  AnalyticsDashboardTemplate,
  ContactFormTemplate,
  // More templates will be added here
];

export { LoginFormTemplate, AnalyticsDashboardTemplate, ContactFormTemplate };
export * from './types';
