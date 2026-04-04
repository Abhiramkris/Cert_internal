'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import JSZip from 'jszip'
import fs from 'fs/promises'
import path from 'path'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'
import { promptAI, generateSystemPrompt } from '@/utils/ai/ai-client'

export async function saveSeoConfig(projectId: string, seo: any) {
  const supabase = await createClient()
  
  const { data: project } = await supabase.from('projects').select('config').eq('id', projectId).single()
  const config = project?.config || {}
  
  const { error } = await supabase
    .from('projects')
    .update({
      config: {
        ...config,
        seo: {
          website_title: seo.website_title,
          meta_description: seo.meta_description,
          target_keywords: seo.target_keywords
        }
      }
    })
    .eq('id', projectId)

  if (error) {
    console.error('Failed to save SEO config:', error)
    throw new Error('Failed to save SEO configuration')
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function saveWebsiteConfig(projectId: string, builder: any) {
  const supabase = await createClient()

  const { data: project } = await supabase.from('projects').select('config').eq('id', projectId).single()
  const config = project?.config || {}
  
  const { error } = await supabase
    .from('projects')
    .update({
      config: {
        ...config,
        builder: {
          global_styles: builder.global_styles,
          selected_components: builder.selected_components,
          content_overrides: builder.content_overrides,
          component_settings: builder.component_settings
        }
      }
    })
    .eq('id', projectId)

  if (error) {
    console.error('Failed to save website config:', error)
    throw new Error('Failed to save configuration')
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function generateAiContentForComponent(projectId: string, componentKey: string) {
  const supabase = await createClient()

  // 1. Fetch Project Global Context
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) {
    throw new Error('Project not found')
  }

  const globalStyles = project.config?.builder?.global_styles || {}
  const seo = project.config?.seo || {}
  const builderConfig = project.config?.builder || {}

  // 2. Fetch Reference Template (Supports partial key matching if needed)
  const templateKey = componentKey.toUpperCase()
  const template = (COMPONENT_TEMPLATES as any)[templateKey]

  if (!template) {
    throw new Error(`AI Template for ${componentKey} not found in modular registry.`)
  }

  // 3. Construct Prompts
  const systemPrompt = generateSystemPrompt({
    client_name: project.client_name,
    description: project.description,
    seo: seo,
    styles: globalStyles
  })

  const userPrompt = `
Generate architectural content and settings for the ${template.name} component.
Role: ${template.prompt_context}
Aesthetic Cues: ${template.image_hints}

CONTENT BLUEPRINT (User Data):
${JSON.stringify(template.content_schema, null, 2)}

SETTINGS BLUEPRINT (Technical Controls):
${JSON.stringify(template.settings_schema || template.component_settings, null, 2)}

In your JSON response, the "content" object must strictly match the CONTENT BLUEPRINT.
The "settings" object must strictly match the technical keys defined in the SETTINGS BLUEPRINT (using appropriate values for 'select', 'range', or 'boolean' fields).
`

  // 4. Call AI (OpenRouter / DeepSeek-R1)
  try {
    const aiResponse = await promptAI(userPrompt, systemPrompt)

    // 5. Update Project Config
    const updatedConfig = {
      ...project.config,
      builder: {
        ...builderConfig,
        content_overrides: {
          ...(builderConfig.content_overrides || {}),
          ...aiResponse.content // This now correctly handles objects and arrays from the AI
        },
        component_settings: {
          ...(builderConfig.component_settings || {}),
          [componentKey]: {
            ...(builderConfig.component_settings?.[componentKey] || {}),
            ...aiResponse.settings
          }
        }
      }
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({ config: updatedConfig })
      .eq('id', projectId)

    if (updateError) throw new Error(`Failed to update project config: ${updateError.message}`)

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true, message: `Successfully generated content for ${template.name}`, data: aiResponse }

  } catch (err: any) {
    console.error('AI Generation Failed:', err)
    throw new Error(`AI Generation Failed: ${err.message}`)
  }
}

export async function generateAiWebsiteContent(projectId: string, config: any) {
  const supabase = await createClient()
  
  // 1. Fetch Project Details
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) {
    throw new Error('Project not found')
  }

  const { selected_components, global_styles } = config
  if (!selected_components || selected_components.length === 0) {
    throw new Error('No components selected for generation')
  }

  // 2. Construct Massive Prompt for All Components
  const systemPrompt = generateSystemPrompt({
    client_name: project.client_name,
    description: project.description,
    styles: global_styles
  })

  let componentsDescription = ""
  selected_components.forEach((key: string) => {
    const template = (COMPONENT_TEMPLATES as any)[key]
    if (template) {
       componentsDescription += `
--- COMPONENT: ${key} ---
Name: ${template.name}
Role: ${template.prompt_context}
Schema: ${JSON.stringify(template.content_schema)}
Settings: ${JSON.stringify(template.component_settings)}
`
    }
  })

  const userPrompt = `
Generate a unified architectural projection for the following components.
Components Strategy:
${componentsDescription}

Return a SINGLE JSON object:
- "content": An aggregated object containing the projected values for each component's content_schema.
- "settings": A keyed object by component ID, providing the technical tuning values for their settings_schema.
`

  // 3. Call AI (OpenRouter / DeepSeek-R1)
  try {
    const aiResponse = await promptAI(userPrompt, systemPrompt)

    // 4. Update Project Config
    const updatedConfig = {
      ...project.config,
      builder: {
        ...project.config?.builder,
        content_overrides: {
          ...(project.config?.builder?.content_overrides || {}),
          ...aiResponse.content
        },
        component_settings: {
          ...(project.config?.builder?.component_settings || {}),
          ...aiResponse.settings
        }
      }
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({ config: updatedConfig })
      .eq('id', projectId)

    if (updateError) throw new Error(`Failed to update project config: ${updateError.message}`)

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { 
      success: true, 
      message: "Website intelligence projected successfully", 
      data: aiResponse 
    }
  } catch (err: any) {
    console.error('Global AI Generation Failed:', err)
    throw new Error(`Global AI Generation Failed: ${err.message}`)
  }
}

export async function generateProjectZip(projectId: string) {
  const supabase = await createClient()
  
  // 1. Fetch Project Details (Config is now embedded)
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error('Project not found')
  const config = project.config?.builder
  if (!config) throw new Error('Builder configuration not found')

  const zip = new JSZip()
  const styles = config.global_styles
  const content = {
    h1: project.client_name,
    description: project.description,
    ...config.content_overrides
  }

  // 2. Create Project Structure
  zip.file('package.json', JSON.stringify({
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
  }, null, 2))

  // 2.5 Generate Data Config
  zip.file('data/config.json', JSON.stringify({
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
    settings: config.component_settings || {}
  }, null, 2))

  // 4. Generate Legal Pages
  const privacyCode = `
import React from 'react';
import config from '../../data/config.json';

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto py-24 px-8 font-sans">
      <h1 className="text-4xl font-black mb-12 italic tracking-tight">Privacy Policy</h1>
      <div className="space-y-8 text-zinc-600 leading-relaxed font-medium">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900">1. Data Collection</h2>
          <p>We collect minimal data necessary to provide our services. This includes contact information provided via forms.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900">2. Contact Us</h2>
          <p>For any privacy concerns, reach out at:</p>
          <ul className="list-none space-y-2 text-zinc-900 font-bold">
            <li>Email: {config.content.email || 'hello@agency.com'}</li>
            <li>Phone: {config.content.phone || 'N/A'}</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
  `

  const termsCode = `
import React from 'react';
import config from '../../data/config.json';

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto py-24 px-8 font-sans">
      <h1 className="text-4xl font-black mb-12 italic tracking-tight">Terms of Service</h1>
      <div className="space-y-8 text-zinc-600 leading-relaxed font-medium">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900">1. Agreement</h2>
          <p>By using this site, you agree to our terms of service and professional standards.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900">2. Contact Information</h2>
          <p>Please contact us for any legal inquiries:</p>
          <ul className="list-none space-y-2 text-zinc-900 font-bold">
            <li>Email: {config.content.email || 'hello@agency.com'}</li>
            <li>Phone: {config.content.phone || 'N/A'}</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
  `

  zip.file('app/privacy/page.tsx', privacyCode)
  zip.file('app/terms/page.tsx', termsCode)

  // 4.5 Include Assets
  try {
    const assetsFolder = zip.folder('public/assets')
    const placeholderBuffer = await fs.readFile(path.join(process.cwd(), 'public/assets/hero-placeholder.png'))
    assetsFolder?.file('hero-placeholder.png', placeholderBuffer)
  } catch (err) {
    console.warn('Assets folder or placeholder image not found, skipping inclusion.')
  }

  // 3. Generate Components
  const componentsFolder = zip.folder('components')
  const rawSelectedKeys = config.selected_components || []
  
  // Filter only keys that actually have templates
  const selectedKeys = rawSelectedKeys.filter((key: string) => (COMPONENT_TEMPLATES as any)[key])
  
  selectedKeys.forEach((key: string) => {
    const template = (COMPONENT_TEMPLATES as any)[key]
    if (template) {
      componentsFolder?.file(`${key.toLowerCase().replace(/_/g, '-')}.tsx`, template.code(styles, content))
    }
  })

  // 4. Generate Page
  const pageCode = `
import React from 'react';
import config from '../data/config.json';
${selectedKeys.map((key: string) => `import ${key.replace(/_/g, '')} from '../components/${key.toLowerCase().replace(/_/g, '-')}';`).join('\n')}

export default function Home() {
  return (
    <main style={{ fontFamily: config.styles.font_family || 'sans-serif' }}>
      ${selectedKeys.map((key: string) => `<${key.replace(/_/g, '')} />`).join('\n      ')}
    </main>
  );
}
  `
  zip.file('app/page.tsx', pageCode)

  // 5. Generate Layout & CSS
  zip.file('app/layout.tsx', `
import './globals.css';
import React from 'react';
export const metadata = { title: '${project.client_name} | Premium Web' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased text-zinc-900 bg-white">
        {children}
      </body>
    </html>
  );
}
  `)

  zip.file('app/globals.css', `
@import "tailwindcss";

@theme {
  --color-primary: ${styles.primary_color || '#000000'};
  --color-accent: ${styles.accent_color || '#3b82f6'};
}

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: ${styles.font_family_body || 'sans-serif'};
}

@layer components {
  .btn-primary {
    @apply rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2;
    
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
    @apply rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 hover:bg-zinc-50 border border-zinc-200 text-zinc-900;
    
    /* Padding */
    ${styles.button_padding === 'compact' ? 'padding: 0.75rem 1.75rem;' : ''}
    ${styles.button_padding === 'standard' ? 'padding: 1rem 2.5rem;' : ''}
    ${styles.button_padding === 'large' ? 'padding: 1.5rem 3.5rem;' : ''}
  }
}
  `)

  // 6. Generate Tailwind & PostCSS Config
  zip.file('tailwind.config.js', `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${styles.primary_color || '#000000'}",
        accent: "${styles.accent_color || '#3b82f6'}",
      },
      borderRadius: {
        "xl": "${styles.border_radius === 'xl' ? '1.5rem' : '0.5rem'}",
      }
    },
  },
  plugins: [],
}
  `)

  zip.file('postcss.config.js', `
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
}
  `)

  // 6. Generate Base64 for download
  const content64 = await zip.generateAsync({ type: 'base64' })
  return { success: true, fileName: `${project.client_name.replace(/\s+/g, '_')}_Project.zip`, data: content64 }
}
