import { makeAutoObservable, runInAction } from "mobx";
import RootStores from "@/stores/stores";
import { SensorData } from "@/types/common/sensor";
import { CircularBuffer } from "@/hooks/useCircularBuffer";

// Thresholds for anomaly detection
const ACCEL_THRESHOLD = 2.0; // 5cm pothole Adjust based on testing
const GYRO_THRESHOLD = 2.0; // 5cm pothole Adjust based on testing

// Buffer settings (10s window = 500 samples, 1s overlap = 50 samples at 50hz)
const WINDOW_SIZE = 500;
const OVERLAP_SIZE = 50;

export default class CommonStore {
  rootStore: RootStores;

  //state
  accelThreshold: number = ACCEL_THRESHOLD;
  gyroThreshold: number = GYRO_THRESHOLD;
  isLogging: boolean = false;
  buffer = new CircularBuffer<SensorData>(WINDOW_SIZE, OVERLAP_SIZE);

  constructor(rootStore: RootStores) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setAccelThreshold(accelThreshold: number) {
    this.accelThreshold = accelThreshold;
  }

  getAccelThreshold() {
    return this.accelThreshold;
  }

  setGyroThreshold(gyroThreshold: number) {
    this.gyroThreshold = gyroThreshold;
  }

  getGyroThreshold() {
    return this.gyroThreshold;
  }

  setIsLogging(isLogging: boolean) {
    runInAction(() => {
      this.isLogging = isLogging;
    });
  }

  getIsLogging() {
    return this.isLogging;
  }

  setBufferData(data: SensorData) {
    runInAction(() => {
      this.buffer.add(data);
    });
  }

  extractAnomaly(anomalyTime: number) {
    return this.buffer
      .getBuffer()
      .filter(
        (entry) =>
          entry &&
          entry.timestamp >= anomalyTime - 1000 &&
          entry.timestamp <= anomalyTime + 1000,
      );
  }
}
