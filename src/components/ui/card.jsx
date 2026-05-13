import * as React from "react"

import { cn } from "@/lib/utils"

/** @typedef {import('react').ComponentPropsWithoutRef<'div'>} DivProps */

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, DivProps>} */
const CardImpl = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200", className)}
    {...props} />
)
const Card = React.forwardRef(CardImpl)
Card.displayName = "Card"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, DivProps>} */
const CardHeaderImpl = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-4 md:p-6", className)}
    {...props} />
)
const CardHeader = React.forwardRef(CardHeaderImpl)
CardHeader.displayName = "CardHeader"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, DivProps>} */
const CardTitleImpl = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold text-lg leading-tight tracking-tight", className)}
    {...props} />
)
const CardTitle = React.forwardRef(CardTitleImpl)
CardTitle.displayName = "CardTitle"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, DivProps>} */
const CardDescriptionImpl = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
)
const CardDescription = React.forwardRef(CardDescriptionImpl)
CardDescription.displayName = "CardDescription"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, DivProps>} */
const CardContentImpl = ({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 md:p-6 pt-0", className)} {...props} />
)
const CardContent = React.forwardRef(CardContentImpl)
CardContent.displayName = "CardContent"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, DivProps>} */
const CardFooterImpl = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col sm:flex-row gap-2 items-center p-4 md:p-6 pt-0", className)}
    {...props} />
)
const CardFooter = React.forwardRef(CardFooterImpl)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
