import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = createJSONStorage<any>(() => AsyncStorage);

export const feedbackBackendVibrationAtom = atomWithStorage<boolean>(
  "feedback_backend:vibration",
  false,
  storage,
);

export const feedbackBackendRearCameraFlashAtom = atomWithStorage<boolean>(
  "feedback_backend:rear_camera_flash",
  false,
  storage,
);

export const feedbackBackendsAtom = atom((get) => {
  return {
    vibration: get(feedbackBackendVibrationAtom),
    rearCameraFlash: get(feedbackBackendRearCameraFlashAtom),
  } as const;
});

export const hasFeedbackBackendsEnabledAtom = atom((get) => {
  const backends = get(feedbackBackendsAtom);
  return Object.values(backends).some((enabled) => enabled);
});

export const feedbackDitTimeMsAtom = atomWithStorage<number>(
  "feedback:dit_time_ms",
  200,
  storage,
);
