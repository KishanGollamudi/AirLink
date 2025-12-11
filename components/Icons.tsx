import React from 'react';
import { AirPodsModel } from '../types';

interface IconProps {
  className?: string;
}

// Gen 1 & 2 (Long stem)
export const AirPodsGen1Icon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 512 512" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
     <path d="M180 140C180 100 210 60 256 60C302 60 332 100 332 140V240C332 250 330 350 330 380C330 400 315 420 295 420C275 420 260 400 260 380V280C260 260 240 250 220 240L210 230C190 210 180 180 180 140Z"
      fill="white" stroke="#E5E5EA" strokeWidth="12"
      filter="drop-shadow(0px 10px 20px rgba(0,0,0,0.1))" />
     <rect x="250" y="100" width="10" height="40" rx="5" fill="#1C1C1E" opacity="0.1" />
  </svg>
);

// Gen 3 (Contoured, shorter stem)
export const AirPodsGen3Icon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 512 512" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M170 150C170 100 200 70 240 70H270C310 70 340 100 340 150V220C340 240 335 320 325 350C315 380 300 390 280 390C260 390 245 380 245 350V300C245 280 225 270 215 260L200 245C180 225 170 200 170 150Z" 
      fill="white" stroke="#E5E5EA" strokeWidth="12"
      filter="drop-shadow(0px 10px 20px rgba(0,0,0,0.1))" />
    <ellipse cx="280" cy="140" rx="20" ry="30" fill="#1C1C1E" opacity="0.1" transform="rotate(-15 280 140)" />
  </svg>
);

// Pro (Silicone tip, short stem)
export const AirPodsProIcon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 512 512" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M166 120C166 84.6538 194.654 56 230 56H282C317.346 56 346 84.6538 346 120V230C346 250 340 280 320 300L290 330C280 340 270 345 270 360V420C270 436.569 256.569 450 240 450C223.431 450 210 436.569 210 420V360C210 340 190 330 180 310L170 290C166 280 166 260 166 230V120Z" 
      fill="white" stroke="#E5E5EA" strokeWidth="12"
      filter="drop-shadow(0px 10px 20px rgba(0,0,0,0.1))" />
    <rect x="236" y="100" width="40" height="12" rx="6" fill="#1C1C1E" opacity="0.1" />
    <path d="M166 120C150 120 140 130 140 150C140 170 150 180 166 180" stroke="#E5E5EA" strokeWidth="4" fill="none" opacity="0.5"/>
  </svg>
);

// Max (Over-ear)
export const AirPodsMaxIcon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 512 512" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M150 200V180C150 120 200 70 256 70C312 70 362 120 362 180V200" stroke="#E5E5EA" strokeWidth="24" strokeLinecap="round" />
    <rect x="110" y="200" width="100" height="220" rx="50" fill="white" stroke="#E5E5EA" strokeWidth="8" filter="drop-shadow(0px 10px 20px rgba(0,0,0,0.1))" />
    <rect x="302" y="200" width="100" height="220" rx="50" fill="white" stroke="#E5E5EA" strokeWidth="8" filter="drop-shadow(0px 10px 20px rgba(0,0,0,0.1))" />
  </svg>
);

// Dynamic Resolver
export const AirPodsIcon = ({ model, className }: { model?: AirPodsModel, className?: string }) => {
  switch (model) {
    case AirPodsModel.MAX:
      return <AirPodsMaxIcon className={className} />;
    case AirPodsModel.GEN_3:
      return <AirPodsGen3Icon className={className} />;
    case AirPodsModel.GEN_1_2:
      return <AirPodsGen1Icon className={className} />;
    case AirPodsModel.PRO:
    default:
      return <AirPodsProIcon className={className} />;
  }
};

export const BatteryIcon = ({ level, charging, className }: { level: number; charging: boolean; className?: string }) => {
  const getColor = () => {
    if (charging) return 'bg-green-500';
    if (level < 20) return 'bg-red-500';
    return 'bg-green-500';
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="w-8 h-3.5 border border-gray-300 rounded-[3px] p-0.5 flex items-center">
        <div 
          className={`h-full rounded-[1px] transition-all duration-500 ${getColor()}`} 
          style={{ width: `${level}%` }}
        />
      </div>
      <div className="w-0.5 h-1.5 bg-gray-300 rounded-r-[1px]" />
      {charging && (
        <div className="absolute -right-2 -top-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 fill-current">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        </div>
      )}
    </div>
  );
};

export const SignalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20v-12"/><path d="M22 20V4"/>
    </svg>
);
