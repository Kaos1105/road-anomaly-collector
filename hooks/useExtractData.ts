import { useEffect, useRef } from "react";
import * as FileSystem from "expo-file-system";
import { useStore } from "@/stores/stores";
import { SensorData } from "@/types/common/sensor";

const saveCSV = async (data: Array<SensorData | null>, anomalyTime: number) => {
  try {
    const filePath = `${FileSystem.documentDirectory}${anomalyTime}_anomaly.csv`;
    const header =
      [
        "timestamp",
        "recordDateTime",
        "latitude",
        "longitude",
        "gyroMag",
        "accelMag",
        "markAnomaly",
      ].join(",") + "\n";

    const rows = data
      .map((item) =>
        [
          item?.timestamp ?? "",
          item?.recordDateTime ?? "",
          item?.latitude ?? "",
          item?.longitude ?? "",
          item?.gyroMag ?? "",
          item?.accelMag ?? "",
          item?.markAnomaly ?? "",
        ].join(","),
      )
      .join("\n");

    const csvContent = header + rows;
    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log(`CSV file saved successfully at: ${filePath}`);
  } catch (error) {
    console.error("Error saving data to CSV:", error);
  }
};

export function useExtractData() {
  const { commonStore } = useStore();
  const anomalyQueueRef = useRef<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processAnomaly = () => {
    if (anomalyQueueRef.current.length === 0) return;
    console.log(anomalyQueueRef.current.length);
    // Take the middle timestamp
    const middleIndex = Math.floor(anomalyQueueRef.current.length / 2);
    const anomalyTime = anomalyQueueRef.current[middleIndex];

    // Extract data based on this timestamp
    const extractedData = commonStore.extractAnomaly(anomalyTime);
    console.log("Extracted Data for Anomaly:", extractedData);

    if (extractedData && extractedData.length > 0) {
      // await saveCSV(extractedData, anomalyTime);
    }

    // Clear the queue after processing
    anomalyQueueRef.current = [];
  };

  const addAnomalyTimestamp = (timestamp: number) => {
    anomalyQueueRef.current.push(timestamp);
    // If a new anomaly arrives within 200ms, reset the timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Wait 200ms before processing anomalies
    timeoutRef.current = setTimeout(async () => {
      processAnomaly();
    }, 200);
  };

  return { addAnomalyTimestamp };
}
