/**
 * Counts how often each value appears for a specific field and converts the result into chart-friendly pairs.
 *
 * Use for:
 * - Building summary datasets for pie or bar charts
 * - Aggregating categorical values from a collection of records
 *
 * @param data - The collection of records to aggregate
 * @param key - The field whose value or values should be counted
 * @returns An array of objects containing a chart label in `name` and its count in `value`
 *
 * @example
 * aggregateBy([{ status: "open" }, { status: "open" }, { status: "closed" }], "status");
 * // [{ name: "open", value: 2 }, { name: "closed", value: 1 }]
 */
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
