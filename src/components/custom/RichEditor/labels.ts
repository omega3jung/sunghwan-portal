import type { TFunction } from "i18next";

import { NS } from "@/lib/application/i18n";

import type { RichEditorToolbarLabels } from "./types";

export function getRichEditorLabels(t: TFunction): RichEditorToolbarLabels {
  return {
    bold: t("richEditor.toolbar.bold", { ns: NS.component }),
    italic: t("richEditor.toolbar.italic", { ns: NS.component }),
    underline: t("richEditor.toolbar.underline", { ns: NS.component }),
    strike: t("richEditor.toolbar.strike", { ns: NS.component }),
    bulletList: t("richEditor.toolbar.bulletList", { ns: NS.component }),
    orderedList: t("richEditor.toolbar.numberedList", { ns: NS.component }),
    blockquote: t("richEditor.toolbar.quote", { ns: NS.component }),
    codeBlock: t("richEditor.toolbar.codeBlock", { ns: NS.component }),
    link: t("richEditor.toolbar.link", { ns: NS.component }),
    image: t("richEditor.toolbar.image", { ns: NS.component }),
    table: t("richEditor.toolbar.table", { ns: NS.component }),
    undo: t("richEditor.toolbar.undo", { ns: NS.component }),
    redo: t("richEditor.toolbar.redo", { ns: NS.component }),
    linkPrompt: t("richEditor.prompt.link", { ns: NS.component }),
    imagePrompt: t("richEditor.prompt.image", { ns: NS.component }),
  };
}
