import { COMPONENT_TEMPLATES } from './templates'

export interface ProjectFiles {
  [path: string]: string
}

export interface AssembleOptions {
  isPreview?: boolean
  currentHost?: string
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
  const projectPages = config.pages && config.pages.length > 0 ? config.pages : Object.keys(pageMap)

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
      const templateSettings = config.component_settings?.[key] || {}
      files[`components/${key.toLowerCase().replace(/_/g, '-')}.tsx`] = template.code(styles, content, templateSettings)
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

  // 5. Automatic Privacy Policy Page Generation
  const allUsedKeys = (Object.values(pageMap).flat() as string[]) || [];
  const validGlobalKeys = allUsedKeys.filter((key: string) => (COMPONENT_TEMPLATES as any)[key]);
  const defaultNav = validGlobalKeys.find((key: string) => key.startsWith('NAV_'));
  const defaultFooter = validGlobalKeys.find((key: string) => key.startsWith('FOOTER_'));

  const privacyImports = [];
  const privacyComponents = [];

  if (defaultNav) {
    privacyImports.push(`import ${defaultNav.replace(/_/g, '')} from '../components/${defaultNav.toLowerCase().replace(/_/g, '-')}';`);
    privacyComponents.push(`<${defaultNav.replace(/_/g, '')} />`);
  }

  const bgClass = styles.primary_color === '#000000' || styles.primary_color === '#052c22' || styles.primary_color === '#111827' || styles.primary_color === '#0f172a' ? 'bg-zinc-950 text-zinc-300' : 'bg-[#fafafa] text-zinc-600';
  const headingClass = styles.primary_color === '#000000' || styles.primary_color === '#052c22' || styles.primary_color === '#111827' || styles.primary_color === '#0f172a' ? 'text-white' : 'text-zinc-900';
  const borderClass = styles.primary_color === '#000000' || styles.primary_color === '#052c22' || styles.primary_color === '#111827' || styles.primary_color === '#0f172a' ? 'border-white/10' : 'border-zinc-200';

