import { useEffect, useState } from "react";
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
    Gyroscope.setUpdateInterval(20); // 50Hz (20ms per sample)
    Accelerometer.setUpdateInterval(20);

    const gyroSub = Gyroscope.addListener((data) => setGyroData(data));
    const accelSub = Accelerometer.addListener((data) => setAccelData(data));

    return () => {
      gyroSub.remove();
      accelSub.remove();
    };
  }, [commonStore.isLogging]);

  const getMagnitudeData = (
    data: GyroscopeMeasurement | AccelerometerMeasurement | null,
  ) => {
    if (!data) return 0;
    Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    return Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
  };

  return { gyroData, accelData, getMagnitudeData };
}
