import { ColorPicker as Root } from "./ColorPicker";
import { ColorPickerHexInput } from "./ColorPickerHexInput";
import { ColorPickerReset } from "./ColorPickerReset";
import { ColorPickerTrigger } from "./ColorPickerTrigger";

export const ColorPicker = Object.assign(Root, {
  Trigger: ColorPickerTrigger,
  HexInput: ColorPickerHexInput,
  Reset: ColorPickerReset,
});

export type { ColorPickerProps } from "./ColorPicker";
export { DEFAULT_COLOR } from "./ColorPickerContext";
export type { ColorPickerHexInputProps } from "./ColorPickerHexInput";
export type { ColorPickerResetProps } from "./ColorPickerReset";
export type { ColorPickerTriggerProps } from "./ColorPickerTrigger";
