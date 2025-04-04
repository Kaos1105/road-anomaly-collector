import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/button/Button";
import { useInferenceStore } from "@/stores/inferenceStore";

const DetectedAnomalyBtn = () => {
  const inferenceStore = useInferenceStore();

  return (
    <>
      <ThemedView style={styles.anomalyBtnContainer}>
        <Button
          disabled={!inferenceStore.inferenceLabel.includes("S")}
          title={""}
          onPress={() => {
            // await handlePress("S-BUMP");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#93bf9d" }}
        >
          <ThemedText style={styles.anomalyText}>NHỎ</ThemedText>
        </Button>
        <Button
          disabled={!inferenceStore.inferenceLabel.includes("L")}
          title={""}
          onPress={() => {
            // await handlePress("L-BUMP");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#bd6860" }}
        >
          <ThemedText style={styles.anomalyText}>LỚN</ThemedText>
        </Button>
      </ThemedView>
    </>
  );
};

export default DetectedAnomalyBtn;

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
