import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
type IProps = {
  accelData: number[];
  gyroData: number[];
};

const SensorGraph = ({ accelData, gyroData }: IProps) => {
  return (
    <>
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
          backgroundColor: "#3b507a",
          backgroundGradientFrom: "#4c6395",
          backgroundGradientTo: "#6d88c0",
          // backgroundColor: "#e26a00",
          // backgroundGradientFrom: "#fb8c00",
          // backgroundGradientTo: "#ffa726",
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
    </>
  );
};

export default SensorGraph;
