import type { TFunction } from "i18next";

import type { RichEditorToolbarLabels } from "@/components/custom/RichEditor";
import { NS } from "@/lib/i18n";

export function getRichEditorLabels(t: TFunction): RichEditorToolbarLabels {
  return {
    bold: t("richEditor.toolbar.bold", { ns: NS.common }),
    italic: t("richEditor.toolbar.italic", { ns: NS.common }),
    underline: t("richEditor.toolbar.underline", { ns: NS.common }),
    strike: t("richEditor.toolbar.strike", { ns: NS.common }),
    bulletList: t("richEditor.toolbar.bulletList", { ns: NS.common }),
    orderedList: t("richEditor.toolbar.numberedList", { ns: NS.common }),
    blockquote: t("richEditor.toolbar.quote", { ns: NS.common }),
    codeBlock: t("richEditor.toolbar.codeBlock", { ns: NS.common }),
    link: t("richEditor.toolbar.link", { ns: NS.common }),
    image: t("richEditor.toolbar.image", { ns: NS.common }),
    table: t("richEditor.toolbar.table", { ns: NS.common }),
    undo: t("richEditor.toolbar.undo", { ns: NS.common }),
    redo: t("richEditor.toolbar.redo", { ns: NS.common }),
    linkPrompt: t("richEditor.prompt.link", { ns: NS.common }),
    imagePrompt: t("richEditor.prompt.image", { ns: NS.common }),
  };
}
