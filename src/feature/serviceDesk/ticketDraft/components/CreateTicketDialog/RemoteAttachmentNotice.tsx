"use client";

import type { ReactNode } from "react";

import { useTicketFormContext } from "../../context/TicketFormContext";

type RemoteAttachmentNoticeProps = {
  children: ReactNode;
  isVisible: boolean;
};

export const RemoteAttachmentNotice = ({
  children,
  isVisible,
}: RemoteAttachmentNoticeProps) => {
  const { isRemoteMode } = useTicketFormContext();

  if (!isRemoteMode || !isVisible) {
    return null;
  }

  return (
    <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm leading-5 text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200">
      {children}
    </div>
  );
};
