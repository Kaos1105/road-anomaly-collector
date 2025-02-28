import { StyleSheet, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAnomalyCollect } from "@/hooks/useAnomalyCollect";
import AnomalyBtnGroup from "@/modules/home/AnomalyBtnGroup";
import LogCheckBox from "@/modules/home/LogCheckBox";
import { useEffect, useState } from "react";

const HomeScreen = () => {
  const { currentSensorDataRef, saveExtracted, isMarkBtnEnabled } =
    useAnomalyCollect();
  const [accelData, setAccelData] = useState<number>();
  const [gyroData, setGyroData] = useState<number>();

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update refs (stores data without triggering re-renders)
      setAccelData(currentSensorDataRef.current?.accelMag ?? 0);
      setGyroData(currentSensorDataRef.current?.gyroMag ?? 0);
    }, 500); // Update UI every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

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
            Gyro Magnitude: {gyroData?.toFixed(3)}
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={{ fontSize: 16, color: "green" }}
          >
            Accel Magnitude: {accelData?.toFixed(3)}
          </ThemedText>
        </ThemedView>

        {/*{commonStore.isLogging &&*/}
        {/*(gyroDataRef.current.length || accelDataRef.current.length) ? (*/}
        {/*  <SensorGraph*/}
        {/*    accelData={accelDataRef.current}*/}
        {/*    gyroData={gyroDataRef.current}*/}
        {/*  />*/}
        {/*) : null}*/}

        <LogCheckBox />

        <AnomalyBtnGroup
          isBtnEnabled={isMarkBtnEnabled}
          setAnomalyType={saveExtracted}
        />
      </ThemedView>
    </ScrollView>
  );
};
export default HomeScreen;

const styles = StyleSheet.create({});
