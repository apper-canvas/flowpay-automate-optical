import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Input = forwardRef(({ 
  className = "", 
  type = "text",
  label,
  error,
  size = "md",
  ...props 
}, ref) => {
const sizes = {
    sm: "h-10 px-3 py-2 text-sm",
    md: "h-12 px-4 py-3 text-sm", 
    lg: "h-14 px-5 py-4 text-base",
    xl: "h-16 px-6 py-5 text-lg"
  }
  
  const baseStyles = "flex w-full rounded-xl border border-gray-200 bg-surface placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
  
  const inputStyles = `${baseStyles} ${sizes[size]}`
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          inputStyles,
          error && "border-error focus:border-error focus:ring-error/20",
          className
        )}
        ref={ref}
        {...props}
      />
{error && (
        <p className="text-sm text-error font-medium">{error}</p>
      )}
    </div>
  )
})

Input.displayName = "Input"

export default Input