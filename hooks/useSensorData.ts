import { useEffect, useMemo, useState } from "react";
import {
  Accelerometer,
  AccelerometerMeasurement,
  Gyroscope,
  GyroscopeMeasurement,
} from "expo-sensors";
import { useStore } from "@/stores/stores";

export function useSensorData() {
  const { commonStore } = useStore();
  const [gyroData, setGyroData] = useState<GyroscopeMeasurement | null>(null);
  const [accelData, setAccelData] = useState<AccelerometerMeasurement | null>(
    null,
  );

  useEffect(() => {
    if (!commonStore.isLogging) {
      return;
    }
    // Subscribe to sensors
    Gyroscope.setUpdateInterval(200); // 5Hz (200ms per sample)
    Accelerometer.setUpdateInterval(200);

    const gyroSub = Gyroscope.addListener((data) => setGyroData(data));
    const accelSub = Accelerometer.addListener((data) => setAccelData(data));

    return () => {
      gyroSub.remove();
      accelSub.remove();
    };
  }, [commonStore.isLogging]);

  const gyroMag = (gyroData: GyroscopeMeasurement) => {
    if (!gyroData) return 0;
    Math.sqrt(gyroData.x ** 2 + gyroData.y ** 2 + gyroData.z ** 2);
    return Math.sqrt(gyroData.x ** 2 + gyroData.y ** 2 + gyroData.z ** 2);
  };

  const accelMag = (accelData: AccelerometerMeasurement) => {
    if (!accelData) return 0;
    return Math.sqrt(accelData.x ** 2 + accelData.y ** 2 + accelData.z ** 2);
  };

  return { gyroData, accelData, gyroMag, accelMag };
}
