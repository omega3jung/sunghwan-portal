import type { TFunction } from "i18next";

import type { RichEditorToolbarLabels } from "@/components/custom/RichEditor";

export function getRichEditorLabels(t: TFunction): RichEditorToolbarLabels {
  return {
    bold: t("richEditor.toolbar.bold"),
    italic: t("richEditor.toolbar.italic"),
    underline: t("richEditor.toolbar.underline"),
    strike: t("richEditor.toolbar.strike"),
    bulletList: t("richEditor.toolbar.bulletList"),
    orderedList: t("richEditor.toolbar.numberedList"),
    blockquote: t("richEditor.toolbar.quote"),
    codeBlock: t("richEditor.toolbar.codeBlock"),
    link: t("richEditor.toolbar.link"),
    image: t("richEditor.toolbar.image"),
    table: t("richEditor.toolbar.table"),
    undo: t("richEditor.toolbar.undo"),
    redo: t("richEditor.toolbar.redo"),
    linkPrompt: t("richEditor.prompt.link"),
    imagePrompt: t("richEditor.prompt.image"),
  };
}
