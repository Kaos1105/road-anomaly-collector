import { StyleSheet, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAnomalyCollect } from "@/hooks/useAnomalyCollect";
import AnomalyBtnGroup from "@/modules/home/AnomalyBtnGroup";
import LogCheckBox from "@/modules/home/LogCheckBox";
import { useEffect, useRef } from "react";

const HomeScreen = () => {
  const { currentSensorDataRef, saveExtracted, isDisableBtn } =
    useAnomalyCollect();

  // Use refs to avoid re-renders
  const latestDataRef = useRef({ accel: 0, gyro: 0 }); // Store latest values without triggering re-render

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update ref without triggering re-render
      latestDataRef.current.accel = currentSensorDataRef.current?.accelMag ?? 0;
      latestDataRef.current.gyro = currentSensorDataRef.current?.gyroMag ?? 0;
    }, 500); // Reduced frequency

    return () => clearInterval(intervalId);
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
            Gyro Magnitude: {latestDataRef.current.gyro?.toFixed(3)}
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={{ fontSize: 16, color: "green" }}
          >
            Accel Magnitude: {latestDataRef.current.accel?.toFixed(3)}
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
          isBtnEnabled={isDisableBtn}
          setAnomalyType={saveExtracted}
        />
      </ThemedView>
    </ScrollView>
  );
};
export default HomeScreen;

const styles = StyleSheet.create({});
