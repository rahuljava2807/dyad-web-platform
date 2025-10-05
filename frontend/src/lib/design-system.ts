/**
 * Yavi Studio Design System
 * Production-quality design tokens and constants
 * Inspired by Apple, Stripe, Linear, and Vercel
 */

export const DesignSystem = {
  /**
   * Color Palette
   * Professional colors for production applications
   */
  colors: {
    // Primary - Blue
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },

    // Secondary - Purple
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },

    // Neutral - Gray
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },

    // Semantic Colors
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },

    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },

    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },

    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },

  /**
   * Typography Scale
   * Font sizes, weights, and line heights
   */
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    },

    fontSize: {
      xs: {
        size: '0.75rem',     // 12px
        lineHeight: '1rem',  // 16px
      },
      sm: {
        size: '0.875rem',    // 14px
        lineHeight: '1.25rem', // 20px
      },
      base: {
        size: '1rem',        // 16px
        lineHeight: '1.5rem', // 24px
      },
      lg: {
        size: '1.125rem',    // 18px
        lineHeight: '1.75rem', // 28px
      },
      xl: {
        size: '1.25rem',     // 20px
        lineHeight: '1.75rem', // 28px
      },
      '2xl': {
        size: '1.5rem',      // 24px
        lineHeight: '2rem',  // 32px
      },
      '3xl': {
        size: '1.875rem',    // 30px
        lineHeight: '2.25rem', // 36px
      },
      '4xl': {
        size: '2.25rem',     // 36px
        lineHeight: '2.5rem', // 40px
      },
      '5xl': {
        size: '3rem',        // 48px
        lineHeight: '1',
      },
      '6xl': {
        size: '3.75rem',     // 60px
        lineHeight: '1',
      },
    },

    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
  },

  /**
   * Spacing Scale (8px grid system)
   * Consistent spacing for margins, padding, gaps
   */
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  /**
   * Border Radius
   * Consistent corner rounding
   */
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  /**
   * Shadows
   * Layered depth for UI elements
   */
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  /**
   * Z-Index Scale
   * Layering order for UI elements
   */
  zIndex: {
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  /**
   * Transitions
   * Smooth animations timing
   */
  transitions: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },

    timing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  /**
   * Breakpoints
   * Responsive design breakpoints
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

/**
 * Component-specific design tokens
 */
export const ComponentTokens = {
  button: {
    primary: {
      default: 'bg-primary-600 hover:bg-primary-700 text-white',
      disabled: 'bg-primary-300 cursor-not-allowed',
    },
    secondary: {
      default: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900',
      disabled: 'bg-neutral-50 text-neutral-400 cursor-not-allowed',
    },
    outline: {
      default: 'border-2 border-neutral-300 hover:border-neutral-400 text-neutral-900',
      disabled: 'border-neutral-200 text-neutral-400 cursor-not-allowed',
    },
    ghost: {
      default: 'text-neutral-700 hover:bg-neutral-100',
      disabled: 'text-neutral-400 cursor-not-allowed',
    },
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-lg',
      xl: 'px-8 py-4 text-xl rounded-xl',
    },
  },

  input: {
    default: 'w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all',
    error: 'w-full px-4 py-2 border-2 border-error-500 rounded-lg focus:ring-2 focus:ring-error-500 focus:border-transparent outline-none',
    disabled: 'w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 cursor-not-allowed',
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    },
  },

  card: {
    default: 'bg-white rounded-xl shadow-md p-6 border border-neutral-200',
    elevated: 'bg-white rounded-xl shadow-xl p-8 border border-neutral-100',
    interactive: 'bg-white rounded-xl shadow-md p-6 border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer',
    flat: 'bg-neutral-50 rounded-lg p-6',
  },

  badge: {
    success: 'bg-success-50 text-success-700 border border-success-200',
    error: 'bg-error-50 text-error-700 border border-error-200',
    warning: 'bg-warning-50 text-warning-700 border border-warning-200',
    info: 'bg-info-50 text-info-700 border border-info-200',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    sizes: {
      sm: 'px-2 py-0.5 text-xs rounded-md',
      md: 'px-2.5 py-1 text-sm rounded-md',
      lg: 'px-3 py-1.5 text-base rounded-lg',
    },
  },
} as const;

/**
 * Animation Variants (for Framer Motion)
 */
export const AnimationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },

  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
} as const;

/**
 * Utility function to merge class names
 * Enhanced to work with shadcn/ui components
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * shadcn/ui Design System Integration
 * Additional tokens and utilities for seamless integration
 */
export const ShadcnTokens = {
  /**
   * CSS Variables for shadcn/ui
   * These should match the values in globals.css
   */
  cssVariables: {
    light: {
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(215 25% 27%)',
      card: 'hsl(0 0% 100%)',
      'card-foreground': 'hsl(215 25% 27%)',
      popover: 'hsl(0 0% 100%)',
      'popover-foreground': 'hsl(215 25% 27%)',
      primary: 'hsl(214 95% 43%)',
      'primary-foreground': 'hsl(0 0% 98%)',
      secondary: 'hsl(214 32% 91%)',
      'secondary-foreground': 'hsl(215 25% 27%)',
      muted: 'hsl(214 32% 91%)',
      'muted-foreground': 'hsl(215 16% 47%)',
      accent: 'hsl(214 32% 91%)',
      'accent-foreground': 'hsl(215 25% 27%)',
      destructive: 'hsl(0 84.2% 60.2%)',
      'destructive-foreground': 'hsl(0 0% 98%)',
      border: 'hsl(214 32% 91%)',
      input: 'hsl(214 32% 91%)',
      ring: 'hsl(214 95% 43%)',
      radius: '0.25rem',
    },
    dark: {
      background: 'hsl(240 10% 3.9%)',
      foreground: 'hsl(0 0% 98%)',
      card: 'hsl(240 10% 3.9%)',
      'card-foreground': 'hsl(0 0% 98%)',
      popover: 'hsl(240 10% 3.9%)',
      'popover-foreground': 'hsl(0 0% 98%)',
      primary: 'hsl(0 0% 98%)',
      'primary-foreground': 'hsl(240 5.9% 10%)',
      secondary: 'hsl(240 3.7% 15.9%)',
      'secondary-foreground': 'hsl(0 0% 98%)',
      muted: 'hsl(240 3.7% 15.9%)',
      'muted-foreground': 'hsl(240 5% 64.9%)',
      accent: 'hsl(240 3.7% 15.9%)',
      'accent-foreground': 'hsl(0 0% 98%)',
      destructive: 'hsl(0 62.8% 30.6%)',
      'destructive-foreground': 'hsl(0 0% 98%)',
      border: 'hsl(240 3.7% 15.9%)',
      input: 'hsl(240 3.7% 15.9%)',
      ring: 'hsl(240 4.9% 83.9%)',
      radius: '0.25rem',
    },
  },

  /**
   * Component-specific design tokens for shadcn/ui
   */
  components: {
    button: {
      variants: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      sizes: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    input: {
      default: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    },
    card: {
      default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    },
    badge: {
      variants: {
        default: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
  },
} as const;

export default DesignSystem;
