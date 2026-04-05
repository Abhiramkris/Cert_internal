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

import { assembleProjectFiles } from '@/utils/builder/project-assembly'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import treeKill from 'tree-kill'

const execAsync = promisify(exec)

// Global store for active preview processes
const activePreviews: Record<string, any> = {}

async function killExistingPreview(projectId: string) {
  if (activePreviews[projectId]) {
    return new Promise<void>((resolve) => {
      const pid = activePreviews[projectId].pid
      if (pid) {
        console.log(`[Preview ${projectId}]: Terminating existing process tree ${pid}...`)
        treeKill(pid, 'SIGKILL', (err) => {
          if (err) console.warn(`[Preview ${projectId}]: Kill error:`, err)
          delete activePreviews[projectId]
          // Small grace period for port release
          setTimeout(resolve, 500)
        })
      } else {
        delete activePreviews[projectId]
        resolve()
      }
    })
  }
}

export async function generateProjectZip(projectId: string) {
  const supabase = await createClient()
  
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error('Project not found')
  const config = project.config?.builder
  if (!config) throw new Error('Builder configuration not found')

  const zip = new JSZip()
  const files = assembleProjectFiles(project, config)

  // Add files to ZIP
  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content)
  })

  // Include Assets (if possible)
  try {
    const placeholderBuffer = await fs.readFile(path.join(process.cwd(), 'public/assets/hero-placeholder.png'))
    zip.folder('public/assets')?.file('hero-placeholder.png', placeholderBuffer)
  } catch (err) {
    console.warn('Hero placeholder not found')
  }

  const content64 = await zip.generateAsync({ type: 'base64' })
  return { 
    success: true, 
    fileName: `${project.client_name.replace(/\s+/g, '_')}_Project.zip`, 
    data: content64 
  }
}

async function purgeDirectory(dir: string) {
  try {
    const entries = await fs.readdir(dir)
    for (const entry of entries) {
      if (entry === 'node_modules') continue
      const fullPath = path.join(dir, entry)
      await fs.rm(fullPath, { recursive: true, force: true })
    }
  } catch (e) {
    // If directory doesn't exist, ignore
  }
}

export async function previewProject(projectId: string) {
  const supabase = await createClient()
  
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error('Project not found')
  const config = project.config?.builder
  if (!config) throw new Error('Builder configuration not found')

  const previewDir = path.join(process.cwd(), 'tmp/previews', projectId)
  
  // 1. Cleanup existing process tree
  await killExistingPreview(projectId)

  // 2. Zero-Cache Purge (Keep node_modules)
  console.log(`[Preview ${projectId}]: Purging stale cache...`)
  await purgeDirectory(previewDir)
  await fs.mkdir(previewDir, { recursive: true })

  // 3. Assemble and Write Files
  const files = assembleProjectFiles(project, config)

  // 3. Atomic File Write
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(previewDir, filePath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    
    // For app/page.tsx, we append a timestamp to force HMR if reusing modules
    if (filePath === 'app/page.tsx') {
      const timestampComment = `\n\n// Studio Sync: ${new Date().toISOString()}\n`
      await fs.writeFile(fullPath, content + timestampComment)
    } else {
      await fs.writeFile(fullPath, content)
    }
  }

  // 4. Force data config fresh
  const configPath = path.join(previewDir, 'data/config.json')
  await fs.utimes(configPath, new Date(), new Date())

  // 5. Build/Run Lifecycle
  try {
     const hasModules = await fs.access(path.join(previewDir, 'node_modules')).then(() => true).catch(() => false)
     if (!hasModules) {
        toastServerSide(projectId, "Initializing build environment (npm install)...")
        await execAsync('npm install', { cwd: previewDir })
     }

     console.log(`[Preview ${projectId}]: Launching Live Preview Node...`)
     
     // Spawn the server and pipe logs for Docker observability
     const child = spawn('npm', ['run', 'dev', '--', '-p', '3001'], { 
       cwd: previewDir,
       env: { ...process.env, NODE_ENV: 'development' }
     })

     child.stdout?.on('data', (data) => {
       console.log(`[Preview ${projectId}]: ${data.toString().trim()}`)
     })

     child.stderr?.on('data', (data) => {
       console.error(`[Preview ${projectId} ERR]: ${data.toString().trim()}`)
     })

     activePreviews[projectId] = child

     const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:6565'
     const publicUrl = siteUrl.replace(/:\d+$/, '').replace(/\/$/, '') + ':3001'

     return { 
        success: true, 
        url: publicUrl,
        message: 'Preview Node synchronized successfully'
     }
  } catch (err: any) {
    console.error('Preview Sync Failed:', err)
    throw new Error(`Preview Sync Failed: ${err.message}`)
  }
}

function toastServerSide(projectId: string, message: string) {
    console.log(`[Preview ${projectId}]: ${message}`)
}


