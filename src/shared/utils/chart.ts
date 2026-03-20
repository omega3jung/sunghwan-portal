export function aggregateBy<T>(
  data: T[],
  key: keyof T,
): { name: string; value: number }[] {
  const map: Record<string, number> = {};

  for (const item of data) {
    const value = item[key];

    if (Array.isArray(value)) {
      for (const v of value) {
        map[v] = (map[v] || 0) + 1;
      }
    } else {
      map[value as string] = (map[value as string] || 0) + 1;
    }
  }

  return Object.entries(map).map(([name, value]) => ({ name, value }));
}
