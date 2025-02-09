import { useStore } from "@/stores/stores";
import { useSQLRecord } from "@/hooks/useSQLRecord";
import { useSound } from "@/hooks/useSound";
import { useSensorData } from "@/hooks/useSensorData";
import { useEffect } from "react";

export function useAnomalyCollect() {
  const { commonStore } = useStore();
  const { saveToDatabase } = useSQLRecord();
  const { playBeep } = useSound();
  const { gyroData, accelData, gyroMag, accelMag } = useSensorData();

  const recordAnomaly = async () => {
    if (!commonStore.isLogging) return;

    await saveToDatabase();
    await playBeep();
  };

  // Check if an anomaly is detected
  useEffect(() => {
    (async () => {
      if (!commonStore.isLogging || !gyroData || !accelData) return;
      if (
        gyroMag(gyroData) > commonStore.gyroThreshold ||
        accelMag(accelData) > commonStore.gyroThreshold
      ) {
        await recordAnomaly();
      }
    })();
  }, [gyroData, accelData, commonStore.isLogging]);

  return {
    gyroMag: gyroData ? gyroMag(gyroData) : 0,
    accelMag: accelData ? accelMag(accelData) : 0,
  };
}
