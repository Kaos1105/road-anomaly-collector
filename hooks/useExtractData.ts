import { useEffect, useRef, useState } from "react";
import { useStore } from "@/stores/stores";
import { AnomalyType } from "@/hooks/useAnomalyCollect";
import { SensorData } from "@/types/common/sensor";

type ExtractedData = {
  extractedData: (SensorData | null)[];
  timestamp: number;
};

export function useExtractData() {
  const { commonStore } = useStore();
  const anomalyQueueRef = useRef<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const extractedAnomalyRef = useRef<ExtractedData[]>([]);

  const processAnomaly = () => {
    if (anomalyQueueRef.current.length === 0) return;
    // Take the middle timestamp
    const middleIndex = Math.floor(anomalyQueueRef.current.length / 2);
    const anomalyTime = anomalyQueueRef.current[middleIndex];
    // Clear the queue after processing
    anomalyQueueRef.current = [];

    setTimeout(() => {
      extractAnomaly(anomalyTime);
    }, 1000);
  };

  const extractAnomaly = (anomalyTime: number) => {
    // Extract data based on this timestamp
    setTimeout(() => {
      const extractedData = commonStore.extractAnomaly(anomalyTime);
      console.log("Extracted Data for Anomaly:", extractedData.length);
      if (extractedData && extractedData.length > 0) {
        extractedAnomalyRef.current.push({
          extractedData,
          timestamp: anomalyTime,
        });
      }
    }, 0);

    // clear extracted timout if present
    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);

    // Wait 6s before disable button
    clearTimeoutRef.current = setTimeout(() => {
      extractedAnomalyRef.current = [];
    }, 6000);
  };

  const addAnomalyTimestamp = (timestamp: number) => {
    anomalyQueueRef.current.push(timestamp);
    // If a new anomaly arrives within 200ms, reset the timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Wait 500ms before processing anomalies
    timeoutRef.current = setTimeout(() => {
      processAnomaly();
    }, 500);
  };

  return { addAnomalyTimestamp, extractedAnomalyRef };
}
