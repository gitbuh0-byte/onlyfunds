import React from "react";

export function OnlyFundsIcon({ 
  className = "w-8 h-8", 
  spinning = false 
}: { 
  className?: string; 
  spinning?: boolean;
}) {
  return (
    <div className="relative group inline-block">
      <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-all duration-300" />
      <svg 
        className={`${className} relative z-10 transform ${
          spinning 
            ? "animate-[spin_2s_linear_infinite]" 
            : "group-hover:rotate-[360deg] group-hover/logo:rotate-[360deg] transition-transform duration-1000 ease-in-out"
        }`}
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ofIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        
        {/* We rotate 4 symmetrical interlocking lobes around the center to match the uploaded image perfectly */}
        <g stroke="url(#ofIconGrad)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Lobe 1 */}
          <path d="M 50 40 C 50 21, 73 21, 73 40 C 73 59, 50 59, 50 50" transform="rotate(45 50 50)" />
          {/* Lobe 2 */}
          <path d="M 50 40 C 50 21, 73 21, 73 40 C 73 59, 50 59, 50 50" transform="rotate(135 50 50)" />
          {/* Lobe 3 */}
          <path d="M 50 40 C 50 21, 73 21, 73 40 C 73 59, 50 59, 50 50" transform="rotate(225 50 50)" />
          {/* Lobe 4 */}
          <path d="M 50 40 C 50 21, 73 21, 73 40 C 73 59, 50 59, 50 50" transform="rotate(315 50 50)" />
        </g>

        {/* Solid center dot */}
        <circle cx="50" cy="50" r="10.5" fill="url(#ofIconGrad)" />
      </svg>
    </div>
  );
}

export function OnlyFundsLogo({ 
  className = "", 
  iconClassName = "w-8 h-8", 
  textClassName = "",
  spinning = false
}: { 
  className?: string; 
  iconClassName?: string; 
  textClassName?: string; 
  spinning?: boolean;
}) {
  return (
    <div className={`flex items-center space-x-2.5 select-none group/logo ${className}`}>
      <OnlyFundsIcon className={iconClassName} spinning={spinning} />
      <span className={`text-xl font-black tracking-tight text-zinc-950 dark:text-white font-display ${textClassName}`}>
        Only<span className="text-emerald-500 dark:text-emerald-400">Funds</span>
      </span>
    </div>
  );
}

