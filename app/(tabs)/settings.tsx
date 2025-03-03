import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Sharing from "expo-sharing";
import { RadioButton } from "react-native-paper";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/button/Button";
import { useCommonStore } from "@/stores/commonStore";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";

const AnomalySettingsScreen = () => {
  const commonStore = useCommonStore();
  const [gyroThreshold, setGyroThreshold] = useState(commonStore.gyroThreshold);
  const [accelThreshold, setAccelThreshold] = useState(
    commonStore.accelThreshold,
  );
  const [isAndCondition, setIsAndCondition] = useState(
    commonStore.isAndCondition ? "AND" : "OR",
  );
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleSave = () => {
    commonStore.setIsAndCondition(isAndCondition === "AND");
    commonStore.setAccelThreshold(accelThreshold);
    commonStore.setGyroThreshold(gyroThreshold);
  };

  const shareAllCSVFiles = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory ?? "",
      );
      const csvFiles = files.filter((file) => file.endsWith(".csv"));

      if (csvFiles.length === 0) {
        console.log("🚫 No CSV files found to share.");
        return;
      }

      for (const file of csvFiles) {
        const filePath = `${FileSystem.documentDirectory}${file}`;

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, {
            mimeType: "text/csv",
            dialogTitle: `Share ${file}`,
            UTI: "public.comma-separated-values-text",
          });

          // Delete the file after sharing
          await FileSystem.deleteAsync(filePath, { idempotent: true });
          console.log(`🗑️ Deleted: ${filePath}`);
        } else {
          console.log("❌ Sharing is not available on this device.");
        }
      }
    } catch (error) {
      console.error("Error sharing CSV files:", error);
    }
  };

  const deleteAllFiles = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory ?? "",
      );

      if (files.length === 0) {
        console.log("🚫 No files found to delete.");
        Toast.show({
          type: "info",
          text1: "There are no files to delete.",
        });
        return;
      }

      for (const file of files) {
        const filePath = `${FileSystem.documentDirectory}${file}`;
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
      console.log("🗑️ All files deleted.");
      Toast.show({
        type: "success",
        text1: "All files have been deleted.",
      });
    } catch (error) {
      console.error("❌ Error deleting files:", error);
      Toast.show({
        type: "error",
        text1: "Failed to delete files.",
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Anomaly Detection Settings</ThemedText>

      <ThemedText type="defaultSemiBold" style={styles.labelRed}>
        Gyro Threshold
      </ThemedText>
      <TextInput
        style={styles.textInput}
        keyboardType="numeric"
        value={gyroThreshold ? gyroThreshold.toString() : ""}
        onChangeText={(text) => setGyroThreshold(parseFloat(text))}
      />

      <ThemedText type="defaultSemiBold" style={styles.labelGreen}>
        Acceleration Threshold
      </ThemedText>
      <TextInput
        style={styles.textInput}
        keyboardType="numeric"
        value={accelThreshold ? accelThreshold.toString() : ""}
        onChangeText={(text) => setAccelThreshold(parseFloat(text))}
      />

      <ThemedText type="defaultSemiBold" style={styles.labelWhite}>
        Detection Condition
      </ThemedText>
      <RadioButton.Group
        onValueChange={(value) => setIsAndCondition(value)}
        value={isAndCondition}
      >
        <View style={styles.radioGroup}>
          <RadioButton value="AND" />
          <Text>AND</Text>
          <RadioButton value="OR" />
          <Text>OR</Text>
        </View>
      </RadioButton.Group>

      <Button
        style={styles.saveBtn}
        onPress={handleSave}
        title="Save Settings"
      />
      <Button
        style={styles.shareBtn}
        onPress={shareAllCSVFiles}
        title={`Share CSV Files`}
      />
      <Button
        style={styles.deleteBtn}
        onPress={deleteAllFiles}
        title={`Delete CSV Files`}
      />
    </ThemedView>
  );
};

export default AnomalySettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  labelRed: {
    fontSize: 16,
    color: "red",
  },
  labelGreen: {
    fontSize: 16,
    color: "green",
  },
  labelWhite: {
    fontSize: 16,
    color: "white",
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    marginVertical: 5,
    fontSize: 20,
    borderColor: "white",
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveBtn: {
    borderRadius: 8,
    elevation: 20,
    minHeight: 50,
    marginTop: 10,
    backgroundColor: "#3b4f7a",
  },
  deleteBtn: {
    borderRadius: 8,
    elevation: 20,
    minHeight: 50,
    marginTop: 10,
    backgroundColor: "#ff9800",
  },
  shareBtn: {
    borderRadius: 8,
    elevation: 20,
    minHeight: 50,
    marginTop: 10,
    backgroundColor: "#4caf50",
  },
});
