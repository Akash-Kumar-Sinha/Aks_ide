import React from "react";

interface LoadingProps {
  size?: number;
}
const Loading: React.FC<LoadingProps> = ({ size }) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-t-4 border-blue-500 border-solid border-opacity-75 shadow-lg ${
          size ? "" : "h-24 w-24"
        }`}
        style={size ? { height: `${size}px`, width: `${size}px` } : undefined}
      ></div>
    </div>
  );
};

export default Loading;
