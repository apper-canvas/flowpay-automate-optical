import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Badge = forwardRef(({ 
  children, 
  variant = "default", 
  size = "sm",
  className = "", 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full"
  
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-info/10 text-info",
    primary: "bg-primary/10 text-primary"
  }
  
  const sizes = {
    xs: "text-xs px-2 py-1",
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-3 py-2"
  }
  
  return (
    <span
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = "Badge"

export default Badge