'use client'

import { useFormStatus } from 'react-dom'
import { Button } from './button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: any
  size?: any
  asChild?: boolean
}

export function PendingButton({ 
  children, 
  loading, 
  className, 
  disabled,
  ...props 
}: PendingButtonProps) {
  const { pending } = useFormStatus()
  const isPending = pending || loading

  return (
    <Button 
      disabled={isPending || disabled} 
      className={cn(className, isPending && "cursor-not-allowed opacity-70")}
      {...(props as any)}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
