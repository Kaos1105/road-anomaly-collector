import { useStore } from "@/stores/stores";
import { useSQLRecord } from "@/hooks/useSQLRecord";
import { useSound } from "@/hooks/useSound";
import { useSensorData } from "@/hooks/useSensorData";
import { useEffect } from "react";
import { SensorData } from "@/types/common/sensor";
import { useLocation } from "@/hooks/useLocation";

export function useAnomalyCollect() {
  const { commonStore } = useStore();
  const { saveToDatabase } = useSQLRecord();
  const { playBeep } = useSound();
  const { gyroData, accelData, getMagnitudeData } = useSensorData();

  const { getLocation } = useLocation();

  const getSensorData = async (): Promise<SensorData> => {
    const now = new Date();
    const timestamp = now.toISOString();
    const readableTime = now.toLocaleString("en-GB", { timeZone: "UTC" }); // Convert to human-readable format
    const loc = await getLocation();

    // Store data in the circular buffer
    return {
      timestamp,
      recordDateTime: readableTime,
      latitude: loc?.latitude || 0,
      longitude: loc?.longitude || 0,
      gyroMag: getMagnitudeData(gyroData),
      accelMag: getMagnitudeData(accelData),
      markAnomaly: 0,
    };
  };

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
      if (
        currentSensorData.gyroMag > commonStore.gyroThreshold &&
        currentSensorData.accelMag > commonStore.accelThreshold
      ) {
        // await recordAnomaly();
      }
      // Store data in circular buffer
      commonStore.setBufferData(currentSensorData);
    })();
  }, [gyroData, accelData, commonStore.isLogging]);

  const getAccelMag = () => {
    return commonStore.buffer.getData().map((x) => x.accelMag);
  };

  return {
    gyroMag: gyroData ? getMagnitudeData(gyroData) : 0,
    accelMag: accelData ? getMagnitudeData(accelData) : 0,
    getAccelMag,
  };
}
