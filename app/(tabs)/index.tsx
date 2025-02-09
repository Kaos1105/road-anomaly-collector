import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { observer } from "mobx-react";
import { useStore } from "@/stores/stores";
import { useSQLRecord } from "@/hooks/useSQLRecord";
import { useEffect } from "react";
import { useSensorData } from "@/hooks/useSensorData";

const HomeScreen = observer(() => {
  const { commonStore } = useStore();
  const { markLast5Seconds } = useSQLRecord();
  const { zAccelWorld } = useSensorData();

  useEffect(() => {
    console.log(commonStore.isLogging);
  }, [commonStore.isLogging]);
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ThemedText>Road Anomaly Data Collector</ThemedText>

      {/* Display Sensor Values */}
      <ThemedView style={{ marginTop: 20, alignItems: "center" }}>
        {/*<ThemedText style={{ fontSize: 16 }}>*/}
        {/*  Gyro Magnitude: {gyroMag.toFixed(3)}*/}
        {/*</ThemedText>*/}
        {/*<ThemedText style={{ fontSize: 16 }}>*/}
        {/*  Accel Magnitude: {accelMag.toFixed(3)}*/}
        {/*</ThemedText>*/}
        <ThemedText style={{ fontSize: 16 }}>
          Z Acceleration: {zAccelWorld.toFixed(3)}
        </ThemedText>
      </ThemedView>

      {/* Toggle Logging Checkbox */}
      <TouchableOpacity
        onPress={() => commonStore.setIsLogging(!commonStore.isLogging)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 20,
          padding: 10,
        }}
      >
        <ThemedView
          style={{
            width: 30,
            height: 30,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: "white",
            backgroundColor: commonStore.isLogging ? "white" : "transparent",
            marginRight: 10,
          }}
        />
        <ThemedText style={{ fontSize: 18, color: "white" }}>
          Enable Data Collection
        </ThemedText>
      </TouchableOpacity>

      {/* Mark Anomalies Button */}
      <TouchableOpacity
        onPress={markLast5Seconds}
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: "red",
          borderRadius: 5,
        }}
      >
        <ThemedText style={{ color: "white", fontWeight: "bold" }}>
          Mark Last 5s as Anomaly
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
});
export default HomeScreen;

const styles = StyleSheet.create({});
