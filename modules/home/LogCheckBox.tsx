import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useCommonStore } from "@/stores/commonStore";

const LogCheckBox = () => {
  const commonStore = useCommonStore();

  return (
    <>
      {/* Toggle Logging Checkbox */}
      <TouchableOpacity
        onPress={() => commonStore.setIsLogging(!commonStore.isLogging)}
        style={styles.button}
      >
        <ThemedView
          style={[
            styles.checkbox,
            {
              backgroundColor: commonStore.isLogging ? "white" : "transparent",
            },
          ]}
        />
        <ThemedText
          style={{ fontSize: 18, color: "white" }}
          type="defaultSemiBold"
        >
          Enable Sensors
        </ThemedText>
      </TouchableOpacity>
    </>
  );
};

export default LogCheckBox;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "white",
    marginRight: 10,
  },
});
