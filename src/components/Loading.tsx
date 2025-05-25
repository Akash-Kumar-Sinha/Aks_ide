import React from "react";

interface LoadingProps {
  size?: number;
  loadingMessage?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size, 
  loadingMessage = "Loading...", 
  variant = 'dots',
  className = ""
}) => {

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50" 
                 style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50" 
                 style={{ animationDelay: '0.2s' }}></div>
          </div>
        );

      case 'pulse':
        return (
          <div className="relative">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-12 h-12 bg-purple-500 rounded-full animate-pulse opacity-75 shadow-lg shadow-purple-500/50"></div>
            <div className="absolute inset-2 w-8 h-8 bg-purple-600 rounded-full shadow-inner"></div>
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-end space-x-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-2 bg-purple-500 rounded-t animate-pulse shadow-lg shadow-purple-500/30"
                style={{ 
                  height: `${16 + (i % 3) * 8}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              ></div>
            ))}
          </div>
        );

      case 'spinner':
      default:
        return (
          <div
            className={`animate-spin rounded-full border-t-4 border-purple-500 border-solid border-opacity-75 shadow-lg ${
              size ? "" : "h-24 w-24"
            }`}
            style={size ? { height: `${size}px`, width: `${size}px` } : undefined}
          ></div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Loading Animation */}
      {renderSpinner()}

      {/* Loading Message */}
      {loadingMessage && (
        <div className="text-center space-y-2">
          <p className="text-zinc-300 font-medium text-sm animate-pulse">
            {loadingMessage}
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" 
                 style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" 
                 style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loading;