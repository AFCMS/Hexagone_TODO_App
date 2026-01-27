import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = createJSONStorage<any>(() => AsyncStorage);

export const feedbackBackendVibration = atomWithStorage<boolean>(
  "feedback_backend:vibration",
  false,
  storage
);

export const feedbackBackendRearCameraFlash = atomWithStorage<boolean>(
  "feedback_backend:rear_camera_flash",
  false,
  storage
);

export const feedbackBackends = atom((get) => {
  return {
    vibration: get(feedbackBackendVibration),
    rearCameraFlash: get(feedbackBackendRearCameraFlash),
  } as const;
});

export const hasFeedbackBackendsEnabled = atom((get) => {
  const backends = get(feedbackBackends);
  return Object.values(backends).some((enabled) => enabled);
});

export const feedbackDitTimeMs = atomWithStorage<number>(
  "feedback:dit_time_ms",
  200,
  storage
);
