// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const toast = vi.hoisted(() => ({ add: vi.fn() }));

vi.mock("@/components/ui/toast", () => ({ toast }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import type { FileAttachmentLimitBehavior } from "./useFileAttachments";
import { useFileAttachments } from "./useFileAttachments";

type FormValues = { attachments: File[] };

const file = (name: string, size: number, type = "text/plain") =>
  new File([new Uint8Array(size)], name, { type });

const renderAttachments = ({
  initialFiles = [],
  maxCount = 3,
  maxSizeMB = 1,
  limitBehavior = "accept-available",
  accept,
  onError = vi.fn(),
}: {
  initialFiles?: File[];
  maxCount?: number;
  maxSizeMB?: number;
  limitBehavior?: FileAttachmentLimitBehavior;
  accept?: string[];
  onError?: (type: "count" | "size" | "type") => void;
} = {}) =>
  renderHook(() => {
    const form = useForm<FormValues>({
      defaultValues: { attachments: initialFiles },
    });
    return {
      form,
      attachments: useFileAttachments({
        form,
        name: "attachments",
        maxCount,
        maxSizeMB,
        limitBehavior,
        accept,
        onError,
      }),
    };
  });

describe("useFileAttachments", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("accepts extension, exact MIME, and wildcard MIME matches", () => {
    const { result } = renderAttachments({
      accept: [".PDF", "text/plain", "image/*"],
    });

    act(() => {
      result.current.attachments.addFiles([
        file("guide.pdf", 10, "application/pdf"),
        file("notes.txt", 10, "text/plain"),
        file("screen.png", 10, "image/png"),
      ]);
    });

    expect(result.current.attachments.files.map((item) => item.name)).toEqual([
      "guide.pdf",
      "notes.txt",
      "screen.png",
    ]);
  });

  it("rejects the complete batch when any file type is invalid", () => {
    const onError = vi.fn();
    const { result } = renderAttachments({ accept: [".pdf"], onError });

    act(() => {
      result.current.attachments.addFiles([
        file("valid.pdf", 10, "application/pdf"),
        file("blocked.exe", 10, "application/octet-stream"),
      ]);
    });

    expect(result.current.attachments.files).toEqual([]);
    expect(onError).toHaveBeenCalledWith("type");
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({ type: "warning" }),
    );
  });

  it("rejects an atomic batch that exceeds count or total size", () => {
    const onError = vi.fn();
    const { result } = renderAttachments({
      maxCount: 1,
      maxSizeMB: 0.00002,
      limitBehavior: "reject-all",
      onError,
    });

    act(() => result.current.attachments.addFiles([file("a.txt", 10), file("b.txt", 10)]));
    expect(result.current.attachments.files).toEqual([]);
    expect(onError).toHaveBeenLastCalledWith("count");

    act(() => result.current.attachments.addFiles([file("large.txt", 30)]));
    expect(result.current.attachments.files).toEqual([]);
    expect(onError).toHaveBeenLastCalledWith("size");
  });

  it("accepts available unique files and reports the first reached limit", () => {
    const existing = file("existing.txt", 10);
    const onError = vi.fn();
    const { result } = renderAttachments({
      initialFiles: [existing],
      maxCount: 3,
      maxSizeMB: 0.00003,
      onError,
    });

    act(() => {
      result.current.attachments.addFiles([
        file("existing.txt", 10),
        file("too-large.txt", 30),
        file("accepted.txt", 10),
      ]);
    });

    expect(result.current.attachments.files.map((item) => item.name)).toEqual([
      "existing.txt",
      "accepted.txt",
    ]);
    expect(onError).toHaveBeenCalledWith("size");
  });

  it("removes and clears files while exposing total size in megabytes", () => {
    const { result } = renderAttachments({
      initialFiles: [file("a.txt", 1024), file("b.txt", 1024)],
    });

    expect(result.current.attachments.totalFileSizeMB).toBeCloseTo(
      2048 / 1024 / 1024,
    );

    act(() => result.current.attachments.removeFile(0));
    expect(result.current.attachments.files.map((item) => item.name)).toEqual([
      "b.txt",
    ]);

    act(() => result.current.attachments.clear());
    expect(result.current.attachments.files).toEqual([]);
  });
});
