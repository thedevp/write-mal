import { diffWords } from "diff";
import type { Change } from "diff";

export type DiffPart = Change;

export function computeDiff(original: string, corrected: string): DiffPart[] {
  return diffWords(original, corrected);
}
