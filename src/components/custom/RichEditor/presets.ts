import type { RichEditorPreset, RichEditorPresetName } from "./types";

const DEFAULT_TOOLBAR = [
  ["bold", "italic", "underline", "strike"],
  ["bulletList", "orderedList", "blockquote", "codeBlock"],
  ["link", "image", "table"],
  ["undo", "redo"],
] satisfies RichEditorPreset["toolbar"];

export const defaultRichEditorPreset: RichEditorPreset = {
  name: "default",
  toolbar: DEFAULT_TOOLBAR,
};

export const descriptionRichEditorPreset: RichEditorPreset = {
  ...defaultRichEditorPreset,
  name: "description",
};

export const commentRichEditorPreset: RichEditorPreset = {
  ...defaultRichEditorPreset,
  name: "comment",
};

export const actionRichEditorPreset: RichEditorPreset = {
  ...defaultRichEditorPreset,
  name: "action",
};

const RICH_EDITOR_PRESET_MAP: Record<RichEditorPresetName, RichEditorPreset> = {
  default: defaultRichEditorPreset,
  description: descriptionRichEditorPreset,
  comment: commentRichEditorPreset,
  action: actionRichEditorPreset,
};

export function resolveRichEditorPreset(
  preset?: RichEditorPreset | RichEditorPresetName,
) {
  if (!preset) {
    return defaultRichEditorPreset;
  }

  return typeof preset === "string" ? RICH_EDITOR_PRESET_MAP[preset] : preset;
}
