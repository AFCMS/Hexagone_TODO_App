import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAtom, useSetAtom } from "jotai";

import { hasCameraPermission, rearCameraTorchOnAtom } from "../atoms/app";

/**
 * Provide a offscreen camera with a state to toggle the rear flash.
 */
export function useCameraFlash() {
  // Keep a global permission state in sync with the current camera permission.
  const [permission, requestPermissionAsync] = useCameraPermissions({
    request: true,
  });

  const setHasPermission = useSetAtom(hasCameraPermission);
  const hasPermission = permission?.granted ?? false;

  useEffect(() => {
    let isActive = true;

    const syncPermission = async () => {
      setHasPermission(hasPermission);

      if (!permission || permission.granted || !permission.canAskAgain) {
        return;
      }

      const result = await requestPermissionAsync();
      if (isActive) {
        setHasPermission(result.granted);
      }
    };

    void syncPermission();

    return () => {
      isActive = false;
    };
  }, [hasPermission, permission, requestPermissionAsync, setHasPermission]);

  const [torchOn, setTorchOn] = useAtom(rearCameraTorchOnAtom);

  const requestPermission = async () => {
    const result = await requestPermissionAsync();
    setHasPermission(result.granted);
    return result.granted;
  };

  const element = (
    <CameraView
      facing="back"
      enableTorch={torchOn}
      pointerEvents="none"
      style={styles.camera}
    />
  );

  return { element, requestPermission, setTorchOn };
}

const styles = StyleSheet.create({
  camera: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 50,
    height: 50,
    opacity: 0.01,
  },
});
