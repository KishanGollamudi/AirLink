export interface BatteryState {
  left: number;
  right: number;
  case: number;
  isCharging: {
    left: boolean;
    right: boolean;
    case: boolean;
  };
}

export enum ConnectionStatus {
  DISCONNECTED = 'Disconnected',
  SCANNING = 'Scanning...',
  CONNECTING = 'Connecting...',
  CONNECTED = 'Connected',
}

export enum NoiseControlMode {
  ANC = 'Noise Cancellation',
  OFF = 'Off', // This is "Normal Mode"
  TRANSPARENCY = 'Transparency',
}

export enum SpatialAudioMode {
  OFF = 'Off',
  FIXED = 'Fixed',
  HEAD_TRACKED = 'Head Tracked',
}

export enum AirPodsModel {
  GEN_1_2 = 'AirPods (Gen 1/2)',
  GEN_3 = 'AirPods (Gen 3)',
  PRO = 'AirPods Pro', // Covers Gen 1 & 2
  MAX = 'AirPods Max',
  UNKNOWN = 'AirPods',
}

// Feature capabilities definition
export interface ModelFeatures {
  supportsANC: boolean;
  supportsTransparency: boolean;
  supportsSpatial: boolean;
}

export const AIRPODS_FEATURES: Record<AirPodsModel, ModelFeatures> = {
  [AirPodsModel.GEN_1_2]: { supportsANC: false, supportsTransparency: false, supportsSpatial: false },
  [AirPodsModel.GEN_3]: { supportsANC: false, supportsTransparency: false, supportsSpatial: true },
  [AirPodsModel.PRO]: { supportsANC: true, supportsTransparency: true, supportsSpatial: true },
  [AirPodsModel.MAX]: { supportsANC: true, supportsTransparency: true, supportsSpatial: true },
  [AirPodsModel.UNKNOWN]: { supportsANC: false, supportsTransparency: false, supportsSpatial: false },
};

export interface AirPodDevice {
  id: string;
  name: string;
  model: AirPodsModel;
  firmware: string;
}

export interface SettingsState {
  autoConnect: boolean;
  detectEar: boolean;
  rename: string;
  lastConnectedModel: AirPodsModel | null;
}