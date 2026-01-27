import { morseCodeMap } from "./morse_constants";

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((char) => morseCodeMap[char] || "")
    .filter(Boolean)
    .join(" ");
}
