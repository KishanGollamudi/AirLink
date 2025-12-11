import React from 'react';
import { BatteryState } from '../types';
import { BatteryIcon, AirPodsIcon } from './Icons';

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  battery: BatteryState;
  deviceName: string;
}

export const ActionSheet = ({ isOpen, onClose, battery, deviceName }: ActionSheetProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-md mx-4 mb-4 rounded-[2rem] p-6 shadow-2xl pointer-events-auto ios-slide-up border border-white/40">
        <div className="flex items-start justify-between mb-2">
            <h2 className="text-2xl font-semibold text-gray-900">{deviceName}</h2>
            <button onClick={onClose} className="p-1 bg-gray-200/50 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-6">Connected</p>

        <div className="flex justify-center mb-8">
            <div className="w-40 h-40">
                <AirPodsIcon />
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-gray-400 mb-2">Left</span>
                <span className="text-xl font-bold text-gray-800 mb-1">{battery.left}%</span>
                <BatteryIcon level={battery.left} charging={battery.isCharging.left} />
            </div>
            <div className="flex flex-col items-center border-l border-r border-gray-200">
                 <span className="text-xs font-semibold text-gray-400 mb-2">Case</span>
                <span className="text-xl font-bold text-gray-800 mb-1">{battery.case}%</span>
                <BatteryIcon level={battery.case} charging={battery.isCharging.case} />
            </div>
            <div className="flex flex-col items-center">
                 <span className="text-xs font-semibold text-gray-400 mb-2">Right</span>
                <span className="text-xl font-bold text-gray-800 mb-1">{battery.right}%</span>
                <BatteryIcon level={battery.right} charging={battery.isCharging.right} />
            </div>
        </div>
      </div>
    </div>
  );
};