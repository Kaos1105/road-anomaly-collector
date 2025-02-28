import { makeAutoObservable, runInAction } from "mobx";
import RootStores from "@/stores/stores";
import { SensorData } from "@/types/common/sensor";
import { CircularBuffer } from "@/hooks/useCircularBuffer";

// Thresholds for anomaly detection
const ACCEL_THRESHOLD = 2.0; // 5cm pothole Adjust based on testing
const GYRO_THRESHOLD = 2.0; // 5cm pothole Adjust based on testing
const IS_AND_CONDITION = false;
// Buffer settings (12s window = 600 samples, 2s overlap = 100 samples at 50hz)
const WINDOW_SIZE = 500;
const OVERLAP_SIZE = 50;

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
    const buffer = this.buffer.getBuffer();
    const startTime = anomalyTime - 1000;
    const endTime = anomalyTime + 1000;

    let startIdx = 0;
    let endIdx = buffer.length - 1;

    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] && buffer[i]!.timestamp >= startTime) {
        startIdx = i;
        break;
      }
    }
    for (let i = buffer.length - 1; i >= 0; i--) {
      if (buffer[i] && buffer[i]!.timestamp <= endTime) {
        endIdx = i;
        break;
      }
    }

    return buffer.slice(startIdx, endIdx + 1).filter((entry) => entry !== null);
  }
}
