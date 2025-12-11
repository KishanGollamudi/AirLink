import React, { useEffect, useState } from 'react';
import { AirPodsIcon } from './Icons';

export const LaunchScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); // Allow fade out to finish
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="flex flex-col items-center ios-fade-in">
        <div className="w-32 h-32 mb-6">
          <AirPodsIcon />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">AirLink</h1>
      </div>
    </div>
  );
};