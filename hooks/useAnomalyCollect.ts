import { useStore } from "@/stores/stores";
import { useSound } from "@/hooks/useSound";
import { useSensorData } from "@/hooks/useSensorData";
import { useEffect, useState } from "react";
import { SensorData } from "@/types/common/sensor";
import { useLocation } from "@/hooks/useLocation";
import { useExtractData } from "@/hooks/useExtractData";

export function useAnomalyCollect() {
  const { commonStore } = useStore();
  const { playBeep } = useSound();
  const { gyroData, accelData, getMagnitudeData } = useSensorData();
  const [currentSensorData, setCurrentSensorData] = useState<SensorData | null>(
    null,
  );
  const { getLocation } = useLocation();
  const { setAnomalyQueue } = useExtractData();

  const getSensorData = async (): Promise<SensorData> => {
    const now = new Date();
    const timestamp = now.getTime();
    const readableTime = now.toLocaleString("en-GB", { timeZone: "UTC" }); // Convert to human-readable format
    // const loc = await getLocation();
    // Store data in the circular buffer
    return {
      timestamp,
      recordDateTime: readableTime,
      latitude: 0,
      longitude: 0,
      gyroMag: gyroData ? getMagnitudeData(gyroData) : 0,
      accelMag: accelData ? getMagnitudeData(accelData) : 0,
      markAnomaly: 0,
    };
  };

  const recordAnomaly = async (anomalyTimestamp: number) => {
    await playBeep(); // Play sound when anomaly is detected
    // Push the anomaly timestamp to the queue
    // setAnomalyQueue((prevQueue) => [...prevQueue, anomalyTimestamp]);
  };

  // Check if an anomaly is detected
  useEffect(() => {
    (async () => {
      if (!commonStore.isLogging) return;
      const currentData = await getSensorData();
      setCurrentSensorData(currentData);
      if (
        currentData.gyroMag > commonStore.gyroThreshold &&
        currentData.accelMag > commonStore.accelThreshold
      ) {
        await recordAnomaly(currentData.timestamp);
      }

      commonStore.setBufferData(currentData);
      // console.log(currentData);
    })();
  }, [accelData?.timestamp, commonStore.isLogging]);

  return {
    currentSensorData,
  };
}
