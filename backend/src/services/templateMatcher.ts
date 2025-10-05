/**
 * Template Matcher Service
 * Intelligently selects templates based on user prompts
 */

import { Template } from '../templates/types';
import { ALL_TEMPLATES } from '../templates';

export class TemplateMatcher {
  /**
   * Select the best matching template for a user prompt
   * Returns null if no template matches (will use AI generation)
   */
  static selectTemplate(userPrompt: string): Template | null {
    const promptLower = userPrompt.toLowerCase();

    // Auth patterns
    if (this.matchesPattern(promptLower, ['login', 'sign in', 'signin', 'log in'])) {
      return ALL_TEMPLATES.find(t => t.metadata.id === 'auth-login-form') || null;
    }

    if (this.matchesPattern(promptLower, ['sign up', 'signup', 'register', 'registration', 'create account'])) {
      // Will return SignUp template when created
      return ALL_TEMPLATES.find(t => t.metadata.id === 'auth-signup-form') || null;
    }

    if (this.matchesPattern(promptLower, ['forgot password', 'reset password', 'password recovery'])) {
      return ALL_TEMPLATES.find(t => t.metadata.id === 'auth-forgot-password') || null;
    }

    // Dashboard patterns
    if (this.matchesPattern(promptLower, ['dashboard', 'analytics dashboard', 'metrics'])) {
      return ALL_TEMPLATES.find(t => t.metadata.id === 'dashboard-analytics') || null;
    }

    if (this.matchesPattern(promptLower, ['sales dashboard', 'revenue dashboard'])) {
      return ALL_TEMPLATES.find(t => t.metadata.id === 'dashboard-sales') || null;
    }

    // Form patterns
    if (this.matchesPattern(promptLower, ['contact form', 'contact page', 'get in touch'])) {
      return ALL_TEMPLATES.find(t => t.metadata.id === 'form-contact') || null;
    }

    if (this.matchesPattern(promptLower, ['survey', 'questionnaire', 'feedback form'])) {
      return ALL_TEMPLATES.find(t => t.metadata.id === 'form-survey') || null;
    }

    // No template match - will use AI generation
    return null;
  }

  /**
   * Check if prompt contains any of the patterns
   */
  private static matchesPattern(prompt: string, patterns: string[]): boolean {
    return patterns.some(pattern => prompt.includes(pattern));
  }

  /**
   * Get all available templates by category
   */
  static getTemplatesByCategory(category: string): Template[] {
    return ALL_TEMPLATES.filter(t => t.metadata.category === category);
  }

  /**
   * Get template by ID
   */
  static getTemplateById(id: string): Template | null {
    return ALL_TEMPLATES.find(t => t.metadata.id === id) || null;
  }

  /**
   * Search templates by tags
   */
  static searchByTags(tags: string[]): Template[] {
    return ALL_TEMPLATES.filter(t =>
      tags.some(tag => t.metadata.tags.includes(tag))
    );
  }
}
