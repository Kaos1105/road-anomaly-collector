import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { observer } from "mobx-react";
import { useStore } from "@/stores/stores";
import { useEffect, useRef, useState } from "react";
import { useAnomalyCollect } from "@/hooks/useAnomalyCollect";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { SensorData } from "@/types/common/sensor";

const screenWidth = Dimensions.get("window").width;

const HomeScreen = observer(() => {
  const { commonStore } = useStore();
  const { currentSensorData } = useAnomalyCollect();

  const [gyroData, setGyroData] = useState<number[]>([]);
  const [accelData, setAccelData] = useState<number[]>([]);
  const maxDataPoints = 50; // Display last 200 readings

  const sensorDataRef = useRef<SensorData | null>(null);

  useEffect(() => {
    sensorDataRef.current = currentSensorData;
  }, [currentSensorData]);

  // Update accelData and gyroData every 500ms, only once during component mount
  useEffect(() => {
    const intervalId = setInterval(() => {
      setAccelData((prevAccelData) => {
        const updatedAccelData = [
          ...prevAccelData,
          sensorDataRef.current?.accelMag ?? 0,
        ];
        return updatedAccelData.slice(-maxDataPoints); // Keep only the latest maxDataPoints points
      });

      setGyroData((prevGyroData) => {
        const updatedGyroData = [
          ...prevGyroData,
          sensorDataRef.current?.gyroMag ?? 0,
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
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Road Anomaly Data Collector</ThemedText>

        {/* Display Sensor Values with Corresponding Colors */}
        <ThemedView style={{ marginTop: 20, alignItems: "center" }}>
          <ThemedText style={{ fontSize: 16, color: "red" }}>
            Gyro Magnitude: {sensorDataRef.current?.gyroMag.toFixed(3)}
          </ThemedText>
          <ThemedText style={{ fontSize: 16, color: "green" }}>
            Accel Magnitude: {sensorDataRef.current?.accelMag.toFixed(3)}
          </ThemedText>
        </ThemedView>

        {/* Merged Gyro and Accel Graph */}
        <ScrollView horizontal>
          {commonStore.isLogging && (gyroData.length || accelData.length) ? (
            <LineChart
              data={{
                labels: [], // No labels for the x-axis
                datasets: [
                  {
                    data: accelData,
                    color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // Green for accel data
                    strokeWidth: 2,
                  },
                  {
                    data: gyroData,
                    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red for gyro data
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth * 0.9}
              height={220}
              yAxisLabel="" // Hide y-axis label
              yAxisSuffix="" // Hide y-axis suffix
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                strokeWidth: 2,
                propsForDots: {
                  r: "2",
                  strokeWidth: "1",
                  stroke: "#ffa726",
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          ) : null}
        </ScrollView>

        {/* Toggle Logging Checkbox */}
        <TouchableOpacity
          onPress={() => commonStore.setIsLogging(!commonStore.isLogging)}
          style={styles.button}
        >
          <ThemedView
            style={[
              styles.checkbox,
              {
                backgroundColor: commonStore.isLogging
                  ? "white"
                  : "transparent",
              },
            ]}
          />
          <ThemedText style={{ fontSize: 18, color: "white" }}>
            Enable Data Collection
          </ThemedText>
        </TouchableOpacity>

        {/* Mark Anomalies Button */}
        <TouchableOpacity
          // onPress={markLast5Seconds}
          style={styles.anomalyButton}
        >
          <ThemedText style={{ color: "white", fontWeight: "bold" }}>
            Mark Last 5s as Anomaly
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
});
export default HomeScreen;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "white",
    marginRight: 10,
  },
  anomalyButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
  },
});
