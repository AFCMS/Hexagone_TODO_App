// https://en.wikipedia.org/wiki/Morse_code

const morseLettersCapital = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
} as const;

const morseNumbers = {
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
} as const;

const morsePunctuation = {
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  ":": "---...",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  '"': ".-..-.",
  "@": ".--.-.",
} as const;

const morsePunctuationNonStandard = {
  "!": "-.-.--",
  "&": ".-...",
  ";": "-.-.-.",
  _: "..--.-",
  $: "...-..-",
} as const;

const morseCharacters = Object.assign(
  {},
  morseLettersCapital,
  morseNumbers,
  morsePunctuation,
  morsePunctuationNonStandard,
);

export type MorseCodeMap = typeof morseLettersCapital &
  typeof morseNumbers &
  typeof morsePunctuation &
  typeof morsePunctuationNonStandard & {
    " ": "/";
  };

export const morseCodeMap = {
  ...morseCharacters,
  " ": "/",
} as MorseCodeMap;
