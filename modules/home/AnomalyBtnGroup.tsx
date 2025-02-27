import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/button/Button";
import { AnomalyType } from "@/hooks/useAnomalyCollect";

type AnomalyBtnGroupProps = {
  isBtnEnabled: boolean;
  setAnomalyType: (anomalyTime: AnomalyType) => Promise<void>;
};

const AnomalyBtnGroup = ({
  isBtnEnabled,
  setAnomalyType,
}: AnomalyBtnGroupProps) => {
  const handlePress = async (type: AnomalyType) => {
    await setAnomalyType(type);
  };

  return (
    <>
      <ThemedView style={styles.anomalyBtnContainer}>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("NOR");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#93bf9d" }}
        >
          <ThemedText style={styles.anomalyText}>Mark as Normal</ThemedText>
        </Button>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("MANHOLE");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#3b4f7a" }}
        >
          <ThemedText style={styles.anomalyText}>Mark as Manhole</ThemedText>
        </Button>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("BUMP");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#c4c47e" }}
        >
          <ThemedText style={styles.anomalyText}>
            Mark as Speed Bumps
          </ThemedText>
        </Button>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("UNEVEN");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#cca164" }}
        >
          <ThemedText style={styles.anomalyText}>Mark as Uneven</ThemedText>
        </Button>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("POTHOLE");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#e36459" }}
        >
          <ThemedText style={styles.anomalyText}>Mark as Potholes</ThemedText>
        </Button>
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
