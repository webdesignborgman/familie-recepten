/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{css,scss}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        'primary-foreground': 'hsl(var(--color-primary-foreground) / <alpha-value>)',
        'primary-light': 'hsl(var(--color-primary-light) / <alpha-value>)',
        'primary-dark': 'hsl(var(--color-primary-dark) / <alpha-value>)',
        secondary: 'hsl(var(--color-secondary) / <alpha-value>)',
        'secondary-vibrant': 'hsl(var(--color-secondary-vibrant) / <alpha-value>)',
        tertiary: 'hsl(var(--color-tertiary) / <alpha-value>)',
        'tertiary-light': 'hsl(var(--color-tertiary-light) / <alpha-value>)',
        background: 'hsl(var(--color-background) / <alpha-value>)',
        foreground: 'hsl(var(--color-foreground) / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
        success: 'hsl(var(--color-success) / <alpha-value>)',
        warning: 'hsl(var(--color-warning) / <alpha-value>)',
        destructive: 'hsl(var(--color-destructive) / <alpha-value>)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--background-image-primary)',
        'gradient-hero': 'var(--background-image-hero)',
        'gradient-card': 'var(--background-image-card)',
        'gradient-subtle': 'var(--background-image-subtle)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        medium: 'var(--shadow-medium)',
        card: '0 4px 10px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        xl: 'var(--radius)',
        '2xl': '2rem',
      },
    },
  },
  plugins: [],
};
export default config;
