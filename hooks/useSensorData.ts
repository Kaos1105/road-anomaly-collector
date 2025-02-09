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
import { mat4, vec3 } from "gl-matrix";

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
    const { alpha, beta, gamma } = data.rotation;

    // Convert degrees to radians
    const radAlpha = (alpha * Math.PI) / 180; // Z-axis (Yaw)
    const radBeta = (beta * Math.PI) / 180; // X-axis (Pitch)
    const radGamma = (gamma * Math.PI) / 180; // Y-axis (Roll)

    // Create a 4x4 rotation matrix
    const R = mat4.create();
    mat4.identity(R);
    mat4.rotateZ(R, R, radAlpha);
    mat4.rotateX(R, R, radBeta);
    mat4.rotateY(R, R, radGamma);

    // Acceleration vector (device frame)
    const accelDevice = vec3.fromValues(ax, ay, az);
    const accelWorld = vec3.create();

    // Transform acceleration vector to world coordinates
    vec3.transformMat4(accelWorld, accelDevice, R);

    // Extract Z acceleration (Earth frame)
    setZAccelWorld(accelWorld[2]); // Get the Z component
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
