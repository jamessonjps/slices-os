import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/** @typedef {import('react').ComponentPropsWithoutRef<'label'>} LabelProps */

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/** @type {React.ForwardRefRenderFunction<HTMLLabelElement, LabelProps>} */
const LabelImpl = ({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
)

const Label = React.forwardRef(LabelImpl)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
