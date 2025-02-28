import { makeAutoObservable, runInAction } from "mobx";
import RootStores from "@/stores/stores";
import { SensorData } from "@/types/common/sensor";
import { CircularBuffer } from "@/hooks/useCircularBuffer";

// Thresholds for anomaly detection
const ACCEL_THRESHOLD = 2.0; // 5cm pothole Adjust based on testing
const GYRO_THRESHOLD = 2.0; // 5cm pothole Adjust based on testing
const IS_AND_CONDITION = false;
// Buffer settings (12s window = 600 samples, 2s overlap = 100 samples at 50hz)
const WINDOW_SIZE = 600;
const OVERLAP_SIZE = 100;

export default class CommonStore {
  rootStore: RootStores;

  //state
  accelThreshold: number = ACCEL_THRESHOLD;
  gyroThreshold: number = GYRO_THRESHOLD;
  isLogging: boolean = false;
  isAndCondition: boolean = IS_AND_CONDITION;
  buffer = new CircularBuffer<SensorData>(WINDOW_SIZE, OVERLAP_SIZE);

  constructor(rootStore: RootStores) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      buffer: false,
    });
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

  setIsAndCondition(isAndCondition: boolean) {
    this.isAndCondition = isAndCondition;
  }

  getIsAndCondition() {
    return this.isAndCondition;
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
    this.buffer.add(data);
  }

  // setExtractedData(data: ExtractedData) {
  //   runInAction(() => {
  //     this.anomalyData.push(data);
  //   });
  // }
  //
  // clearExtractedData() {
  //   runInAction(() => {
  //     this.anomalyData = [];
  //   });
  // }

  extractAnomaly(anomalyTime: number) {
    const cloned = [...this.buffer.getBuffer()];
    return cloned.filter(
      (entry) =>
        entry &&
        entry.timestamp >= anomalyTime - 1000 &&
        entry.timestamp <= anomalyTime + 1000,
    );
  }
}