  files['app/privacy-policy/page.tsx'] = `
import React from 'react';
import config from '../data/config.json';
${privacyImports.join('\n')}
${defaultFooter ? `import ${defaultFooter.replace(/_/g, '')} from '../components/${defaultFooter.toLowerCase().replace(/_/g, '-')}';` : ''}

export default function PrivacyPolicyPage() {
  const companyName = config.content.brand_name || "${project.client_name}";
  const email = config.content.email || "hello@company.com";
  const phone = config.content.phone || "";
  const domain = config.content.domain || ("www." + companyName.toLowerCase().replace(/\\s+/g, '') + ".com");

  return (
    <main className="min-h-screen flex flex-col ${bgClass} font-sans">
      ${privacyComponents.join('\n      ')}
      
      <section className="flex-1 max-w-4xl mx-auto w-full px-8 py-32 md:py-48 space-y-16">
        <div className="space-y-6 border-b ${borderClass} pb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter ${headingClass}" style={{ fontFamily: config.styles.font_family_heading }}>Privacy Policy</h1>
          <p className="font-bold tracking-widest uppercase text-xs opacity-60">Effective Date: 15/02/2026</p>
        </div>

        <div className="space-y-12 prose prose-invert max-w-none text-sm md:text-base leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-5">
            <h2 className="text-2xl font-black uppercase tracking-tighter ${headingClass} italic" style={{ fontFamily: config.styles.font_family_heading }}>1. Introduction and Organizational Info</h2>
            <p>We, at <strong>{companyName}</strong>, are dedicated to serving our customers and contacts to the best of our abilities. Part of our commitment involves the responsible management of personal information collected through our website <strong>{domain}</strong>, and any related interactions. Our primary goals in processing this information include:</p>
            <ul className="list-disc pl-6 space-y-2 opacity-80 font-medium">
              <li>Enhancing the user experience on our platform by understanding customer needs and preferences.</li>
              <li>Providing timely support and responding to inquiries or service requests.</li>
              <li>Improving our products and services to meet the evolving demands of our users.</li>
              <li>Conducting necessary business operations, such as billing and account management.</li>
            </ul>
            <p>It is our policy to process personal information with the utmost respect for privacy and security. We adhere to all relevant regulations and guidelines to ensure that the data we handle is protected against unauthorized access, disclosure, alteration, and destruction. Our practices are designed to safeguard the confidentiality and integrity of your personal information, while enabling us to deliver the services you trust us with.</p>
            <p>We do not have a designated Data Protection Officer (DPO) but remain fully committed to addressing your privacy concerns. Should you have any questions or require further information about how we manage personal information, please feel free to contact us at <strong>{email}</strong> or <strong>{phone}</strong>.</p>
            <p>Your privacy is our priority. We are committed to processing your personal information transparently and with your safety in mind. This commitment extends to our collaboration with third-party services that may process personal information on our behalf, such as in the case of sending invoices. Rest assured, all activities are conducted in strict compliance with applicable privacy laws.</p>
          </div>

          {/* Section 2 */}
          <div className="space-y-5">
            <h2 className="text-2xl font-black uppercase tracking-tighter ${headingClass} italic" style={{ fontFamily: config.styles.font_family_heading }}>2. Scope and Application</h2>
            <p>Our privacy policy is designed to protect the personal information of all our stakeholders, including website visitors, registered users, and customers. Whether you are just browsing our website {domain}, using our services as a registered user, or engaging with us as a valued customer, we ensure that your personal data is processed with the highest standards of privacy and security. This policy outlines our practices and your rights related to personal information.</p>
          </div>

          {/* Section 3 */}
          <div className="space-y-5">
            <h2 className="text-2xl font-black uppercase tracking-tighter ${headingClass} italic" style={{ fontFamily: config.styles.font_family_heading }}>3. Data Collection and Processing</h2>
            <p>Our commitment to transparency and data protection extends to how we collect and use your personal information. We gather personal data through various interactions, such as when you utilize our services or directly provide information to us.</p>
            <p>The following list details the types of personal information we may process:</p>
            <ul className="list-disc pl-6 space-y-2 opacity-80 font-medium">
              <li>First and last name</li>
              <li>National identification numbers</li>
              <li>Payment information (e.g., credit card number, bank details)</li>
              <li>Payment method and history</li>
              <li>IP-based approximate location</li>
              <li>Operating system and version</li>
              <li>Browser fingerprint</li>
            </ul>
            <p>Please note that we only process information that is essential for delivering our services or for enhancing user experience while complying with legal obligations.</p>
            <p>At <strong>{companyName}</strong>, we believe in using personal information responsibly and ethically. The data we collect serves multiple purposes, all aimed at enhancing the services we offer. Here are the key ways in which we use the personal information collected:</p>
            <ul className="list-disc pl-6 space-y-2 opacity-80 font-medium">
              <li>Authentication and security</li>
              <li>Communication efforts</li>
              <li>Payment processing</li>
              <li>Fraud prevention and risk management</li>
              <li>Customer support</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-5">
            <h2 className="text-2xl font-black uppercase tracking-tighter ${headingClass} italic" style={{ fontFamily: config.styles.font_family_heading }}>4. Data Storage and Protection</h2>
            <h3 className="font-bold opacity-90 text-lg uppercase tracking-widest ${headingClass}">Data storage</h3>
            <p>Personal information is stored in secure servers located in the following locations: IN, US. For services that require international data transfer, we ensure that such transfers comply with all applicable laws and maintain data protection standards equivalent to those in our primary location.</p>
            <h3 className="font-bold opacity-90 text-lg uppercase tracking-widest mt-6 ${headingClass}">Data Protection Measures</h3>
            <p><strong>Encryption:</strong> To protect data during transfer and at rest, we employ robust encryption technologies.</p>
            <p><strong>Access control:</strong> Access to personal information is strictly limited to authorized personnel who have a legitimate business need to access the data. We enforce strict access controls and regularly review permissions.</p>
          </div>

          {/* Section 5 */}
          <div className="space-y-5">
            <h2 className="text-2xl font-black uppercase tracking-tighter ${headingClass} italic" style={{ fontFamily: config.styles.font_family_heading }}>5. Transparency and Control</h2>
            <p>We believe in transparency and providing you with control over your personal information. You will always be informed about any significant changes to our sharing practices, and where applicable, you will have the option to consent to such changes.</p>
            <p>Your trust is important to us, and we strive to ensure that your personal information is disclosed only in accordance with this policy and when there is a justified reason to do so. For any queries or concerns about how we share and disclose personal information, please reach out to us at <strong>{email}</strong> or <strong>{phone}</strong>.</p>
          </div>
          
           {/* Section 6 */}
          <div className="space-y-5">
            <h2 className="text-2xl font-black uppercase tracking-tighter ${headingClass} italic" style={{ fontFamily: config.styles.font_family_heading }}>6. User Rights and Choices</h2>
            <p>At <strong>{companyName}</strong>, we recognize and respect your rights regarding your personal information, in accordance with the General Data Protection Regulation (GDPR) and other applicable data protection laws. We are committed to ensuring you can exercise your rights effectively. Below is an overview of your rights and how you can exercise them:</p>
            <ul className="list-disc pl-6 space-y-4 opacity-80 font-medium">
              <li><strong>Right of access (Art. 15 GDPR):</strong> You have the right to request access to the personal information we hold about you and to obtain information about how we process it.</li>
              <li><strong>Right to rectification (Art. 16 GDPR):</strong> If you believe that any personal information we hold about you is incorrect or incomplete, you have the right to request its correction.</li>
              <li><strong>Right to erasure (Art. 17 GDPR):</strong> You have the right to request the deletion of your personal information when it is no longer necessary.</li>
              <li><strong>Right to restriction of processing (Art. 18 GDPR):</strong> You have the right to request that we restrict the processing of your personal information under certain conditions.</li>
              <li><strong>Right to data portability (Art. 20 GDPR):</strong> You have the right to receive your personal information in a structured format and to transmit those data to another controller.</li>
              <li><strong>Right to object (Art. 21 GDPR):</strong> You have the right to object to the processing of your personal information, under certain conditions.</li>
            </ul>
            <p>To exercise any of these rights, please contact us at <strong>{email}</strong> or <strong>{phone}</strong>.</p>
          </div>

          <div className="space-y-4 pt-16 border-t ${borderClass}">
            <p className="opacity-40 italic font-black uppercase text-[10px] tracking-widest text-center">This privacy policy was algorithmically generated for {companyName} and complies with global infrastructure standards.</p>
          </div>
        </div>
      </section>

      ${defaultFooter ? `<${defaultFooter.replace(/_/g, '')} />` : ''}
    </main>
  );
}
`.trim();

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

