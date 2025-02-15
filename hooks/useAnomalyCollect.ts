import { useStore } from "@/stores/stores";
import { useSQLRecord } from "@/hooks/useSQLRecord";
import { useSound } from "@/hooks/useSound";
import { useSensorData } from "@/hooks/useSensorData";
import { useEffect, useRef } from "react";
import { SensorData } from "@/types/common/sensor";
import { useLocation } from "@/hooks/useLocation";
import { useCircularBuffer } from "@/hooks/useCircularBuffer";

export function useAnomalyCollect() {
  const { commonStore } = useStore();
  const { saveToDatabase } = useSQLRecord();
  const { playBeep } = useSound();
  const { gyroData, accelData, getMagnitudeData } = useSensorData();
  const prevDataRef = useRef<SensorData | null>(null);
  const { getLocation } = useLocation();
  const { buffer, getSensorData } = useCircularBuffer();

  const recordAnomaly = async () => {
    if (!commonStore.isLogging) return;

    await saveToDatabase();
    await playBeep();
  };

  // Check if an anomaly is detected
  useEffect(() => {
    (async () => {
      if (!commonStore.isLogging || !gyroData || !accelData) return;

      const currentSensorData = await getSensorData();

      // Check rate of change (if prevData exists)
      if (prevDataRef.current) {
        const deltaGyro = Math.abs(
          currentSensorData.gyroMag - prevDataRef.current.gyroMag,
        );
        const deltaAccel = Math.abs(
          currentSensorData.accelMag - prevDataRef.current.accelMag,
        );

        if (
          deltaGyro > commonStore.gyroThreshold ||
          deltaAccel > commonStore.accelThreshold
        ) {
          await recordAnomaly();
        }
      }
      // Update previous data reference
      prevDataRef.current = {
        ...currentSensorData,
      };
      // Store data in circular buffer
      buffer.add(prevDataRef.current);
    })();
  }, [gyroData, accelData, commonStore.isLogging]);

  return {
    gyroMag: gyroData ? getMagnitudeData(gyroData) : 0,
    accelMag: accelData ? getMagnitudeData(accelData) : 0,
  };
}
