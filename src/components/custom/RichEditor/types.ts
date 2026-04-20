import type { Editor } from "@tiptap/react";

export type RichEditorToolbarItemKey =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock"
  | "link"
  | "image"
  | "table"
  | "undo"
  | "redo";

export type RichEditorToolbarGroup = RichEditorToolbarItemKey[];

export type RichEditorPresetName =
  | "default"
  | "description"
  | "comment"
  | "action";

export type RichEditorPreset = {
  name: RichEditorPresetName;
  toolbar: RichEditorToolbarGroup[];
};

export type RichEditorToolbarLabels = Partial<
  Record<RichEditorToolbarItemKey, string>
> & {
  imagePrompt?: string;
  linkPrompt?: string;
};

export type RichEditorToolbarActionContext = {
  editor: Editor;
  labels: RichEditorToolbarLabels;
};

export type RichEditorToolbarHandlers = {
  onImage?: (context: RichEditorToolbarActionContext) => void;
  onLink?: (context: RichEditorToolbarActionContext) => void;
  onTable?: (context: RichEditorToolbarActionContext) => void;
};
