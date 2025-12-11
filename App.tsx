import React, { useState, useEffect } from 'react';
import { BatteryState, ConnectionStatus, NoiseControlMode, SettingsState, AirPodsModel, SpatialAudioMode } from './types';
import { LaunchScreen } from './components/LaunchScreen';
import { ActionSheet } from './components/ActionSheet';
import { AirPodsIcon, BatteryIcon, SignalIcon } from './components/Icons';
import { AudioControls } from './components/AudioControls';
import { bluetoothService } from './services/bluetoothService';
import { Settings, Bluetooth, Info } from 'lucide-react';

// Simplified SVG paths for generating dynamic favicons
const ICON_PATHS = {
  [AirPodsModel.PRO]: `<path d="M166 120C166 84.6538 194.654 56 230 56H282C317.346 56 346 84.6538 346 120V230C346 250 340 280 320 300L290 330C280 340 270 345 270 360V420C270 436.569 256.569 450 240 450C223.431 450 210 436.569 210 420V360C210 340 190 330 180 310L170 290C166 280 166 260 166 230V120Z" fill="white" stroke="%23374151" stroke-width="20"/>`,
  [AirPodsModel.MAX]: `<rect x="110" y="200" width="100" height="220" rx="50" fill="white" stroke="%23374151" stroke-width="20"/><rect x="302" y="200" width="100" height="220" rx="50" fill="white" stroke="%23374151" stroke-width="20"/><path d="M150 200V180C150 120 200 70 256 70C312 70 362 120 362 180V200" stroke="%23374151" stroke-width="30" fill="none" stroke-linecap="round"/>`,
  [AirPodsModel.GEN_3]: `<path d="M170 150C170 100 200 70 240 70H270C310 70 340 100 340 150V220C340 240 335 320 325 350C315 380 300 390 280 390C260 390 245 380 245 350V300C245 280 225 270 215 260L200 245C180 225 170 200 170 150Z" fill="white" stroke="%23374151" stroke-width="20"/>`,
  [AirPodsModel.GEN_1_2]: `<path d="M180 140C180 100 210 60 256 60C302 60 332 100 332 140V240C332 250 330 350 330 380C330 400 315 420 295 420C275 420 260 400 260 380V280C260 260 240 250 220 240L210 230C190 210 180 180 180 140Z" fill="white" stroke="%23374151" stroke-width="20"/>`,
  [AirPodsModel.UNKNOWN]: `<path d="M166 120C166 84.6538 194.654 56 230 56H282C317.346 56 346 84.6538 346 120V230C346 250 340 280 320 300L290 330C280 340 270 345 270 360V420C270 436.569 256.569 450 240 450C223.431 450 210 436.569 210 420V360C210 340 190 330 180 310L170 290C166 280 166 260 166 230V120Z" fill="white" stroke="%23374151" stroke-width="20"/>`,
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [battery, setBattery] = useState<BatteryState>({
    left: 0, right: 0, case: 0,
    isCharging: { left: false, right: false, case: false }
  });
  const [noiseMode, setNoiseMode] = useState<NoiseControlMode>(NoiseControlMode.OFF);
  const [spatialMode, setSpatialMode] = useState<SpatialAudioMode>(SpatialAudioMode.OFF);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');
  const [settings, setSettings] = useState<SettingsState>({
    autoConnect: true,
    detectEar: true,
    rename: "My AirPods",
    lastConnectedModel: null,
  });

  // Load settings and model from local storage on mount
  useEffect(() => {
    const savedModel = localStorage.getItem('lastConnectedModel') as AirPodsModel | null;
    const savedName = localStorage.getItem('lastDeviceName');
    
    if (savedModel || savedName) {
      setSettings(prev => ({
        ...prev,
        rename: savedName || prev.rename,
        lastConnectedModel: savedModel || null
      }));
      if (savedModel) updateAppIcon(savedModel);
    }
  }, []);

  // Battery polling
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === ConnectionStatus.CONNECTED) {
      interval = setInterval(() => {
        const newData = bluetoothService.getMockBatteryData();
        setBattery(newData);
      }, 5000);
      setBattery(bluetoothService.getMockBatteryData());
    }
    return () => clearInterval(interval);
  }, [status]);

  /**
   * Generates a new favicon SVG based on the model and updates the DOM.
   */
  const updateAppIcon = (model: AirPodsModel) => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) return;

    const path = ICON_PATHS[model] || ICON_PATHS[AirPodsModel.UNKNOWN];
    
    // Create a dynamic SVG string
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <rect width="512" height="512" rx="100" fill="white"/>
        ${path}
      </svg>
    `;
    
    const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    link.href = encoded;
  };

  const handleConnect = async () => {
    if (status === ConnectionStatus.CONNECTED) {
      await bluetoothService.disconnect();
      setStatus(ConnectionStatus.DISCONNECTED);
      return;
    }

    setStatus(ConnectionStatus.SCANNING);
    
    // Simulation finding device
    setTimeout(async () => {
        setStatus(ConnectionStatus.CONNECTING);
        const result = await bluetoothService.connect();
        
        if (result.success) {
            setStatus(ConnectionStatus.CONNECTED);
            
            // Update State & Persistence
            setSettings(prev => ({ 
              ...prev, 
              rename: result.name,
              lastConnectedModel: result.model
            }));
            localStorage.setItem('lastConnectedModel', result.model);
            localStorage.setItem('lastDeviceName', result.name);
            
            // Trigger Dynamic Icon Update
            updateAppIcon(result.model);

            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3500);
        } else {
            setStatus(ConnectionStatus.DISCONNECTED);
        }
    }, 1500);
  };

  const currentModel = status === ConnectionStatus.CONNECTED 
    ? settings.lastConnectedModel || AirPodsModel.PRO 
    : settings.lastConnectedModel || AirPodsModel.UNKNOWN;

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-gray-900 pb-20 font-sans selection:bg-blue-100">
      <LaunchScreen onComplete={() => setLoading(false)} />

      {/* Header */}
      <header className="pt-12 pb-6 px-6 bg-white/50 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200/50">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {status === ConnectionStatus.CONNECTED ? currentModel : 'AirLink'}
                </p>
                <h1 className="text-2xl font-bold tracking-tight truncate max-w-[250px]">
                  {status === ConnectionStatus.CONNECTED ? settings.rename : 'Not Connected'}
                </h1>
            </div>
            {status === ConnectionStatus.CONNECTED && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    <SignalIcon />
                    <span>BLE</span>
                </div>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 max-w-md mx-auto">
        
        {activeTab === 'home' && (
            <>
                {/* Hero Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 mb-8 border border-white flex flex-col items-center relative overflow-hidden">
                    <div className="w-48 h-48 mb-6 relative z-10 transition-transform duration-700 hover:scale-105">
                        <AirPodsIcon 
                          model={currentModel !== AirPodsModel.UNKNOWN ? currentModel : AirPodsModel.PRO} 
                          className={status === ConnectionStatus.CONNECTED ? 'opacity-100' : 'opacity-40 grayscale'} 
                        />
                    </div>

                    <button 
                        onClick={handleConnect}
                        disabled={status === ConnectionStatus.SCANNING || status === ConnectionStatus.CONNECTING}
                        className={`
                            relative z-10 px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2
                            ${status === ConnectionStatus.CONNECTED 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95'}
                        `}
                    >
                        {status === ConnectionStatus.SCANNING || status === ConnectionStatus.CONNECTING ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Bluetooth size={16} />
                        )}
                        {status === ConnectionStatus.CONNECTED ? 'Disconnect' : status}
                    </button>
                    
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -z-0 pointer-events-none" />
                </div>

                {status === ConnectionStatus.CONNECTED && (
                    <div className="ios-fade-in">
                        {/* Battery Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[
                                { label: 'L', val: battery.left, charge: battery.isCharging.left },
                                { label: 'Case', val: battery.case, charge: battery.isCharging.case },
                                { label: 'R', val: battery.right, charge: battery.isCharging.right }
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center">
                                    <span className="text-gray-400 text-xs font-bold mb-2">{item.label}</span>
                                    <span className="text-xl font-bold mb-1">{item.val}%</span>
                                    <BatteryIcon level={item.val} charging={item.charge} className="scale-75 origin-center" />
                                </div>
                            ))}
                        </div>

                        {/* Model-Aware Audio Controls */}
                        <AudioControls 
                          model={currentModel} 
                          noiseMode={noiseMode}
                          setNoiseMode={setNoiseMode}
                          spatialMode={spatialMode}
                          setSpatialMode={setSpatialMode}
                        />

                    </div>
                )}
            </>
        )}

        {activeTab === 'settings' && (
            <div className="space-y-6 ios-fade-in">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                     <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium">Name</span>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            {settings.rename} <span className="text-gray-300">›</span>
                        </div>
                     </div>
                     <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium">Automatic Ear Detection</span>
                        <div className={`w-11 h-6 rounded-full relative transition-colors ${settings.detectEar ? 'bg-green-500' : 'bg-gray-200'}`}>
                             <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.detectEar ? 'left-[22px]' : 'left-0.5'}`} />
                        </div>
                     </div>
                </div>

                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                        <Info size={18} className="text-gray-400" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Model Name</p>
                        </div>
                        <span className="text-sm text-gray-500">{currentModel}</span>
                    </div>
                     <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Model Number</p>
                        </div>
                        <span className="text-sm text-gray-500">A2931</span>
                    </div>
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Firmware Version</p>
                        </div>
                        <span className="text-sm text-gray-500">5B58</span>
                    </div>
                </div>

                <div className="text-center pt-4">
                     <p className="text-xs text-gray-400">AirLink v1.2.0 • React & Tailwind</p>
                </div>
            </div>
        )}

      </main>

      {/* Popup */}
      <ActionSheet 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        battery={battery}
        deviceName={settings.rename}
      />

      {/* Tab Bar */}
      <div className="fixed bottom-6 left-6 right-6 h-16 bg-white/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 flex items-center justify-around z-40 max-w-md mx-auto">
        <button 
            onClick={() => setActiveTab('home')}
            className={`p-3 rounded-full transition-all ${activeTab === 'home' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Bluetooth size={24} />
        </button>
        <button 
             onClick={() => setActiveTab('settings')}
             className={`p-3 rounded-full transition-all ${activeTab === 'settings' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Settings size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;