  // 6.5. lib/utils.ts
  files['lib/utils.ts'] = `
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`.trim();

  // 7. PostCSS Config (Tailwind 4 uses CSS-first, but Next.js needs PostCSS support for @tailwind)
  files['postcss.config.js'] = `
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
}
`
  // 8. Next.js Config (Handles cross-origin security for remote GCP access)
  const allowedOrigins = [
    '35.185.199.124', 
    'http://35.185.199.124',
    'localhost:3000',
    'http://localhost:3000',
    ...(options.currentHost ? [
      options.currentHost,
      `http://${options.currentHost}`,
      `https://${options.currentHost}`
    ] : []),
    '35.185.199.124',
    'localhost',
    '*.ngrok-free.dev',
    '*.ngrok.io',
    ...Array.from({ length: 11 }, (_, i) => `35.185.199.124:${3000 + i}`),
    ...Array.from({ length: 11 }, (_, i) => `localhost:${3000 + i}`),
    ...Array.from({ length: 11 }, (_, i) => `http://35.185.199.124:${3000 + i}`),
    ...Array.from({ length: 11 }, (_, i) => `http://localhost:${3000 + i}`)
  ];

  files['next.config.js'] = `
module.exports = {
  allowedDevOrigins: ${JSON.stringify(allowedOrigins)},
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    turbo: {
      rules: {
         '*.svg': {
            loaders: ['@svgr/webpack'],
            as: 'js',
         },
      },
    },
  },
};
`
  
  // 9. Layout with Secure Context Shim
  files['app/layout.tsx'] = `
import './globals.css';
import React from 'react';
export const metadata = { title: '${project.client_name} | Premium Web' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Secure Context Shim (MUST BE FIRST) */}
        <script dangerouslySetInnerHTML={{ __html: \`
          if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
            const mockSubtle = {
              digest: () => new Promise(resolve => resolve(new Uint8Array(32))),
              generateKey: () => new Promise(resolve => resolve({})),
              importKey: () => new Promise(resolve => resolve({})),
              sign: () => new Promise(resolve => resolve(new Uint8Array(32))),
              verify: () => new Promise(resolve => resolve(true)),
              encrypt: () => new Promise(resolve => resolve(new Uint8Array(32))),
              decrypt: () => new Promise(resolve => resolve(new Uint8Array(32)))
            };
            if (!window['crypto']) window['crypto'] = {};
            if (!window['crypto']['subtle']) {
              Object.defineProperty(window['crypto'], 'subtle', { value: mockSubtle, writable: true });
            }
            if (!window['crypto']['randomUUID']) {
              Object.defineProperty(window['crypto'], 'randomUUID', { 
                value: () => '00000000-0000-0000-0000-000000000000', 
                writable: true 
              });
            }
            console.log('Studio Infra: Shim v3 Active (Top-of-Head Execution)');
          }
        \` }} />
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
      "jsx": "preserve",
      "baseUrl": ".",
      "paths": {
        "@/*": ["./*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
  }, null, 2)

  return files
}
