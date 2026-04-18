import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  const { id, path } = await params
  const supabase = createAdminClient()

  // 1. Resolve Port from DB
  const { data: project, error } = await supabase
    .from('projects')
    .select('dev_config')
    .eq('id', id)
    .single()

  if (error || !project) {
    return new NextResponse('Project preview not found', { status: 404 })
  }

  const devConfig = Array.isArray(project.dev_config) ? project.dev_config[0] : project.dev_config
  const port = devConfig?.port

  if (!port) {
    return new NextResponse('Preview Node is not active. Launch it from the dashboard.', { status: 503 })
  }

  // 2. Construct Target URL
  // The preview app has basePath: /preview/[id]
  const subPath = path ? (Array.isArray(path) ? path.join('/') : path) : ''
  const targetUrl = `http://localhost:${port}/preview/${id}/${subPath}${request.nextUrl.search}`

  console.log(`[Proxy]: ${request.method} ${request.nextUrl.pathname} -> ${targetUrl}`)

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Accept': request.headers.get('Accept') || '',
        'User-Agent': request.headers.get('User-Agent') || '',
      },
      // Pass through cache settings for static assets
      cache: 'no-store'
    })

    const body = await response.blob()

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        'Cache-Control': response.headers.get('Cache-Control') || 'no-store',
      }
    })
  } catch (err: any) {
    console.error(`[Proxy ERR]: Failed to reach preview node on port ${port}`, err.message)
    return new NextResponse('Preview Node is offline or unreachable.', { status: 502 })
  }
}

// Support other methods if needed (POST for forms, etc)
export const POST = GET
