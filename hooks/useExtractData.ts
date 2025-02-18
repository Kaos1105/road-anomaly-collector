import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system"; // Import Expo FileSystem API
import { useStore } from "@/stores/stores";
import { SensorData } from "@/types/common/sensor"; // Assuming you have SensorData type

const saveCSV = async (data: Array<SensorData | null>, anomalyTime: number) => {
  try {
    // Define the file path and name using the timestamp
    const filePath = `${FileSystem.documentDirectory}${anomalyTime}_anomaly.csv`;
    // Prepare the data rows
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
    // Prepare the data rows
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

    // Combine header and rows to create the full CSV content
    const csvContent = header + rows;
    // Write the CSV content to the file system
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
  const [anomalyQueue, setAnomalyQueue] = useState<number[]>([]);

  // Process anomalies (extract ±1s data)
  useEffect(() => {
    (async () => {
      await processAnomaly();
    })();
  }, [anomalyQueue]);

  const processAnomaly = async () => {
    if (anomalyQueue.length === 0) return;
    const anomalyTime = anomalyQueue[0]; // Get the first anomaly timestamp
    // Extract data 1 second before & after
    const extractedData = commonStore.extractAnomaly(anomalyTime);
    console.log("Extracted Data for Anomaly:", extractedData);
    // Save extracted data as CSV
    await saveCSV(extractedData, anomalyTime);
    // Remove processed anomaly from queue
    setAnomalyQueue((prevQueue) => prevQueue.slice(1));
  };

  return { setAnomalyQueue };
}
