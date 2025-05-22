import { useState, useEffect } from "react";

type LoadingProps = {
  size?: number;
  color?: string;
  loadingMessage?: string;
};

const Loading = ({ size = 40, color = "#9333ea", loadingMessage="Loading" }: LoadingProps) => {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color}
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="animate-spin"
      >
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path 
          d="M12 2a10 10 0 0 1 10 10" 
          strokeOpacity="0.75" 
        />
      </svg>
      <span className="mt-2 text-purple-500 font-mono">
        {loadingMessage}{dots}
      </span>
    </div>
  );
};

export default Loading;