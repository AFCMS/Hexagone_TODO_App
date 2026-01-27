import { useCallback, useState } from "react";

const RANDOM_WORD_API_URL =
  "https://random-word-api.herokuapp.com/word?number=1";

interface RandomWordState {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly playRandomWord: () => Promise<void>;
}

/**
 * Fetches a random word from the public API and forwards it to a callback.
 * Keeps all loading and error logic encapsulated.
 */
export function useRandomWord(onWord: (word: string) => void): RandomWordState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playRandomWord = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(RANDOM_WORD_API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch random word.");
      }

      const data = (await response.json()) as string[];
      const randomWord = data?.[0]?.trim();

      if (!randomWord) {
        throw new Error("No random word returned.");
      }

      onWord(randomWord);
    } catch (fetchError) {
      const errorMessage =
        fetchError instanceof Error ? fetchError.message : "Unexpected error.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onWord]);

  return {
    isLoading,
    error,
    playRandomWord,
  };
}
