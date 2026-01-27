import { StyleSheet, Switch, Text, View } from "react-native";
import { useAtom, useAtomValue } from "jotai";
import Slider from "@react-native-community/slider";

import {
  feedbackBackendRearCameraFlashAtom,
  feedbackBackendVibrationAtom,
  feedbackDitTimeMsAtom,
} from "../atoms/settings";
import { hasCameraPermission } from "../atoms/app";

export function ConfigScreen() {
  const [vibrationEnabled, setVibrationEnabled] = useAtom(
    feedbackBackendVibrationAtom,
  );
  const [rearCameraFlashEnabled, setRearCameraFlashEnabled] = useAtom(
    feedbackBackendRearCameraFlashAtom,
  );

  const hasCameraPermissionValue = useAtomValue(hasCameraPermission);

  const [ditTimeMs, setDitTimeMs] = useAtom(feedbackDitTimeMsAtom);

  return (
    <View style={styles.container}>
      <View style={styles.backendRow}>
        <Text style={styles.backendLabel}>Vibration</Text>
        <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} />
      </View>
      <View style={styles.backendRow}>
        <Text style={styles.backendLabel}>Rear camera flash</Text>
        <Switch
          disabled={hasCameraPermissionValue === false}
          value={rearCameraFlashEnabled}
          onValueChange={setRearCameraFlashEnabled}
        />
      </View>
      <View style={styles.backendRow}>
        <Text style={styles.backendLabel}>Speed</Text>
        <Slider
          style={styles.slider}
          minimumValue={150}
          maximumValue={300}
          step={50}
          value={ditTimeMs}
          onValueChange={setDitTimeMs}
        />
        <Text>{ditTimeMs} ms</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  backendRow: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  backendLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  slider: {
    width: 200,
    height: 40,
  },
});
