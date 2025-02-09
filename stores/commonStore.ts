import { makeAutoObservable, runInAction } from "mobx";
import RootStores from "@/stores/stores";

// Thresholds for anomaly detection
const ACCEL_THRESHOLD = 2.0; // Adjust based on testing
const GYRO_THRESHOLD = 2.0; // Adjust based on testing
export default class CommonStore {
  rootStore: RootStores;

  //state
  accelThreshold: number = ACCEL_THRESHOLD;
  gyroThreshold: number = GYRO_THRESHOLD;
  isLogging: boolean = false;

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
    console.log(isLogging);
    runInAction(() => {
      this.isLogging = isLogging;
    });
  }

  getIsLogging() {
    return this.isLogging;
  }
}
