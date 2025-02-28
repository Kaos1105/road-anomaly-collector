import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { RadioButton } from "react-native-paper";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/button/Button";
import { useCommonStore } from "@/stores/commonStore";

const AnomalySettingsScreen = () => {
  const commonStore = useCommonStore();
  const [gyroThreshold, setGyroThreshold] = useState(commonStore.gyroThreshold);
  const [accelThreshold, setAccelThreshold] = useState(
    commonStore.accelThreshold,
  );
  const [isAndCondition, setIsAndCondition] = useState(
    commonStore.isAndCondition ? "AND" : "OR",
  );

  const handleSave = () => {
    commonStore.setIsAndCondition(isAndCondition == "AND");
    commonStore.setAccelThreshold(accelThreshold);
    commonStore.setGyroThreshold(gyroThreshold);
  };

  const btnDisabled = useMemo(() => {
    return !gyroThreshold || !accelThreshold;
  }, [gyroThreshold, accelThreshold]);

  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        // alignItems: "center",
        paddingTop: 30,
        paddingLeft: 30,
        paddingRight: 30,
        width: "100%",
      }}
    >
      <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}>
        Anomaly Detection Settings
      </ThemedText>

      <ThemedText type="defaultSemiBold" style={{ fontSize: 16, color: "red" }}>
        Gyro Threshold
      </ThemedText>
      <TextInput
        style={styles.textInput}
        keyboardType="numeric"
        value={gyroThreshold ? gyroThreshold.toString() : ""}
        onChangeText={(text) => {
          const value = parseFloat(text);
          setGyroThreshold(value);
        }}
      />

      <ThemedText
        type="defaultSemiBold"
        style={{ fontSize: 16, color: "green" }}
      >
        Acceleration Threshold
      </ThemedText>
      <TextInput
        style={styles.textInput}
        keyboardType="numeric"
        value={accelThreshold ? accelThreshold.toString() : ""}
        onChangeText={(text) => {
          const value = parseFloat(text);
          setAccelThreshold(value);
        }}
      />

      <ThemedText
        type="defaultSemiBold"
        style={{ fontSize: 16, color: "white" }}
      >
        Detection Condition
      </ThemedText>
      <RadioButton.Group
        onValueChange={(value) => setIsAndCondition(value)}
        value={isAndCondition}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <RadioButton value="AND" />
          <Text>AND</Text>
          <RadioButton value="OR" />
          <Text>OR</Text>
        </View>
      </RadioButton.Group>
      <Button
        disabled={btnDisabled}
        style={styles.saveBtn}
        onPress={handleSave}
        title={" Save Settings"}
      ></Button>
    </ThemedView>
  );
};

export default AnomalySettingsScreen;

const styles = StyleSheet.create({
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    marginVertical: 5,
    fontSize: 20,
    borderColor: "white",
  },
  saveBtn: {
    borderRadius: 8,
    elevation: 20,
    minHeight: 50,
    marginTop: 10,
    backgroundColor: "#3b4f7a",
  },
});
