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
          disabled={!inferenceStore.inferenceLabel.includes("S-BUMP")}
          title={""}
          onPress={async () => {}}
          style={{ ...styles.anomalyButton, backgroundColor: "#93bf9d" }}
        >
          <ThemedText style={styles.anomalyText}>Giảm Tốc NHỎ</ThemedText>
        </Button>
        <Button
          disabled={!inferenceStore.inferenceLabel.includes("L-BUMP")}
          title={""}
          onPress={async () => {}}
          style={{ ...styles.anomalyButton, backgroundColor: "#5b8f67" }}
        >
          <ThemedText style={styles.anomalyText}>Giảm Tốc LỚN</ThemedText>
        </Button>
        <Button
          disabled={!inferenceStore.inferenceLabel.includes("S-MANHOLE")}
          title={""}
          style={{ ...styles.anomalyButton, backgroundColor: "#c4c47e" }}
        >
          <ThemedText style={styles.anomalyText}>Hố Ga NHỎ</ThemedText>
        </Button>
        <Button
          disabled={!inferenceStore.inferenceLabel.includes("L-MANHOLE")}
          title={""}
          style={{ ...styles.anomalyButton, backgroundColor: "#cca164" }}
        >
          <ThemedText style={styles.anomalyText}>Hố Ga LỚN</ThemedText>
        </Button>
        <Button
          disabled={!inferenceStore.inferenceLabel.includes("S-UNEVEN")}
          title={""}
          style={{ ...styles.anomalyButton, backgroundColor: "#bd6860" }}
        >
          <ThemedText style={styles.anomalyText}>Gồ Ghề NHỎ</ThemedText>
        </Button>
        <Button
          disabled={!inferenceStore.inferenceLabel.includes("L-UNEVEN")}
          title={""}
          style={{ ...styles.anomalyButton, backgroundColor: "#eb766c" }}
        >
          <ThemedText style={styles.anomalyText}>Gồ Ghề LỚN</ThemedText>
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
