import { BatteryState, ConnectionStatus, AirPodsModel } from '../types';

export const SERVICE_UUID = 0x180F; 

interface BluetoothRemoteGATTServer {
  connected: boolean;
  disconnect(): void;
}

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  // Simulating manufacturer data for detection logic
  manufacturerData?: Map<number, DataView>; 
}

class BluetoothService {
  private device: BluetoothDevice | null = null;

  /**
   * Advanced Model Detection Strategy
   * 1. Product ID in Manufacturer Data (0x004C - Apple ID)
   * 2. Name Pattern Matching (Fallback)
   */
  detectDeviceModel(device: BluetoothDevice): AirPodsModel {
    // 1. Check Manufacturer Data (Simulation of native capability)
    // Apple Company ID is 0x004C. 
    // In a real native implementation, we would parse the specific bytes here.
    if (device.manufacturerData && device.manufacturerData.has(0x004C)) {
       // Logic to parse Product ID bytes would go here.
       // Example: if (bytes[0] === 0x0E) return AirPodsModel.PRO;
    }

    // 2. Fallback: Robust Name Parsing
    const name = device.name?.toLowerCase() || '';

    if (name.includes('max')) {
      return AirPodsModel.MAX;
    }
    // Matches "AirPods Pro" and "AirPods Pro - Find My"
    if (name.includes('pro')) {
      return AirPodsModel.PRO;
    }
    // Matches "AirPods (3rd Generation)"
    if (name.includes('3rd') || name.includes('gen 3')) {
      return AirPodsModel.GEN_3;
    }
    // Default fallback for "AirPods" usually implies Gen 1 or 2
    if (name.includes('airpods')) {
      return AirPodsModel.GEN_1_2;
    }

    return AirPodsModel.UNKNOWN;
  }

  async connect(): Promise<{ success: boolean; model: AirPodsModel; name: string }> {
    // Simulation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // MOCK DATA: Randomly select a model to demonstrate the specific UI changes
    const mockModels = [
      { name: "Sasha's AirPods Pro", model: AirPodsModel.PRO },
      { name: "AirPods Max - Space Grey", model: AirPodsModel.MAX },
      { name: "Gym AirPods (3rd Gen)", model: AirPodsModel.GEN_3 },
      { name: "Old AirPods", model: AirPodsModel.GEN_1_2 }
    ];
    
    const randomSelection = mockModels[Math.floor(Math.random() * mockModels.length)];
    
    // Return mock connection result
    return { 
      success: true, 
      model: this.detectDeviceModel({ id: 'mock', name: randomSelection.name }),
      name: randomSelection.name
    };
  }

  async disconnect(): Promise<void> {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  getMockBatteryData(): BatteryState {
    return {
      left: Math.floor(Math.random() * (100 - 85) + 85),
      right: Math.floor(Math.random() * (100 - 80) + 80),
      case: Math.floor(Math.random() * (100 - 40) + 40),
      isCharging: {
        left: false,
        right: false,
        case: Math.random() > 0.7,
      }
    };
  }
}

export const bluetoothService = new BluetoothService();