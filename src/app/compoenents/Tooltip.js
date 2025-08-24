'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

const Tooltip = ({ 
  children, 
  content, 
  title, 
  placement = 'top', 
  showIcon = true, 
  iconSize = 16,
  className = '',
  delay = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const getTooltipClasses = () => {
    const baseClasses = "absolute z-50 px-4 py-3 text-sm bg-gray-900 text-white rounded-lg shadow-lg max-w-2xl w-80 whitespace-normal transition-opacity duration-200 leading-relaxed";
    
    switch (placement) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    switch (placement) {
      case 'top':
        return "absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900";
      case 'bottom':
        return "absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900";
      case 'left':
        return "absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900";
      case 'right':
        return "absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900";
      default:
        return "absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900";
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="flex items-center cursor-help"
      >
        {children}
        {showIcon && (
          <Info 
            size={iconSize} 
            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors" 
          />
        )}
      </div>
      
      {isVisible && (
        <div className={getTooltipClasses()}>
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div>{content}</div>
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;