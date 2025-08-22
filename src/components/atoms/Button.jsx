import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl active:scale-[0.98]",
    secondary: "bg-surface text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
accent: "bg-gradient-to-r from-accent to-orange-500 text-white shadow-lg hover:shadow-xl active:scale-[0.98]",
    success: "bg-gradient-to-r from-success to-green-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]",
    info: "bg-gradient-to-r from-info to-blue-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]",
warning: "bg-gradient-to-r from-warning to-yellow-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]",
    danger: "bg-gradient-to-r from-error to-red-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]",
    destructive: "bg-gradient-to-r from-error to-red-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
  }
  const sizes = {
    sm: "text-sm px-3 py-2 rounded-lg",
    md: "text-sm px-4 py-2.5 rounded-xl",
    lg: "text-base px-6 py-3 rounded-xl",
    xl: "text-lg px-8 py-4 rounded-2xl"
  }
  
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
})

Button.displayName = "Button"

export default Button