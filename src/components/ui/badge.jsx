import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/** @typedef {{
 *   variant?: 'default' | 'secondary' | 'destructive' | 'outline';
 * } & import('react').ComponentPropsWithoutRef<'div'>} BadgeProps */

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        // Primário - Azul
        default:
          "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
        
        // Secundário - Cinza
        secondary:
          "border border-muted bg-muted text-muted-foreground hover:bg-muted/80",
        
        // Destrutivo/Erro - Vermelho
        destructive:
          "border border-error/30 bg-error/10 text-error hover:bg-error/20",
        
        // Sucesso - Verde
        success:
          "border border-success/30 bg-success/10 text-success hover:bg-success/20",
        
        // Aviso/Warning - Âmbar
        warning:
          "border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20",
        
        // Info - Azul claro
        info:
          "border border-info/30 bg-info/10 text-info hover:bg-info/20",
        
        // Outline - Bordado
        outline:
          "border border-foreground/30 bg-transparent text-foreground hover:bg-foreground/5",
      },
      
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

/** @param {BadgeProps} props */
function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
