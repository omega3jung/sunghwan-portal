import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Field, FieldLabel } from "@/components/ui/field";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import { cn } from "@/shared/utils";

import { useTicketFormContext } from "../../context/TicketFormContext";
import { TicketInfoFields } from "./TicketInfoFields";

export const InfoStep = () => {
  const { form, categories } = useTicketFormContext();
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText();

  const requestTemplateRef = useRef("");
  const bodyValue = form.watch("body");
  const subCategoryValue = form.watch("subCategory");

  const requestTemplate = useMemo(() => {
    const subCategories = categories.flatMap(
      (category) => category.subCategories,
    );
    const selected = subCategories.find(
      (subCat) => subCat.id === subCategoryValue,
    );

    return selected?.requestTemplate !== undefined
      ? tLocal(selected.requestTemplate)
      : "";
  }, [categories, subCategoryValue, tLocal]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Markdown,
      StarterKit,
      Image,
      TableKit,
      Placeholder.configure({
        placeholder: () => requestTemplateRef.current,
      }),
    ],
    content: bodyValue,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "min-h-32 rounded-md px-3 py-2 text-sm focus:outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const markdown = currentEditor.getMarkdown();

      if (markdown === form.getValues("body")) {
        return;
      }

      form.setValue("body", markdown, {
        shouldDirty: true,
        shouldTouch: true,
      });
    },
  });

  useEffect(() => {
    requestTemplateRef.current = requestTemplate;

    if (editor?.isEmpty) {
      editor.view.dispatch(editor.state.tr);
    }
  }, [editor, requestTemplate]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    if ((bodyValue ?? "") === editor.getMarkdown()) {
      return;
    }

    editor.commands.setContent(bodyValue ?? "", {
      contentType: "markdown",
      emitUpdate: false,
    });
  }, [bodyValue, editor]);

  return (
    <>
      <TicketInfoFields mode="edit" />

      <Field className="pt-4 gap-1">
        <FieldLabel htmlFor="info-step-input-description">
          {t("field.description", { ns: "common" })}
        </FieldLabel>

        <div className="space-y-2">
          <EditorContent
            id="info-step-input-description"
            className={cn(
              "editor-wrapper rounded-md border border-input bg-transparent shadow-sm min-h-52",
              "[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            )}
            editor={editor}
          />
        </div>
      </Field>
    </>
  );
};
