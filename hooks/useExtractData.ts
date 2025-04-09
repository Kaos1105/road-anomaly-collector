import { useRef } from "react";
import { SensorData } from "@/types/common/sensor";
import { useCommonStore } from "@/stores/commonStore";
import { useInferenceStore } from "@/stores/inferenceStore";
import { useInference } from "@/hooks/useInference";
import { AnomalyType, saveCSV } from "@/hooks/useAnomalyCollect";
import { useLocation } from "@/hooks/useLocation";

type ExtractedData = {
  extractedData: (SensorData | null)[];
  timestamp: number;
};

export function useExtractData() {
  const commonStore = useCommonStore();
  const inferenceStore = useInferenceStore();
  const { makePrediction } = useInference();
  const { getLocation } = useLocation();
  const anomalyQueueRef = useRef<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const extractedAnomalyRef = useRef<ExtractedData[]>([]);

  const processAnomaly = () => {
    if (!anomalyQueueRef.current.length) return;
    const anomalyTime =
      anomalyQueueRef.current[anomalyQueueRef.current.length - 1];
    // Clear the queue after processing
    anomalyQueueRef.current = [];

    inferAnomaly(anomalyTime).then();
  };

  const mapInferenceData = async (extractedData: (SensorData | null)[]) => {
    const loc = await getLocation();
    return extractedData
      .filter((x) => !!x)
      .map((x) => {
        return {
          ...x,
          latitude: loc.latitude,
          longitude: loc.longitude,
        };
      });
  };

  const inferAnomaly = async (anomalyTime: number) => {
    // Extract data based on this timestamp
    const extractedData = commonStore.extractAnomaly(anomalyTime);
    const mappedInference = await mapInferenceData(extractedData);
    if (mappedInference.length > 0) {
      const label = await makePrediction(mappedInference);
      inferenceStore.setInferenceLabel(label ?? "");
      await saveCSV(
        mappedInference,
        anomalyTime,
        (label as AnomalyType) ?? "UNKNOWN",
      );
    }
    setTimeout(() => {
      inferenceStore.setInferenceLabel("");
    }, 2000);
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
