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
