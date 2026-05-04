import type { TimelinePaletteIndex } from "./types";

export const timelinePalette: Record<TimelinePaletteIndex, string> = {
  1: "border-transparent bg-[#E6F6EC] text-[#2E7D4F] hover:bg-[#E6F6EC]",
  2: "border-transparent bg-[#EAF2FF] text-[#2F6FD6] hover:bg-[#EAF2FF]",
  3: "border-transparent bg-[#FCEDEE] text-[#C94A5A] hover:bg-[#FCEDEE]",
  4: "border-transparent bg-[#FFF4E5] text-[#C7771A] hover:bg-[#FFF4E5]",
  5: "border-transparent bg-[#E8F7F6] text-[#2C9C9C] hover:bg-[#E8F7F6]",
  6: "border-transparent bg-[#F2ECFF] text-[#7A5AE0] hover:bg-[#F2ECFF]",
  7: "border-transparent bg-[#F5EFEA] text-[#7A5230] hover:bg-[#F5EFEA]",
  8: "border-transparent bg-[#F9EDF5] text-[#C05A9B] hover:bg-[#F9EDF5]",
  9: "border-transparent bg-[#E9F0FF] text-[#2B4EA2] hover:bg-[#E9F0FF]",
  10: "border-transparent bg-[#F3F3F3] text-[#424242] hover:bg-[#F3F3F3]",
};

export const timelinePaletteAccent: Record<TimelinePaletteIndex, string> = {
  1: "bg-[#7ED9A3]",
  2: "bg-[#8BB8FF]",
  3: "bg-[#F28A9A]",
  4: "bg-[#F5B66A]",
  5: "bg-[#6ECFCF]",
  6: "bg-[#B39DFF]",
  7: "bg-[#C89A6B]",
  8: "bg-[#E79AC6]",
  9: "bg-[#6F8FEF]",
  10: "bg-[#BDBDBD]",
};

export const normalizeTimelinePaletteIndex = (
  value: number,
): TimelinePaletteIndex => {
  const paletteSize = Object.keys(timelinePalette).length;
  const normalizedValue =
    (((value - 1) % paletteSize) + paletteSize) % paletteSize;

  return (normalizedValue + 1) as TimelinePaletteIndex;
};

export const resolveTimelinePaletteIndex = (
  itemIndex: number,
  palettePick?: TimelinePaletteIndex,
): TimelinePaletteIndex => {
  if (palettePick) {
    return palettePick;
  }

  return normalizeTimelinePaletteIndex(itemIndex + 1);
};
