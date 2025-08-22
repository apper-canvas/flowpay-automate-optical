import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Card = forwardRef(({ 
  children, 
  className = "", 
  variant = "default",
  padding = "default",
  ...props 
}, ref) => {
  const baseStyles = "bg-surface rounded-xl shadow-sm border border-gray-100 transition-all duration-200"
  
const variants = {
    default: "hover:shadow-md",
    gradient: "bg-gradient-to-br from-primary via-secondary to-primary text-white shadow-lg hover:shadow-xl",
    glass: "bg-white/25 backdrop-blur-[10px] border-white/18",
    elevated: "shadow-lg hover:shadow-xl",
clickable: "hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
    warning: "bg-gradient-to-r from-warning to-yellow-500 text-white shadow-lg hover:shadow-xl",
    alert: "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl"
  }
  
  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8"
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = "Card"

export default Card