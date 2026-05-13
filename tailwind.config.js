/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
        extend: {
            // Tipografia moderna (Fase 1)
            fontSize: {
                'xs': ['12px', { lineHeight: '16px', letterSpacing: '-0.01em' }],
                'sm': ['13px', { lineHeight: '18px', letterSpacing: '-0.01em' }],
                'base': ['14px', { lineHeight: '20px', letterSpacing: '-0.01em' }],
                'lg': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
                'xl': ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
                '2xl': ['20px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
                '3xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
                '4xl': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
                '5xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
            },
            fontWeight: {
                'thin': '100',
                'extralight': '200',
                'light': '300',
                'normal': '400',
                'medium': '500',
                'semibold': '600',
                'bold': '700',
                'extrabold': '800',
                'black': '900',
            },
            
            // Espaçamentos modernos - escala 4px (Fase 1)
            spacing: {
                '0.5': '2px',
                '1': '4px',
                '1.5': '6px',
                '2': '8px',
                '2.5': '10px',
                '3': '12px',
                '3.5': '14px',
                '4': '16px',
                '5': '20px',
                '6': '24px',
                '7': '28px',
                '8': '32px',
                '9': '36px',
                '10': '40px',
                '12': '48px',
                '14': '56px',
                '16': '64px',
                '20': '80px',
                '24': '96px',
                '28': '112px',
                '32': '128px',
            },
            
            // Sombras premium (Fase 1)
            boxShadow: {
                'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                'base': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                'none': 'none',
            },
            
            // Bordas arredondadas modernas (Fase 1)
            borderRadius: {
                'none': '0px',
                'xs': '4px',
                'sm': '6px',
                'base': '8px',
                'md': '10px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '20px',
                '3xl': '24px',
                'full': '9999px',
            },
            
            // Cores premium - Design System (Fase 1)
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                
                // Primária: Azul profundo (moderno)
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                    '50': 'hsl(var(--primary-50))',
                    '100': 'hsl(var(--primary-100))',
                    '200': 'hsl(var(--primary-200))',
                    '300': 'hsl(var(--primary-300))',
                    '400': 'hsl(var(--primary-400))',
                    '500': 'hsl(var(--primary-500))',
                    '600': 'hsl(var(--primary-600))',
                    '700': 'hsl(var(--primary-700))',
                    '800': 'hsl(var(--primary-800))',
                    '900': 'hsl(var(--primary-900))',
                },
                
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                
                // Status colors (verde, vermelho, âmbar, azul)
                success: 'hsl(var(--success))',
                'success-fg': 'hsl(var(--success-foreground))',
                warning: 'hsl(var(--warning))',
                'warning-fg': 'hsl(var(--warning-foreground))',
                error: 'hsl(var(--error))',
                'error-fg': 'hsl(var(--error-foreground))',
                info: 'hsl(var(--info))',
                'info-fg': 'hsl(var(--info-foreground))',
                
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                }
            },
            
            // Animações modernas (Fase 1)
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                'fade-out': {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' }
                },
                'slide-in': {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                'slide-out': {
                    '0%': { transform: 'translateY(0)', opacity: '1' },
                    '100%': { transform: 'translateY(10px)', opacity: '0' }
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' }
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' }
                },
            },
            
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.2s ease-out',
                'fade-out': 'fade-out 0.2s ease-out',
                'slide-in': 'slide-in 0.3s ease-out',
                'slide-out': 'slide-out 0.3s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
                'shimmer': 'shimmer 2s infinite',
                'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        }
    },
    plugins: [require("tailwindcss-animate")],