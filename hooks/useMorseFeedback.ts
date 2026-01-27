import { useCallback, useEffect, useRef } from "react";
import { Vibration } from "react-native";
import { useAtomValue, useSetAtom } from "jotai";

import {
  hasCameraPermission,
  playbackMessageAtom,
  rearCameraTorchOnAtom,
} from "../atoms/app";
import {
  feedbackBackendRearCameraFlashAtom,
  feedbackBackendVibrationAtom,
  feedbackDitTimeMsAtom,
} from "../atoms/settings";
import { buildMorseVibrationPattern } from "../utils/morse_vibration";

/**
 * Plays Morse feedback using the rear camera flash only.
 * Uses Jotai atoms for message state and settings.
 */
export function useMorseFeedback() {
  const message = useAtomValue(playbackMessageAtom);
  const vibrationEnabled = useAtomValue(feedbackBackendVibrationAtom);
  const flashEnabled = useAtomValue(feedbackBackendRearCameraFlashAtom);
  const ditTimeMs = useAtomValue(feedbackDitTimeMsAtom);
  const hasPermission = useAtomValue(hasCameraPermission);
  const setPlaybackMessage = useSetAtom(playbackMessageAtom);
  const setTorchOn = useSetAtom(rearCameraTorchOnAtom);

  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  };

  const stopPlayback = useCallback(
    (clearMessage: boolean) => {
      clearTimers();
      Vibration.cancel();
      if (flashEnabled) {
        setTorchOn(false);
      }
      isPlayingRef.current = false;
      if (clearMessage) {
        setPlaybackMessage(null);
      }
    },
    [setPlaybackMessage, setTorchOn],
  );

  const startPlayback = useCallback(
    (text: string) => {
      const { pattern, durationMs } = buildMorseVibrationPattern(
        text,
        ditTimeMs,
      );
      if (pattern.length <= 1 || durationMs <= 0) return;

      isPlayingRef.current = true;

      clearTimers();
      Vibration.cancel();
      setTorchOn(false);

      if (vibrationEnabled) {
        Vibration.vibrate(pattern);
      }

      let elapsed = 0;
      for (let i = 0; i < pattern.length; i++) {
        const duration = pattern[i] ?? 0;
        const on = i % 2 === 1;

        if (duration > 0) {
          const startAt = elapsed;
          if (flashEnabled) {
            timeoutsRef.current.push(
              setTimeout(() => {
                setTorchOn(on);
              }, startAt),
            );
          }
        }
        elapsed += duration;
      }

      if (flashEnabled) {
        timeoutsRef.current.push(
          setTimeout(() => {
            setTorchOn(false);
          }, elapsed),
        );
      }

      stopTimeoutRef.current = setTimeout(() => {
        stopPlayback(true);
      }, durationMs + 50);
    },
    [ditTimeMs, flashEnabled, setTorchOn, stopPlayback, vibrationEnabled],
  );

  useEffect(() => {
    if (!message) {
      stopPlayback(false);
      return;
    }

    if (!flashEnabled && !vibrationEnabled) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (flashEnabled && !hasPermission) {
        stopPlayback(true);
        return;
      }

      if (!cancelled) {
        startPlayback(message);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    flashEnabled,
    hasPermission,
    message,
    startPlayback,
    stopPlayback,
    vibrationEnabled,
  ]);

  useEffect(() => {
    if (!flashEnabled && !vibrationEnabled && message) {
      stopPlayback(true);
    }
  }, [flashEnabled, message, stopPlayback, vibrationEnabled]);

  useEffect(() => {
    return () => {
      stopPlayback(false);
    };
  }, [stopPlayback]);

  return {
    stop: () => stopPlayback(true),
  };
}
