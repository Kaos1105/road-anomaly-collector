import { useEffect, useRef } from "react";
import { useExtractData } from "@/hooks/useExtractData";
import { AccelerometerMeasurement, GyroscopeMeasurement } from "expo-sensors";
import { SensorData } from "@/types/common/sensor";
import { useCommonStore } from "@/stores/commonStore";
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from "react-native-sensors";
import { AnomalyType, saveCSV } from "@/helper/commonHelper";

export function useAnomalyCollect() {
  const commonStore = useCommonStore();
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

  const getMagnitudeData = (
    data: GyroscopeMeasurement | AccelerometerMeasurement | null,
  ) => {
    if (!data) return 0;
    return Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
  };

  const recordAnomaly = (anomalyTimestamp: number) => {
    // playBeep(); // Play sound when anomaly is detected
    addAnomalyTimestamp(anomalyTimestamp);
  };

  const saveExtracted = async (anomalyTime: AnomalyType) => {
    let saveTasks: Promise<string | undefined>[] = [];
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
