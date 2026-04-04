'use client'

import React from 'react'
import { StudioProvider } from '../studio/context/studio-provider'
import { StudioShell } from '../studio/studio-shell'

interface WebsiteBuilderConfiguratorProps {
  projectId: string
  initialConfig?: any
  project?: any
}

/**
 * Studio Architect v3.0 Wrapper
 * Transferred from legacy monolithic configurator to modular Studio architecture.
 */
export function WebsiteBuilderConfigurator({ 
  projectId, 
  initialConfig, 
  project 
}: WebsiteBuilderConfiguratorProps) {
  return (
    <StudioProvider 
      projectId={projectId} 
      initialConfig={initialConfig} 
      project={project}
    >
      <StudioShell />
    </StudioProvider>
  )
}
