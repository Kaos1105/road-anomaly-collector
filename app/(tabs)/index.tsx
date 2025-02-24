import { StyleSheet, ScrollView, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { observer } from "mobx-react";
import { useStore } from "@/stores/stores";
import { useEffect, useState } from "react";
import { useAnomalyCollect } from "@/hooks/useAnomalyCollect";
import SensorGraph from "@/modules/home/SensorGraph";
import AnomalyBtnGroup from "@/modules/home/AnomalyBtnGroup";
import LogCheckBox from "@/modules/home/LogCheckBox";
import LineChart from "react-native-chart-kit/dist/line-chart/LineChart";

const HomeScreen = observer(() => {
  const { commonStore } = useStore();
  const { currentSensorDataRef } = useAnomalyCollect();

  const [gyroData, setGyroData] = useState<number[]>([]);
  const [accelData, setAccelData] = useState<number[]>([]);
  const maxDataPoints = 50; // Display last 200 readings

  // Update accelData and gyroData every 500ms, only once during component mount
  useEffect(() => {
    const intervalId = setInterval(() => {
      setAccelData((prevAccelData) => {
        const updatedAccelData = [
          ...prevAccelData,
          currentSensorDataRef.current?.accelMag ?? 0,
        ];
        return updatedAccelData.slice(-maxDataPoints); // Keep only the latest maxDataPoints points
      });

      setGyroData((prevGyroData) => {
        const updatedGyroData = [
          ...prevGyroData,
          currentSensorDataRef.current?.gyroMag ?? 0,
        ];
        return updatedGyroData.slice(-maxDataPoints); // Keep only the latest maxDataPoints points
      });
    }, 100);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array, so it runs only once during mount

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}>
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 30,
          width: "100%",
        }}
      >
        <ThemedText type="subtitle" style={{ fontSize: 20 }}>
          Road Anomaly Data Collector
        </ThemedText>

        {/* Display Sensor Values with Corresponding Colors */}
        <ThemedView style={{ marginTop: 10, alignItems: "center" }}>
          <ThemedText
            type="defaultSemiBold"
            style={{ fontSize: 16, color: "red" }}
          >
            Gyro Magnitude: {currentSensorDataRef.current?.gyroMag.toFixed(3)}
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={{ fontSize: 16, color: "green" }}
          >
            Accel Magnitude: {currentSensorDataRef.current?.accelMag.toFixed(3)}
          </ThemedText>
        </ThemedView>

        {commonStore.isLogging && (gyroData.length || accelData.length) ? (
          <SensorGraph accelData={accelData} gyroData={gyroData} />
        ) : null}
        <LogCheckBox />

        <AnomalyBtnGroup />
      </ThemedView>
    </ScrollView>
  );
});
export default HomeScreen;

const styles = StyleSheet.create({});
