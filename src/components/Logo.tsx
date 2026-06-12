import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export default function Logo({ className = '', showTagline = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none h-[50px] ${className}`} id="brand-logo-container">
      {/* Sage rounded squircle icon container with code/script symbol inside */}
      <div 
        className="w-[38px] h-[38px] bg-sage rounded-xl flex items-center justify-center text-cream shadow-xs flex-shrink-0"
        id="brand-logo-icon"
      >
        <svg 
          viewBox="0 0 24 24" 
          className="w-5 h-5 stroke-cream" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      </div>

      {/* Brand typography layout matching the requested Palette Pro style */}
      <div className="flex flex-col justify-center" id="brand-logo-text-block">
        <div className="flex items-baseline font-sans text-sm sm:text-base md:text-[17px] tracking-normal leading-none font-bold">
          <span className="font-black text-charcoal uppercase tracking-wider">
            illustrator script
          </span>
          <span className="font-light text-sage uppercase tracking-wider ml-1.5">
            pro
          </span>
        </div>
        {showTagline && (
          <span 
            className="text-[7.5px] md:text-[8.5px] tracking-[0.2em] text-sage/90 uppercase font-sans mt-1 font-bold whitespace-nowrap"
            id="brand-logo-tagline"
          >
            AUTOMAZIONE &amp; UNIONE DATI
          </span>
        )}
      </div>
    </div>
  );
}
