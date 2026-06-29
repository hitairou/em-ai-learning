export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function countMistake(
  value: string | null | undefined,
  mistakeType: string,
): Record<string, number> {
  const counts = parseJson<Record<string, number>>(value, {});
  counts[mistakeType] = (counts[mistakeType] ?? 0) + 1;
  return counts;
}
