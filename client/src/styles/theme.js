// Color palette inspired by minimalistic orange theme
export const colors = {
  primary: {
    light: '#FFB74D', // Light orange
    main: '#FF9100',  // Main orange
    dark: '#F57C00',  // Dark orange
    contrast: '#FFFFFF' // White text for orange backgrounds
  },
  secondary: {
    light: '#F5F5F5', // Almost white
    main: '#EEEEEE',  // Light grey
    dark: '#E0E0E0',  // Medium grey
    contrast: '#212121' // Dark grey text
  },
  background: {
    default: '#FFFFFF',
    paper: '#FAFAFA',
    elevated: '#FFFFFF'
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E'
  },
  error: '#FF5252',
  success: '#4CAF50',
  warning: '#FFC107'
};

// Consistent spacing units
export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  xxl: '3rem'     // 48px
};

// Typography scale
export const typography = {
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: spacing.lg
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    marginBottom: spacing.md
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    color: '#757575'
  }
};

// Shadows
export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
  lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
};

// Border radius
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  round: '50%'
};

// Transitions
export const transitions = {
  default: 'all 0.2s ease-in-out',
  fast: 'all 0.1s ease-in-out',
  slow: 'all 0.3s ease-in-out'
};