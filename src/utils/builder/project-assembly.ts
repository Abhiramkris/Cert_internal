import { COMPONENT_TEMPLATES } from './templates'

export interface ProjectFiles {
  [path: string]: string
}

export interface AssembleOptions {
  isPreview?: boolean
}

export function assembleProjectFiles(project: any, config: any, options: AssembleOptions = {}): ProjectFiles {
  if (!config) throw new Error('Builder configuration not found')

  const styles = config.global_styles
  const content = {
    h1: project.client_name,
    description: project.description,
    ...config.content_overrides
  }

  const files: ProjectFiles = {}

  // 1. package.json (Only for Ejected Builds)
  if (!options.isPreview) {
    files['package.json'] = JSON.stringify({
      name: project.client_name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start"
      },
      dependencies: {
        "next": "latest",
        "react": "latest",
        "react-dom": "latest",
        "lucide-react": "^0.577.0",
        "clsx": "latest",
        "tailwind-merge": "latest",
        "framer-motion": "latest"
      },
      devDependencies: {
        "tailwindcss": "^4.0.0",
        "@tailwindcss/postcss": "^4.0.0",
        "postcss": "latest",
        "autoprefixer": "latest",
        "typescript": "latest",
        "@types/node": "latest",
        "@types/react": "latest",
        "@types/react-dom": "latest"
      }
    }, null, 2)
  }

  // 2. data/config.json
  const pageMap = config.selected_components_map || { 'Home': config.selected_components || [] }
  const projectPages = Object.keys(pageMap)

  files['data/config.json'] = JSON.stringify({
    styles: {
      ...config.global_styles,
      font_family_heading: config.global_styles.font_family_heading || 'Inter',
      font_family_body: config.global_styles.font_family_body || 'Inter',
      text_alignment: config.global_styles.text_alignment || 'left',
      font_size_h1: config.global_styles.font_size_h1 || '48',
      font_size_h2: config.global_styles.font_size_h2 || '32',
      font_size_body: config.global_styles.font_size_body || '16',
      button_shadow: config.global_styles.button_shadow || 'none',
      button_animation: config.global_styles.button_animation || 'scale',
      button_padding: config.global_styles.button_padding || 'standard',
      show_secondary_cta: config.global_styles.show_secondary_cta !== false
    },
    content: {
      brand_name: project.client_name,
      description: project.description,
      email: config.content_overrides?.email || 'projects@agency.com',
      phone: config.content_overrides?.phone || '+1 (555) 000-1111',
      privacy_intro: "We value your privacy and professional data integrity.",
      terms_intro: "Professional standards and service agreements apply to all digital breakthroughs.",
      ...config.content_overrides
    },
    settings: config.component_settings || {},
    pages: projectPages
  }, null, 2)

  // 3. Components Compilation (Deduplicated)
  const uniqueKeys = new Set<string>()
  Object.values(pageMap).forEach((keys: any) => {
    (keys || []).forEach((k: string) => {
      if ((COMPONENT_TEMPLATES as any)[k]) uniqueKeys.add(k)
    })
  })

  uniqueKeys.forEach((key: string) => {
    const template = (COMPONENT_TEMPLATES as any)[key]
    if (template) {
      files[`components/${key.toLowerCase().replace(/_/g, '-')}.tsx`] = template.code(styles, content)
    }
  })

  // 4. Dynamic Pages Assembly
  Object.entries(pageMap).forEach(([pageName, rawKeys]: [string, any]) => {
     const validKeys = (rawKeys || []).filter((key: string) => (COMPONENT_TEMPLATES as any)[key])
     const navs = validKeys.filter((key: string) => key.startsWith('NAV_'))
     const footers = validKeys.filter((key: string) => key.startsWith('FOOTER_'))
     const body = validKeys.filter((key: string) => !key.startsWith('NAV_') && !key.startsWith('FOOTER_'))
     const orderedKeys = [...navs, ...body, ...footers]

     const isHome = pageName.toLowerCase() === 'home'
     const dotPath = isHome ? '..' : '../..'
     
     const imports = orderedKeys.map((key: string) => `import ${key.replace(/_/g, '')} from '${dotPath}/components/${key.toLowerCase().replace(/_/g, '-')}';`).join('\n')
     const sections = orderedKeys.map((key: string) => `
      <section id="${key.toLowerCase().replace(/_/g, '-')}">
        <${key.replace(/_/g, '')} />
      </section>`).join('\n      ')

     const pageCode = `
import React from 'react';
import config from '${dotPath}/data/config.json';
${imports}

export default function ${pageName.replace(/\s+/g, '')}Page() {
  return (
    <main className="min-h-screen">
      ${sections}
    </main>
  );
}
`
     if (isHome) {
       files['app/page.tsx'] = pageCode.trim()
     } else {
       const routePath = pageName.toLowerCase().replace(/\s+/g, '-')
       files[`app/${routePath}/page.tsx`] = pageCode.trim()
     }
  })

  // 6. Layout & global CSS
  const headingFont = styles.font_family_heading || 'Inter'
  const bodyFont = styles.font_family_body || 'Inter'
  const fontImport = `https://fonts.googleapis.com/css2?family=${headingFont.replace(/\s+/g, '+')}:wght@400;700;900&family=${bodyFont.replace(/\s+/g, '+')}:wght@400;500;700&display=swap`

  files['app/layout.tsx'] = `
import './globals.css';
import React from 'react';
export const metadata = { title: '${project.client_name} | Premium Web' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="${fontImport}" rel="stylesheet" />
      </head>
      <body className="antialiased text-zinc-900 bg-white">
        {children}
      </body>
    </html>
  );
}
`

  files['app/globals.css'] = `
@import "tailwindcss";

@theme {
  --color-primary: ${styles.primary_color || '#000000'};
  --color-accent: ${styles.accent_color || '#3b82f6'};
  
  --font-heading: "${headingFont}", ui-sans-serif, system-ui;
  --font-body: "${bodyFont}", ui-sans-serif, system-ui;

  --radius-xl: ${styles.border_radius === 'xl' ? '1.5rem' : '0.5rem'};
}

body {
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

@layer components {
  .btn-primary {
    @apply rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 cursor-pointer;
    
    /* Padding */
    ${styles.button_padding === 'compact' ? 'padding: 0.75rem 1.75rem;' : ''}
    ${styles.button_padding === 'standard' ? 'padding: 1rem 2.5rem;' : ''}
    ${styles.button_padding === 'large' ? 'padding: 1.5rem 3.5rem;' : ''}

    /* Style */
    ${styles.button_style === 'solid' ? `
    @apply bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/30;
    ` : ''}
    ${styles.button_style === 'gradient' ? `
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    @apply text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 border-none;
    ` : ''}
    ${styles.button_style === 'outline' ? `
    @apply border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-lg shadow-primary/5;
    ` : ''}

    /* Shadow */
    ${styles.button_shadow === 'soft' ? 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);' : ''}
    ${styles.button_shadow === 'hard' ? 'box-shadow: 8px 8px 0px 0px rgba(0,0,0,1); border: 2px solid #000;' : ''}
  }

  .btn-secondary {
    @apply rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 hover:bg-zinc-50 border border-zinc-200 text-zinc-900 cursor-pointer;
    
    /* Padding */
    ${styles.button_padding === 'compact' ? 'padding: 0.75rem 1.75rem;' : ''}
    ${styles.button_padding === 'standard' ? 'padding: 1rem 2.5rem;' : ''}
    ${styles.button_padding === 'large' ? 'padding: 1.5rem 3.5rem;' : ''}
  }
}
`

  // 7. PostCSS Config (Tailwind 4 uses CSS-first, but Next.js needs PostCSS support for @tailwind)
  files['postcss.config.js'] = `
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
}
`

  // 8. gitignore (Only for Ejected Builds)
  if (!options.isPreview) {
    files['.gitignore'] = `
node_modules
.next
out
build
.env*
.DS_Store
*.tsbuildinfo
next-env.d.ts
`
  }

  // 9. tsconfig.json (Prevents Next.js warning spam)
  files['tsconfig.json'] = JSON.stringify({
    "compilerOptions": {
      "target": "es5",
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve"
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
  }, null, 2)

  return files
}
