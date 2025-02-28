import { create } from "zustand";
import { CircularBuffer } from "@/hooks/useCircularBuffer";
import { SensorData } from "@/types/common/sensor";

// Thresholds for anomaly detection
const ACCEL_THRESHOLD = 2.0;
const GYRO_THRESHOLD = 2.0;
const IS_AND_CONDITION = false;

// Buffer settings (10s window = 500 samples, 2s overlap = 100 samples at 50hz)
const WINDOW_SIZE = 500;
const OVERLAP_SIZE = 50;

interface CommonStore {
  accelThreshold: number;
  gyroThreshold: number;
  isLogging: boolean;
  isAndCondition: boolean;
  buffer: CircularBuffer<SensorData>;

  // Actions
  setAccelThreshold: (threshold: number) => void;
  setGyroThreshold: (threshold: number) => void;
  setIsAndCondition: (condition: boolean) => void;
  setIsLogging: (logging: boolean) => void;
  setBufferData: (data: SensorData) => void;
  extractAnomaly: (anomalyTime: number) => (SensorData | null)[];
}

export const useCommonStore = create<CommonStore>((set, get) => ({
  accelThreshold: ACCEL_THRESHOLD,
  gyroThreshold: GYRO_THRESHOLD,
  isLogging: false,
  isAndCondition: IS_AND_CONDITION,
  buffer: new CircularBuffer<SensorData>(WINDOW_SIZE, OVERLAP_SIZE),

  setAccelThreshold: (threshold) => set({ accelThreshold: threshold }),
  setGyroThreshold: (threshold) => set({ gyroThreshold: threshold }),
  setIsAndCondition: (condition) => set({ isAndCondition: condition }),
  setIsLogging: (logging) => set({ isLogging: logging }),

  setBufferData: (data) => {
    get().buffer.add(data);
  },

  extractAnomaly: (anomalyTime) => {
    return get()
      .buffer.getBuffer()
      .sort((x, y) => (x?.timestamp ?? 0) - (y?.timestamp ?? 0))
      .filter(
        (entry) =>
          entry &&
          entry.timestamp >= anomalyTime - 1000 &&
          entry.timestamp <= anomalyTime + 1000,
      );
  },
}));
