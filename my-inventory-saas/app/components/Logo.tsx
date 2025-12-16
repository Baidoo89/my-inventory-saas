import React from 'react';

export const Logo = ({ className = "", size = 32, textClassName = "" }: { className?: string, size?: number, textClassName?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-indigo-600"
        >
          {/* Background */}
          <rect width="40" height="40" rx="10" fill="currentColor" />
          
          {/* SF Monogram */}
          <path 
            d="M12 14C12 11.5 14 10 16.5 10H20C22.5 10 24 11.5 24 14C24 16.5 22 17 20 17H16C14 17 12 17.5 12 20C12 22.5 14 24 16.5 24H20" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M28 10H24V24" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M24 17H27" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className={`font-bold tracking-tight ${textClassName || 'text-slate-900'}`} style={{ fontSize: size * 0.8 }}>
        SmartStock
      </span>
    </div>
  );
};
