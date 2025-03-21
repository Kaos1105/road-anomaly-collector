import { useEffect, useRef } from "react";
import { useExtractData } from "@/hooks/useExtractData";
import { AccelerometerMeasurement, GyroscopeMeasurement } from "expo-sensors";
import { SensorData } from "@/types/common/sensor";
import * as FileSystem from "expo-file-system";
import { useCommonStore } from "@/stores/commonStore";
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from "react-native-sensors";

export type AnomalyType =
  | "S-MANHOLE"
  | "L-MANHOLE"
  | "S-BUMP"
  | "L-BUMP"
  | "S-UNEVEN"
  | "L-UNEVEN";
const saveCSV = async (
  data: Array<SensorData | null>,
  anomalyTime: number,
  anomalyType: AnomalyType,
) => {
  try {
    const filePath = `${FileSystem.documentDirectory}${anomalyTime}_${anomalyType}_anomaly.csv`;
    const header =
      ["timestamp", "recordDateTime", "gyroMag", "accelMag"].join(",") + "\n";

    const rows = data
      .map((item) =>
        [
          item?.timestamp ?? "",
          item?.recordDateTime ?? "",
          item?.gyroMag ?? "",
          item?.accelMag ?? "",
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

export function useAnomalyCollect() {
  const commonStore = useCommonStore();
  // const { playBeep } = useSound();
  // const { getLocation } = useLocation();
  const { addAnomalyTimestamp, extractedAnomalyRef } = useExtractData();

  const gyroDataRef = useRef<GyroscopeMeasurement | null>(null);
  // const accelDataRef = useRef<AccelerometerMeasurement | null>(null);
  const currentSensorDataRef = useRef<SensorData | null>(null);

  const getSensorData = (
    accelData: AccelerometerMeasurement | null,
    gyroData: GyroscopeMeasurement | null,
  ): SensorData => {
    const now = new Date();
    const timestamp = now.getTime();
    const date = now.toLocaleDateString("en-GB", { timeZone: "UTC" });
    const time = now.toLocaleTimeString("en-GB", {
      timeZone: "UTC",
      hour12: false,
    });

    const readableTime = `${date} ${time}`;
    // const loc = await getLocation();
    // Store data in the circular buffer
    return {
      timestamp: timestamp,
      recordDateTime: readableTime,
      latitude: 0,
      longitude: 0,
      gyroMag: gyroData ? getMagnitudeData(gyroData) : 0,
      accelMag: accelData ? getMagnitudeData(accelData) : 0,
      markAnomaly: 0,
    };
  };

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 20); // defaults to 100ms
    setUpdateIntervalForType(SensorTypes.gyroscope, 20); // defaults to 100ms

    const gyroSub = gyroscope.subscribe((x) => {
      if (!commonStore.isLogging) {
        return;
      }
      gyroDataRef.current = x;
    });
    const accelSub = accelerometer.subscribe((x) => {
      if (!commonStore.isLogging) {
        return;
      }
      const sensorData = getSensorData(x, gyroDataRef.current);
      currentSensorDataRef.current = sensorData;
      const { gyroMag, accelMag, timestamp } = sensorData;

      const willRecordAnomaly = commonStore.isAndCondition
        ? gyroMag > commonStore.gyroThreshold &&
          accelMag > commonStore.accelThreshold
        : gyroMag > commonStore.gyroThreshold ||
          accelMag > commonStore.accelThreshold;

      // console.log(willRecordAnomaly);
      if (willRecordAnomaly) {
        recordAnomaly(timestamp);
      }

      commonStore.setBufferData(sensorData);
    });

    return () => {
      gyroSub.unsubscribe();
      accelSub.unsubscribe();
    };
  }, [commonStore.isLogging]);

  // useEffect(() => {
  //   if (!commonStore.isLogging) {
  //     return;
  //   }
  //   // Subscribe to sensors
  //   Gyroscope.setUpdateInterval(20); // 5ms per sample
  //   Accelerometer.setUpdateInterval(20);
  //
  //   const gyroSub = Gyroscope.addListener((data) => {
  //     gyroDataRef.current = data;
  //   });
  //   const accelSub = Accelerometer.addListener((data) => {
  //     //TODO: freeze when overload
  //     if (!commonStore.isLogging || (!data && !gyroDataRef.current)) return;
  //
  //     const sensorData = getSensorData(data, gyroDataRef.current);
  //     currentSensorDataRef.current = sensorData;
  //     const { gyroMag, accelMag, timestamp } = sensorData;
  //
  //     const willRecordAnomaly = commonStore.isAndCondition
  //       ? gyroMag > commonStore.gyroThreshold &&
  //         accelMag > commonStore.accelThreshold
  //       : gyroMag > commonStore.gyroThreshold ||
  //         accelMag > commonStore.accelThreshold;
  //
  //     if (willRecordAnomaly) {
  //       recordAnomaly(timestamp);
  //     }
  //
  //     commonStore.setBufferData(sensorData);
  //   });
  //
  //   return () => {
  //     gyroSub.remove();
  //     accelSub.remove();
  //   };
  // }, [commonStore.isLogging]);

  const getMagnitudeData = (
    data: GyroscopeMeasurement | AccelerometerMeasurement | null,
  ) => {
    if (!data) return 0;
    return Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
  };

  const recordAnomaly = (anomalyTimestamp: number) => {
    // playBeep(); // Play sound when anomaly is detected
    // Push the anomaly timestamp to the queue
    addAnomalyTimestamp(anomalyTimestamp);
  };

  const saveExtracted = async (anomalyTime: AnomalyType) => {
    let saveTasks: Promise<void>[] = [];
    extractedAnomalyRef.current.forEach((val) => {
      saveTasks.push(saveCSV(val.extractedData, val.timestamp, anomalyTime));
    });
    await Promise.all(saveTasks);
    extractedAnomalyRef.current = [];
  };

  return {
    currentSensorDataRef,
    saveExtracted,
    extractedAnomalyRef,
  };
}
