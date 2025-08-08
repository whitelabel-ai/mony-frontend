'use client'

import { Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from './button'

interface WIPPlaceholderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  backLink?: string
  backText?: string
}

export function WIPPlaceholder({
  title,
  description = "Esta funcionalidad está en desarrollo y estará disponible pronto.",
  icon,
  backLink = "/dashboard",
  backText = "Volver al Dashboard"
}: WIPPlaceholderProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 p-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative bg-card border-2 border-dashed border-primary/30 rounded-full p-8">
          {icon || <Construction className="h-16 w-16 text-primary" />}
        </div>
      </div>
      
      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {description}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button asChild variant="default" size="lg">
          <Link href={backLink} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backText}
          </Link>
        </Button>
        
        <Button variant="outline" size="lg" disabled>
          <Construction className="h-4 w-4 mr-2" />
          En Desarrollo
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/20">
        <p className="text-sm text-muted-foreground">
          💡 <strong>¿Tienes sugerencias?</strong> Nos encantaría conocer tus ideas para mejorar esta funcionalidad.
        </p>
      </div>
    </div>
  )
}

export default WIPPlaceholder