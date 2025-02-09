import { useEffect, useState } from "react";
import {
  Accelerometer,
  AccelerometerMeasurement,
  DeviceMotion,
  DeviceMotionMeasurement,
  Gyroscope,
  GyroscopeMeasurement,
} from "expo-sensors";
import { useStore } from "@/stores/stores";

export function useSensorData() {
  const { commonStore } = useStore();
  const [gyroData, setGyroData] = useState<GyroscopeMeasurement | null>(null);
  const [zAccelWorld, setZAccelWorld] = useState(0);
  const [accelData, setAccelData] = useState<AccelerometerMeasurement | null>(
    null,
  );

  const calculateZAccelWorld = (data: DeviceMotionMeasurement | null) => {
    if (!data || !data.acceleration || !data.rotation) return 0;
    const { x: ax, y: ay, z: az } = data.acceleration;
    const { alpha, beta, gamma } = data.rotation; // Expo orientation

    // Convert degrees to radians
    const radAlpha = (alpha * Math.PI) / 180; // Z-axis (Yaw)
    const radBeta = (beta * Math.PI) / 180; // X-axis (Pitch)
    const radGamma = (gamma * Math.PI) / 180; // Y-axis (Roll)

    // Compute sin/cos values for efficiency
    const cA = Math.cos(radAlpha),
      sA = Math.sin(radAlpha);
    const cB = Math.cos(radBeta),
      sB = Math.sin(radBeta);
    const cG = Math.cos(radGamma),
      sG = Math.sin(radGamma);

    // Rotation matrix (XYZ order)
    const R = [
      [cA * cG - sA * sB * sG, -cB * sG, sA * cG + cA * sB * sG],
      [cA * sG + sA * sB * cG, cB * cG, sA * sG - cA * sB * cG],
      [-sA * cB, sB, cA * cB],
    ];

    // Transform acceleration into world coordinates
    const accelWorld = {
      x: R[0][0] * ax + R[0][1] * ay + R[0][2] * az,
      y: R[1][0] * ax + R[1][1] * ay + R[1][2] * az,
      z: R[2][0] * ax + R[2][1] * ay + R[2][2] * az, // Corrected world Z acceleration
    };

    // Extract the world Z-axis acceleration
    setZAccelWorld(accelWorld.z);
  };

  useEffect(() => {
    if (!commonStore.isLogging) {
      return;
    }
    // Subscribe to sensors
    Gyroscope.setUpdateInterval(200); // 5Hz (200ms per sample)
    Accelerometer.setUpdateInterval(200);
    DeviceMotion.setUpdateInterval(200);

    const gyroSub = Gyroscope.addListener((data) => setGyroData(data));
    const accelSub = Accelerometer.addListener((data) => setAccelData(data));
    const deviceMotionSub = DeviceMotion.addListener((data) =>
      calculateZAccelWorld(data),
    );

    return () => {
      gyroSub.remove();
      accelSub.remove();
      deviceMotionSub.remove();
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

  return { gyroData, accelData, gyroMag, accelMag, zAccelWorld };
}
