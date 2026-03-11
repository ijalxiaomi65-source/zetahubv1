import React, { useEffect, useState } from "react";

interface LoadingBarProps {
  isLoading: boolean;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none">
      <div 
        className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
