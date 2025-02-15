import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { observer } from "mobx-react";
import { useStore } from "@/stores/stores";
import { useSQLRecord } from "@/hooks/useSQLRecord";
import { useEffect, useState } from "react";
import { useAnomalyCollect } from "@/hooks/useAnomalyCollect";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const HomeScreen = observer(() => {
  const { commonStore } = useStore();
  const { markLast5Seconds } = useSQLRecord();
  const { gyroMag, accelMag } = useAnomalyCollect();

  const [gyroData, setGyroData] = useState<number[]>([]);
  const [accelData, setAccelData] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const maxDataPoints = 50; // Display last 50 readings

  console.log(gyroData);
  useEffect(() => {
    const now = new Date();
    const timeLabel = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    setGyroData((prev) => [...prev.slice(-maxDataPoints + 1), gyroMag]);
    setAccelData((prev) => [...prev.slice(-maxDataPoints + 1), accelMag]);
    setTimestamps((prev) => [...prev.slice(-maxDataPoints + 1), timeLabel]);
  }, [gyroMag, accelMag]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}>
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Road Anomaly Data Collector</ThemedText>

        {/* Display Sensor Values */}
        <ThemedView style={{ marginTop: 20, alignItems: "center" }}>
          <ThemedText style={{ fontSize: 16 }}>
            Gyro Magnitude: {gyroMag.toFixed(3)}
          </ThemedText>
          <ThemedText style={{ fontSize: 16 }}>
            Accel Magnitude: {accelMag.toFixed(3)}
          </ThemedText>
        </ThemedView>

        {/* Gyro and Accel Graph */}
        <ScrollView horizontal>
          <LineChart
            data={{
              labels: ["January", "February", "March", "April", "May", "June"],
              datasets: [
                {
                  data: [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                  ],
                },
              ],
            }}
            width={screenWidth * 0.9}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              strokeWidth: 2,
              propsForDots: {
                r: "3",
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
          onPress={markLast5Seconds}
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
