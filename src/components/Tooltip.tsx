import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delayMs?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  delayMs = 100
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delayMs);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  // Position coordinates & arrow orientation
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent border-t-4 border-x-4',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent border-b-4 border-x-4',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent border-l-4 border-y-4',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent border-r-4 border-y-4'
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && (
        <div 
          role="tooltip"
          className={`absolute z-50 pointer-events-none transition-all duration-200 ease-out animate-fade-in ${positionClasses[position]}`}
        >
          <div className="relative px-2.5 py-1.5 text-xs font-semibold text-white bg-gray-900/95 border border-blue-500/30 rounded-lg shadow-xl shadow-black/50 backdrop-blur-md whitespace-nowrap flex items-center gap-1.5 select-none">
            {content}
            {/* Arrow pointer */}
            <span className={`absolute w-0 h-0 border-solid ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
};
