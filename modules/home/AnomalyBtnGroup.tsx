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
            await handlePress("S-BUMP");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#93bf9d" }}
        >
          <ThemedText style={styles.anomalyText}>Giảm Tốc NHỎ</ThemedText>
        </Button>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("L-BUMP");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#5b8f67" }}
        >
          <ThemedText style={styles.anomalyText}>Giảm Tốc LỚN</ThemedText>
        </Button>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("S-MANHOLE");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#c4c47e" }}
        >
          <ThemedText style={styles.anomalyText}>Hố Ga NHỎ</ThemedText>
        </Button>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("L-MANHOLE");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#cca164" }}
        >
          <ThemedText style={styles.anomalyText}>Hố Ga LỚN</ThemedText>
        </Button>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("S-UNEVEN");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#bd6860" }}
        >
          <ThemedText style={styles.anomalyText}>Gồ Ghề NHỎ</ThemedText>
        </Button>
        <Button
          disabled={!isBtnEnabled}
          title={""}
          onPress={async () => {
            await handlePress("L-UNEVEN");
          }}
          style={{ ...styles.anomalyButton, backgroundColor: "#eb766c" }}
        >
          <ThemedText style={styles.anomalyText}>Gồ Ghề LỚN</ThemedText>
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
