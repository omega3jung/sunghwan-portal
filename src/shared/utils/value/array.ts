/**
 * Moves an item in an array to a new index and pads the array if the target index is beyond the current length.
 *
 * Use for:
 * - Reordering drag-and-drop collections
 * - Preserving index-based placement when moving items forward in a list
 *
 * @param arr - The mutable array whose item order should be changed
 * @param oldIndex - The zero-based index of the item to move
 * @param newIndex - The zero-based destination index for the moved item
 * @returns The same array instance after the item has been repositioned
 *
 * @example
 * arrayMove(["a", "b", "c"], 0, 2);
 * // ["b", "c", "a"]
 */
export const arrayMove = (
  arr: unknown[],
  oldIndex: number,
  newIndex: number
) => {
  if (newIndex >= arr.length) {
    let k = newIndex - arr.length + 1;

    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);

  return arr;
};

/**
 * Sorts numeric values into a stable order for order-insensitive comparisons.
 */
export function normalizeNumberArray(values: readonly number[]): number[] {
  return [...values].map(Number).sort((a, b) => a - b);
}

/**
 * Sorts string values into a stable order for order-insensitive comparisons.
 */
export function normalizeStringArray(values: readonly string[]): string[] {
  return [...values].map(String).sort((a, b) => a.localeCompare(b));
}

/**
 * Checks whether two numeric arrays contain the same values regardless of order.
 */
export function isSameNumberArray(
  current: readonly number[],
  next: readonly number[],
): boolean {
  return isSameArray(normalizeNumberArray(current), normalizeNumberArray(next));
}

/**
 * Checks whether two string arrays contain the same values regardless of order.
 */
export function isSameStringArray(
  current: readonly string[],
  next: readonly string[],
): boolean {
  return isSameArray(normalizeStringArray(current), normalizeStringArray(next));
}

function isSameArray<T>(current: readonly T[], next: readonly T[]) {
  return (
    current.length === next.length &&
    current.every((value, index) => value === next[index])
  );
}
