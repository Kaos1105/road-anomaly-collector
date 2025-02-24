import { useStore } from "@/stores/stores";
import { useSound } from "@/hooks/useSound";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import { useExtractData } from "@/hooks/useExtractData";
import {
  Accelerometer,
  AccelerometerMeasurement,
  Gyroscope,
  GyroscopeMeasurement,
} from "expo-sensors";
import { SensorData } from "@/types/common/sensor";

export function useAnomalyCollect() {
  const { commonStore } = useStore();
  const { playBeep } = useSound();
  const { getLocation } = useLocation();
  const { addAnomalyTimestamp } = useExtractData();

  const gyroDataRef = useRef<GyroscopeMeasurement | null>(null);
  const accelDataRef = useRef<AccelerometerMeasurement | null>(null);
  const currentSensorDataRef = useRef<SensorData | null>(null);

  const getSensorData = (
    accelData: AccelerometerMeasurement | null,
    gyroData: GyroscopeMeasurement | null,
  ): SensorData => {
    const now = new Date();
    const timestamp = now.getTime();
    const readableTime = now.toLocaleString("en-GB", { timeZone: "UTC" }); // Convert to human-readable format
    // const loc = await getLocation();
    // Store data in the circular buffer
    return {
      timestamp: timestamp,
      recordDateTime: readableTime,
      latitude: 0,
      longitude: 0,
      gyroMag: gyroData ? getMagnitudeData(gyroData) : 0,
      accelMag: accelData ? getMagnitudeData(accelData) : 0,
      markAnomaly: 0,
    };
  };

  useEffect(() => {
    if (!commonStore.isLogging) {
      return;
    }
    // Subscribe to sensors
    Gyroscope.setUpdateInterval(5); // 5ms per sample
    Accelerometer.setUpdateInterval(5);

    const gyroSub = Gyroscope.addListener((data) => {
      // console.log("gyro timestamp", data.timestamp);
      gyroDataRef.current = data;
    });
    const accelSub = Accelerometer.addListener((data) => {
      if (!commonStore.isLogging) return;
      if (data || gyroDataRef.current) {
        currentSensorDataRef.current = getSensorData(data, gyroDataRef.current);
        if (
          currentSensorDataRef.current?.gyroMag > commonStore.gyroThreshold &&
          currentSensorDataRef.current?.accelMag > commonStore.accelThreshold
        ) {
          recordAnomaly(currentSensorDataRef.current.timestamp);
        }
        commonStore.setBufferData(currentSensorDataRef.current);
      }
    });

    return () => {
      gyroSub.remove();
      accelSub.remove();
    };
  }, [commonStore.isLogging]);

  const getMagnitudeData = (
    data: GyroscopeMeasurement | AccelerometerMeasurement | null,
  ) => {
    if (!data) return 0;
    return Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
  };

  const recordAnomaly = (anomalyTimestamp: number) => {
    playBeep(); // Play sound when anomaly is detected
    // Push the anomaly timestamp to the queue
    addAnomalyTimestamp(anomalyTimestamp);
  };

  return {
    currentSensorDataRef,
  };
}
