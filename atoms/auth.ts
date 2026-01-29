import { atom, type WritableAtom } from "jotai";

import type { User } from "firebase/auth";

/**
 * Current authenticated user
 * null means not authenticated or loading
 */
export const currentUserAtom = atom<User | null>(null) as WritableAtom<
  User | null,
  [User | null],
  void
>;
