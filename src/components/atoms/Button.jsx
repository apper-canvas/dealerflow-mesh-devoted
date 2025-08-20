import React, { forwardRef } from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transform hover:scale-105 focus-visible:ring-primary-600',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md focus-visible:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg focus-visible:ring-red-600',
    ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
    link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus-visible:ring-primary-600'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-md', 
    lg: 'px-6 py-3 text-base rounded-lg'
  }
  
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'cursor-wait',
        className
      )}
      {...props}
    >
      {loading ? (
        <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
      ) : icon && iconPosition === 'left' ? (
        <ApperIcon name={icon} size={16} className="mr-2" />
      ) : null}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon name={icon} size={16} className="ml-2" />
      )}
    </button>
  )
});

Button.displayName = 'Button';

export default Button;