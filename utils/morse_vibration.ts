import { morseCodeMap } from "./morse_constants";

interface VibrationPatternBuildResult {
  pattern: number[];
  durationMs: number;
}

/**
 * Builds a React Native `Vibration.vibrate()` pattern from text using Morse timing.
 *
 * Timing rules (in units of `ditMs`):
 * - dit = 1
 * - dah = 3
 * - intra-character gap = 1
 * - inter-letter gap = 3
 * - inter-word gap = 7
 */
export function buildMorseVibrationPattern(
  text: string,
  ditMs: number,
): VibrationPatternBuildResult {
  const unit = Math.max(1, Math.floor(ditMs));
  const dahMs = unit * 3;

  // React Native pattern alternates [pause, vibrate, pause, vibrate, ...]
  const pattern: number[] = [0];
  let expectingVibrate = true;

  const addVibrate = (ms: number) => {
    if (ms <= 0) return;
    if (!expectingVibrate) {
      // Insert a 0 pause if somehow out of phase.
      pattern.push(0);
      expectingVibrate = true;
    }
    pattern.push(ms);
    expectingVibrate = false;
  };

  const addPause = (ms: number) => {
    if (ms <= 0) return;
    if (expectingVibrate) {
      // We are currently on a pause slot; extend it.
      pattern[pattern.length - 1] += ms;
      return;
    }
    pattern.push(ms);
    expectingVibrate = true;
  };

  const words = text.toUpperCase().trim().split(/\s+/).filter(Boolean);
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    const codes = word
      .split("")
      .map((char) => morseCodeMap[char])
      .filter((code): code is string => Boolean(code) && code !== "/");

    for (let letterIndex = 0; letterIndex < codes.length; letterIndex++) {
      const code = codes[letterIndex];
      const symbols = code.split("");

      for (let symbolIndex = 0; symbolIndex < symbols.length; symbolIndex++) {
        const symbol = symbols[symbolIndex];
        addVibrate(symbol === "." ? unit : dahMs);

        const isLastSymbol = symbolIndex === symbols.length - 1;
        if (!isLastSymbol) {
          addPause(unit);
        }
      }

      const isLastLetterInWord = letterIndex === codes.length - 1;
      if (!isLastLetterInWord) {
        addPause(unit * 3);
      }
    }

    const isLastWord = wordIndex === words.length - 1;
    if (!isLastWord && codes.length > 0) {
      addPause(unit * 7);
    }
  }

  const durationMs = pattern.reduce((sum, n) => sum + n, 0);
  return { pattern, durationMs };
}
