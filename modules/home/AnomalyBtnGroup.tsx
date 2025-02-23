import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const AnomalyBtnGroup = () => {
  return (
    <>
      <ThemedView style={styles.anomalyBtnContainer}>
        <TouchableOpacity
          // onPress={markLast5Seconds}
          style={{ ...styles.anomalyButton, backgroundColor: "#93bf9d" }}
        >
          <ThemedText style={styles.anomalyText}>Mark as Normal</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          // onPress={markLast5Seconds}
          style={{ ...styles.anomalyButton, backgroundColor: "#c4c47e" }}
        >
          <ThemedText style={styles.anomalyText}>
            Mark as Speed Bumps
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          // onPress={markLast5Seconds}
          style={{ ...styles.anomalyButton, backgroundColor: "#cca164" }}
        >
          <ThemedText style={styles.anomalyText}>Mark as Uneven</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          // onPress={markLast5Seconds}
          style={{ ...styles.anomalyButton, backgroundColor: "#e36459" }}
        >
          <ThemedText style={styles.anomalyText}>Mark as Potholes</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </>
  );
};

export default AnomalyBtnGroup;

const styles = StyleSheet.create({
  anomalyBtnContainer: {
    display: "flex",
    width: "75%",
    marginBottom: 15,
  },
  anomalyButton: {
    height: 55,
    marginTop: 15,
    padding: 10,
    borderRadius: 5,
    elevation: 15,
    display: "flex",
    justifyContent: "center",
  },
  anomalyText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    textAlignVertical: "center",
  },
});
