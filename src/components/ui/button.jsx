import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * @typedef {import('react').ComponentPropsWithoutRef<'button'> & {
 *   variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
 *   size?: 'default' | 'sm' | 'lg' | 'icon';
 *   asChild?: boolean;
 * }} ButtonProps
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Azul moderno
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 active:bg-primary/80",
        
        // Secundário - Cinza
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70",
        
        // Destrutivo - Vermelho
        destructive:
          "bg-error text-error-fg shadow-md hover:shadow-lg hover:bg-error/90 active:bg-error/80",
        
        // Outline - Bordado
        outline:
          "border-2 border-primary bg-background text-primary hover:bg-primary/5 active:bg-primary/10",
        
        // Ghost - Transparente
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        
        // Link - Sem fundo
        link:
          "text-primary underline-offset-4 hover:underline active:text-primary/80",
        
        // Success - Verde
        success:
          "bg-success text-success-fg shadow-md hover:shadow-lg hover:bg-success/90 active:bg-success/80",
        
        // Warning - Âmbar
        warning:
          "bg-warning text-warning-fg shadow-md hover:shadow-lg hover:bg-warning/90 active:bg-warning/80",
      },
      
      size: {
        // Xs - Pequeno
        xs: "h-8 px-2 rounded-md text-xs",
        
        // Sm - Pequeno
        sm: "h-9 px-3 rounded-lg text-sm",
        
        // Md - Padrão
        md: "h-11 px-4 rounded-lg text-base",
        
        // Lg - Grande (44px min touch)
        lg: "h-12 px-6 rounded-lg text-base",
        
        // Xl - Extra grande
        xl: "h-14 px-8 rounded-lg text-lg",
        
        // Icon - Quadrado
        icon: "h-10 w-10 rounded-lg",
        
        // Icon-lg - Quadrado grande
        "icon-lg": "h-12 w-12 rounded-lg",
        
        // Full - Largura total (mobile)
        full: "w-full h-12 rounded-lg",
      },
    },
    
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

/** @type {React.ForwardRefRenderFunction<HTMLButtonElement, ButtonProps>} */
const ButtonImpl = ({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}

const Button = React.forwardRef(ButtonImpl)
Button.displayName = "Button"

export { Button, buttonVariants }