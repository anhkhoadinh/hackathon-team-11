/**
 * MeetingMind AI Design System
 * 
 * Brand Personality: Calm, Intelligent, Professional, AI-powered
 * Visual Tone: Light, Minimal, Soft Contrast, High Readability
 */

export const DesignSystem = {
  // ============================================
  // COLOR SYSTEM
  // ============================================
  colors: {
    // Primary Brand Colors
    primary: {
      main: '#25C9D0',      // Primary cyan - use for primary actions, active states, highlights
      light: '#7DE5EA',     // Light variant
      dark: '#1BA1A8',      // Dark variant
      hover: '#1BA1A8',     // Hover state
    },
    
    // Secondary Brand Colors
    secondary: {
      main: '#14B8A6',      // Secondary teal - supporting elements
      light: '#5EEAD4',     // Light variant
      dark: '#0F9488',      // Dark variant
    },
    
    // Neutral Colors
    neutral: {
      white: '#FFFFFF',
      slate50: '#F8FAFC',
      slate100: '#F1F5F9',
      slate200: '#E2E8F0',
      slate300: '#CBD5E1',
      slate400: '#94A3B8',
      slate500: '#64748B',
      slate600: '#475569',
      slate700: '#334155',
      slate800: '#1E293B',
      slate900: '#0F172A',
    },
    
    // Semantic Colors (use sparingly, prefer brand colors)
    semantic: {
      success: '#14B8A6',   // Use secondary for success
      warning: '#F59E0B',   // Amber - only for warnings
      error: '#EF4444',     // Red - only for errors
      info: '#25C9D0',      // Use primary for info
    },
  },

  // ============================================
  // TYPOGRAPHY SCALE
  // ============================================
  typography: {
    // Headings
    h1: {
      fontSize: '3rem',      // 48px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',   // 36px
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.875rem',   // 30px
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',     // 24px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '1.25rem',    // 20px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',   // 18px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    
    // Body Text
    body: {
      large: {
        fontSize: '1rem',    // 16px
        fontWeight: 400,
        lineHeight: 1.6,
      },
      medium: {
        fontSize: '0.9375rem', // 15px
        fontWeight: 400,
        lineHeight: 1.6,
      },
      small: {
        fontSize: '0.875rem',  // 14px
        fontWeight: 400,
        lineHeight: 1.6,
      },
    },
    
    // Metadata & Labels
    metadata: {
      fontSize: '0.8125rem', // 13px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    label: {
      fontSize: '0.75rem',    // 12px
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
  },

  // ============================================
  // SPACING SCALE
  // ============================================
  spacing: {
    // Section Gaps (vertical spacing between major sections)
    section: {
      xs: '1.5rem',   // 24px
      sm: '2rem',     // 32px
      md: '3rem',     // 48px
      lg: '4rem',     // 64px
      xl: '6rem',     // 96px
    },
    
    // Component Padding
    padding: {
      xs: '0.75rem',  // 12px
      sm: '1rem',     // 16px
      md: '1.5rem',   // 24px
      lg: '2rem',     // 32px
      xl: '3rem',     // 48px
    },
    
    // Component Gaps (spacing between related elements)
    gap: {
      xs: '0.5rem',   // 8px
      sm: '0.75rem',  // 12px
      md: '1rem',     // 16px
      lg: '1.5rem',   // 24px
      xl: '2rem',     // 32px
    },
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  radius: {
    none: '0',
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    full: '9999px',
  },

  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgba(37, 201, 208, 0.05)',
    md: '0 4px 6px -1px rgba(37, 201, 208, 0.1), 0 2px 4px -1px rgba(37, 201, 208, 0.06)',
    lg: '0 10px 15px -3px rgba(37, 201, 208, 0.1), 0 4px 6px -2px rgba(37, 201, 208, 0.05)',
    xl: '0 20px 25px -5px rgba(37, 201, 208, 0.1), 0 10px 10px -5px rgba(37, 201, 208, 0.04)',
    // Brand-colored shadows
    primary: '0 8px 32px 0 rgba(37, 201, 208, 0.12)',
    primaryHover: '0 20px 40px rgba(37, 201, 208, 0.15), 0 8px 16px rgba(0, 0, 0, 0.08)',
  },

  // ============================================
  // COMPONENT STYLES
  // ============================================
  components: {
    // Cards
    card: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropBlur: '20px',
      border: '1px solid rgba(37, 201, 208, 0.2)',
      borderRadius: '1rem', // 16px
      padding: '1.5rem',    // 24px
      shadow: '0 8px 32px 0 rgba(37, 201, 208, 0.08)',
    },
    
    // Buttons
    button: {
      borderRadius: '0.625rem', // 10px
      fontWeight: 600,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Inputs
    input: {
      borderRadius: '0.625rem', // 10px
      border: '2px solid #E2E8F0',
      padding: '0.625rem 1rem', // 10px 16px
      focusBorder: '#25C9D0',
      focusRing: '2px',
    },
    
    // Badges
    badge: {
      borderRadius: '0.5rem', // 8px
      padding: '0.25rem 0.75rem', // 4px 12px
      fontSize: '0.75rem', // 12px
      fontWeight: 600,
    },
  },

  // ============================================
  // INTERACTION STATES
  // ============================================
  interactions: {
    // Hover
    hover: {
      transform: 'translateY(-2px)',
      shadow: '0 20px 40px rgba(37, 201, 208, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Focus
    focus: {
      ring: '2px',
      ringColor: '#25C9D0',
      ringOffset: '2px',
    },
    
    // Active
    active: {
      transform: 'scale(0.98)',
    },
  },

  // ============================================
  // ANIMATIONS
  // ============================================
  animations: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
} as const;

/**
 * Tailwind Class Utilities
 * Use these for consistent styling across components
 */
export const DesignTokens = {
  // Colors
  primary: {
    bg: 'bg-[#25C9D0]',
    text: 'text-[#25C9D0]',
    border: 'border-[#25C9D0]',
    hover: 'hover:bg-[#1BA1A8]',
    light: 'bg-[#25C9D0]/10',
    lightText: 'text-[#1BA1A8]',
  },
  secondary: {
    bg: 'bg-[#14B8A6]',
    text: 'text-[#14B8A6]',
    border: 'border-[#14B8A6]',
    hover: 'hover:bg-[#0F9488]',
    light: 'bg-[#14B8A6]/10',
    lightText: 'text-[#0F9488]',
  },
  
  // Gradients
  gradient: {
    primary: 'bg-gradient-to-r from-[#25C9D0] to-[#14B8A6]',
    primaryText: 'bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] bg-clip-text text-transparent',
    card: 'bg-gradient-to-br from-white to-[#25C9D0]/5',
  },
  
  // Glass morphism
  glass: 'glass border-[#25C9D0]/20',
  
  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    primary: 'shadow-lg shadow-[#25C9D0]/30',
  },
  
  // Border radius
  radius: {
    sm: 'rounded-[8px]',
    md: 'rounded-[10px]',
    lg: 'rounded-[12px]',
    xl: 'rounded-[16px]',
  },
} as const;

