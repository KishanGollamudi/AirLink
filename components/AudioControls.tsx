import React from 'react';
import { AirPodsModel, AIRPODS_FEATURES, NoiseControlMode, SpatialAudioMode } from '../types';
import { Volume2, Ear, Ban, Activity } from 'lucide-react';

interface AudioControlsProps {
  model: AirPodsModel;
  noiseMode: NoiseControlMode;
  setNoiseMode: (mode: NoiseControlMode) => void;
  spatialMode: SpatialAudioMode;
  setSpatialMode: (mode: SpatialAudioMode) => void;
}

export const AudioControls = ({ 
  model, 
  noiseMode, 
  setNoiseMode, 
  spatialMode, 
  setSpatialMode 
}: AudioControlsProps) => {
  const features = AIRPODS_FEATURES[model] || AIRPODS_FEATURES[AirPodsModel.UNKNOWN];

  const ButtonBase = ({ 
    active, 
    disabled, 
    onClick, 
    icon: Icon, 
    label, 
    subLabel 
  }: { active: boolean; disabled: boolean; onClick: () => void; icon: any; label: string; subLabel?: string }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-2xl w-full transition-all duration-300 border
        ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-transparent' : 
          active ? 'bg-white border-blue-500 shadow-md scale-[1.02]' : 'bg-white border-gray-100 shadow-sm hover:bg-gray-50'}
      `}
    >
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors
        ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
      `}>
        <Icon size={20} />
      </div>
      <span className={`text-xs font-bold ${active ? 'text-blue-600' : 'text-gray-700'}`}>{label}</span>
      {subLabel && <span className="text-[10px] text-gray-400 mt-0.5">{subLabel}</span>}
      
      {active && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-sm" />
      )}
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Noise Control Section - Only show if device supports ANC or Transparency */}
      {(features.supportsANC || features.supportsTransparency) && (
        <div className="space-y-3">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest ml-1">Noise Control</h3>
          <div className="grid grid-cols-3 gap-3">
            <ButtonBase
              label="ANC"
              subLabel="Noise Cancellation"
              icon={Activity}
              active={noiseMode === NoiseControlMode.ANC}
              disabled={!features.supportsANC}
              onClick={() => setNoiseMode(NoiseControlMode.ANC)}
            />
            <ButtonBase
              label="Off"
              subLabel="Normal Mode"
              icon={Ban}
              active={noiseMode === NoiseControlMode.OFF}
              disabled={false} // Off is always available if noise control exists
              onClick={() => setNoiseMode(NoiseControlMode.OFF)}
            />
            <ButtonBase
              label="Transparency"
              subLabel="Pass-through"
              icon={Ear}
              active={noiseMode === NoiseControlMode.TRANSPARENCY}
              disabled={!features.supportsTransparency}
              onClick={() => setNoiseMode(NoiseControlMode.TRANSPARENCY)}
            />
          </div>
        </div>
      )}

      {/* Spatial Audio Section */}
      {features.supportsSpatial && (
        <div className="space-y-3">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest ml-1">Spatial Audio</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${spatialMode !== SpatialAudioMode.OFF ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                <Volume2 size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Spatial Audio</h4>
                <p className="text-xs text-gray-500">{spatialMode}</p>
              </div>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-full">
               <button 
                onClick={() => setSpatialMode(SpatialAudioMode.OFF)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${spatialMode === SpatialAudioMode.OFF ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
               >
                 Off
               </button>
               <button 
                onClick={() => setSpatialMode(SpatialAudioMode.HEAD_TRACKED)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${spatialMode !== SpatialAudioMode.OFF ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
               >
                 On
               </button>
            </div>
          </div>
        </div>
      )}

      {!features.supportsANC && !features.supportsSpatial && (
        <div className="text-center p-6 bg-white/50 rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">No advanced audio controls available for this model.</p>
        </div>
      )}
    </div>
  );
};