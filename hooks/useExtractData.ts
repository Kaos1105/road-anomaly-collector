import { useRef } from "react";
import { useStore } from "@/stores/stores";
import { SensorData } from "@/types/common/sensor";

type ExtractedData = {
  extractedData: (SensorData | null)[];
  timestamp: number;
};

export function useExtractData() {
  const { commonStore } = useStore();
  const anomalyQueueRef = useRef<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const anomalyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const extractedAnomalyRef = useRef<ExtractedData[]>([]);
  const isProcessingRef = useRef(false); // Prevent overlapping processing

  const processAnomaly = () => {
    if (anomalyQueueRef.current.length === 0 || isProcessingRef.current) return;
    isProcessingRef.current = true; // Lock processing
    // Take the middle timestamp
    const middleIndex = Math.floor(anomalyQueueRef.current.length / 2);
    const anomalyTime = anomalyQueueRef.current[middleIndex];
    // Clear the queue after processing
    anomalyQueueRef.current = [];

    if (anomalyTimeoutRef.current) clearTimeout(anomalyTimeoutRef.current);
    anomalyTimeoutRef.current = setTimeout(() => {
      extractAnomaly(anomalyTime);
      isProcessingRef.current = false; // Unlock after completion
    }, 1000);
  };

  const extractAnomaly = (anomalyTime: number) => {
    // Extract data based on this timestamp
    const extractedData = commonStore.extractAnomaly(anomalyTime);
    console.log("Extracted Data for Anomaly:", extractedData.length);
    if (extractedData && extractedData.length > 0) {
      extractedAnomalyRef.current.push({
        extractedData,
        timestamp: anomalyTime,
      });
    }

    // clear timeout if present
    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    // Wait 5s before disable button
    clearTimeoutRef.current = setTimeout(() => {
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
    }, 200);
  };

  return { addAnomalyTimestamp, extractedAnomalyRef };
}
