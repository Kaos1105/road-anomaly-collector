import { useRef } from "react";
import { SensorData } from "@/types/common/sensor";
import { useCommonStore } from "@/stores/commonStore";

type ExtractedData = {
  extractedData: (SensorData | null)[];
  timestamp: number;
};

export function useExtractData() {
  const commonStore = useCommonStore();
  const anomalyQueueRef = useRef<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const extractedAnomalyRef = useRef<ExtractedData[]>([]);

  const processAnomaly = () => {
    if (!anomalyQueueRef.current.length) return;
    const anomalyTime =
      anomalyQueueRef.current[anomalyQueueRef.current.length - 1];
    // Clear the queue after processing
    anomalyQueueRef.current = [];

    extractAnomaly(anomalyTime);
  };

  const extractAnomaly = (anomalyTime: number) => {
    // Extract data based on this timestamp
    const extractedData = commonStore.extractAnomaly(anomalyTime);
    console.log("Extracted Data for Anomaly:", extractedData.length);
    if (extractedData.length > 0) {
      extractedAnomalyRef.current.push({
        extractedData,
        timestamp: anomalyTime,
      });
    }
    setTimeout(() => {
      extractedAnomalyRef.current = [];
    }, 5000);
  };

  const addAnomalyTimestamp = (timestamp: number) => {
    anomalyQueueRef.current.push(timestamp);
    // If a new anomaly arrives within 200ms, reset the timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Wait 200ms before processing anomalies
    timeoutRef.current = setTimeout(() => {
      processAnomaly();
    }, 1000);
  };

  return { addAnomalyTimestamp, extractedAnomalyRef };
}
