"use client";

import { type Editor } from "@tiptap/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useCreateServiceDeskTicketComment } from "@/feature/serviceDesk/ticket/api/comment";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";
import { useMutationToast } from "@/shared/utils";

import { TicketCommentComposerForm } from "./TicketCommentComposerForm";
import { TicketCommentComposerLauncher } from "./TicketCommentComposerLauncher";

export type TicketCommentComposerMode = "toolbar" | "public" | "internal";

export type TicketCommentComposerProps = {
  ticketId: string;
  users?: ImageValueLabel[];
  showHeader?: boolean;
};

export function TicketCommentComposer({
  ticketId,
  users = [],
  showHeader = true,
}: TicketCommentComposerProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const { current } = useCurrentSession();
  const mutationToast = useMutationToast();
  const { mutateAsync: createComment, isPending } =
    useCreateServiceDeskTicketComment();

  const [mode, setMode] = useState<TicketCommentComposerMode>("toolbar");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const currentUser = current.user;
  const currentUserOption = useMemo(
    () => users.find((user) => user.value === currentUser?.id),
    [currentUser?.id, users],
  );

  const currentUserName =
    currentUserOption?.label ||
    currentUser?.displayName ||
    t("comment.composer.currentUser");
  const currentUserEmail =
    currentUserOption?.displayName || currentUser?.email || "";
  const currentUserImage = currentUserOption?.image || currentUser?.image;
  const isComposerOpen = mode !== "toolbar";
  const helperText =
    mode === "internal"
      ? t("comment.composer.helperInternal")
      : t("comment.composer.helperPublic");
  const submitLabel =
    mode === "internal"
      ? t("comment.composer.submitInternal")
      : t("comment.composer.submitPublic");

  useEffect(() => {
    if (!isComposerOpen) {
      return;
    }

    editor?.commands.focus("end");
  }, [editor, isComposerOpen]);

  const handleOpenComposer = (
    nextMode: Exclude<TicketCommentComposerMode, "toolbar">,
  ) => {
    setMode(nextMode);
    setErrorMessage("");
  };

  const handleCloseComposer = () => {
    editor?.commands.clearContent();
    setErrorMessage("");
    setMode("toolbar");
  };

  const handleSubmit = async () => {
    if (!editor || !currentUser) {
      return;
    }

    const plainText = editor.getText().trim();

    if (!plainText) {
      setErrorMessage(t("comment.editor.validationEmpty"));
      editor.commands.focus("start");
      return;
    }

    const promise = createComment({
      ticketId,
      values: {
        id: currentUser.id,
        body: editor.getHTML(),
        visibility: mode === "internal" ? "internal" : "public",
        files: [],
        images: [],
      },
    });

    await mutationToast(promise, "create", "comment");

    editor.commands.clearContent();
    setErrorMessage("");
    setMode("toolbar");
  };

  return (
    <section className="space-y-3">
      <TicketCommentComposerLauncher
        hidden={isComposerOpen}
        onOpenPublic={() => {
          handleOpenComposer("public");
        }}
        onOpenInternal={() => {
          handleOpenComposer("internal");
        }}
      />
      <TicketCommentComposerForm
        open={isComposerOpen}
        currentUserEmail={currentUserEmail}
        currentUserImage={currentUserImage}
        currentUserName={currentUserName}
        editor={editor}
        errorMessage={errorMessage}
        helperText={helperText}
        isPending={isPending}
        mode={mode === "toolbar" ? "public" : mode}
        showHeader={showHeader}
        onCancel={handleCloseComposer}
        onEditorReady={setEditor}
        onModeChange={setMode}
        onSubmit={handleSubmit}
        onTextChange={(hasText) => {
          if (errorMessage && hasText) {
            setErrorMessage("");
          }
        }}
        submitLabel={submitLabel}
      />
    </section>
  );
}
