/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Modern color palette
        electric: {
          50: '#f0f7ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        neon: {
          50: '#fdf4ff',
          500: '#a855f7',
          600: '#9333ea',
        },
        cyber: {
          50: '#f0fdfa',
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-left": "slideLeft 0.4s ease-out",
        "slide-right": "slideRight 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "scale-out": "scaleOut 0.2s ease-in",
        "bounce-in": "bounceIn 0.6s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
        // Enhanced modern animations
        "gradient-shift": "gradientShift 3s ease-in-out infinite",
        "morphing": "morphing 4s ease-in-out infinite",
        "text-glow": "textGlow 2s ease-in-out infinite alternate",
        "levitate": "levitate 4s ease-in-out infinite",
        "breath": "breath 3s ease-in-out infinite",
        "magnetic": "magnetic 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
          "100%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.8)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        // Enhanced modern keyframes
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        morphing: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        textGlow: {
          "0%": { textShadow: "0 0 10px rgba(59, 130, 246, 0.5)" },
          "100%": { textShadow: "0 0 20px rgba(59, 130, 246, 1), 0 0 30px rgba(59, 130, 246, 0.5)" },
        },
        levitate: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-10px) rotate(1deg)" },
          "50%": { transform: "translateY(-20px) rotate(0deg)" },
          "75%": { transform: "translateY(-10px) rotate(-1deg)" },
        },
        breath: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        magnetic: {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(-4px, -4px)" },
        },
      },
      // Graphics performance optimizations
      transitionProperty: {
        'transform': 'transform',
        'opacity': 'opacity',
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    // Add performance optimization plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.gpu-accelerated': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        },
        '.smooth-scroll': {
          scrollBehavior: 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
        '.text-render-optimized': {
          textRendering: 'optimizeLegibility',
          fontFeatureSettings: '"rlig" 1, "calt" 1',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};
