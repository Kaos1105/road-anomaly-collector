import { SensorData } from "@/types/common/sensor";
import * as FileSystem from "expo-file-system";

export type AnomalyType =
  | "UNKNOWN"
  | "S-MANHOLE"
  | "L-MANHOLE"
  | "S-BUMP"
  | "L-BUMP"
  | "S-UNEVEN"
  | "L-UNEVEN";
export const saveCSV = async (
  data: Array<SensorData | null>,
  anomalyTime: number,
  anomalyType: AnomalyType,
) => {
  try {
    const filePath = `${FileSystem.documentDirectory}${anomalyTime}_${anomalyType}_anomaly.csv`;
    const header =
      [
        "timestamp",
        "recordDateTime",
        "gyroMag",
        "accelMag",
        "latitude",
        "longitude",
      ].join(",") + "\n";

    const rows = data
      .map((item) =>
        [
          item?.timestamp ?? "",
          item?.recordDateTime ?? "",
          item?.gyroMag ?? "",
          item?.accelMag ?? "",
          item?.latitude ?? "",
          item?.longitude ?? "",
        ].join(","),
      )
      .join("\n");
    const csvContent = header + rows;
    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    console.log(`CSV file saved successfully at: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Error saving data to CSV:", error);
  }
};
