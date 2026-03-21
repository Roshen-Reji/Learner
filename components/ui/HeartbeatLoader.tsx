import React from 'react';

interface HeartbeatLoaderProps {
  message?: string;
  className?: string;
}

export default function HeartbeatLoader({ message = "LOADING", className = "" }: HeartbeatLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className="relative w-48 h-20 sm:w-64 sm:h-28 flex items-center justify-center">
        {/* Main Heartbeat Line */}
        <svg viewBox="0 0 500 200" className="absolute inset-0 w-full h-full">
          <path
            d="M 0,100 L 120,100 L 140,40 L 180,180 L 220,10 L 260,140 L 280,100 L 500,100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2000"
            strokeDashoffset="2000"
            className="animate-heartbeat"
          />
        </svg>
      </div>
      {message && (
        <p className="font-extrabold tracking-[0.2em] uppercase text-sm animate-pulse text-red-500">
          {message}
        </p>
      )}
    </div>
  );
}
