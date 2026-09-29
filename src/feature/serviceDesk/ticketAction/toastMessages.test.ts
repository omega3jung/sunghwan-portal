import { createInstance } from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";

import en from "@/lib/application/i18n/locales/en/serviceDesk";
import ko from "@/lib/application/i18n/locales/ko/serviceDesk";
import { mutationToast } from "@/lib/client/toast";

import { ACTION_TYPE_BY_MODE } from "./mapper";
import { getTicketActionToastMessages } from "./toastMessages";

type ToastState = { title: string; type: string };
type PromiseFeedback = {
  loading: ToastState;
  success: (data: unknown) => ToastState;
  error: (error: unknown) => ToastState;
};

const { toastPromise } = vi.hoisted(() => ({
  toastPromise: vi.fn(
    (promise: Promise<unknown>, _feedback: PromiseFeedback) => promise,
  ),
}));

vi.mock("@/shared/client/toast", () => ({
  toast: { promise: toastPromise },
}));

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: "en",
    fallbackLng: false,
    defaultNS: "serviceDesk",
    resources: { en: { serviceDesk: en }, ko: { serviceDesk: ko } },
  });
});

describe.each(["en", "ko"])("Ticket Action feedback (%s)", (language) => {
  const t = i18n.getFixedT(language, "serviceDesk");

  it("provides every feedback phase for every action without translation fallback", () => {
    for (const actionType of Object.values(ACTION_TYPE_BY_MODE)) {
      const keys = getTicketActionToastMessages(actionType, (key) => key);
      const messages = getTicketActionToastMessages(actionType, t);

      for (const phase of ["loading", "success", "error"] as const) {
        expect(i18n.exists(keys[phase], { lng: language })).toBe(true);
        expect(messages[phase].trim()).not.toBe("");
        expect(messages[phase]).not.toBe(keys[phase]);
      }
    }
  });

  it("keeps COMMENT and NOTE keys and messages distinct in every phase", () => {
    const comment = getTicketActionToastMessages("COMMENT", t);
    const note = getTicketActionToastMessages("NOTE", t);
    const commentKeys = getTicketActionToastMessages("COMMENT", (key) => key);
    const noteKeys = getTicketActionToastMessages("NOTE", (key) => key);

    for (const phase of ["loading", "success", "error"] as const) {
      expect(comment[phase]).not.toBe(note[phase]);
      expect(commentKeys[phase]).not.toBe(noteKeys[phase]);
    }
  });

  it.each([
    ["COMMENT", "comment"],
    ["NOTE", "note"],
    ["APPROVE", "approve"],
    ["MERGE", "merge"],
  ] as const)("uses %s feedback through the existing promise toast", async (action, mode) => {
    const expected = (language === "en" ? en : ko).actionTool.toast[mode];
    const messages = getTicketActionToastMessages(action, t);
    const result = { id: "created-action" };
    const promise = Promise.resolve(result);

    await expect(mutationToast(promise, messages)).resolves.toBe(result);
    const [receivedPromise, feedback] = toastPromise.mock.lastCall!;
    expect(receivedPromise).toBe(promise);
    expect(feedback.loading).toEqual({ title: expected.loading, type: "loading" });
    expect(feedback.success(result)).toEqual({ title: expected.success, type: "success" });

    const error = new Error("Command failed");
    await expect(mutationToast(Promise.reject(error), messages)).rejects.toBe(error);
    expect(toastPromise.mock.lastCall![1].error(error)).toEqual({
      title: expected.error,
      type: "error",
    });
  });
});

it("keeps English and Korean feedback keys aligned", () => {
  expect(Object.keys(en.actionTool.toast).sort()).toEqual(
    Object.keys(ko.actionTool.toast).sort(),
  );
  for (const mode of Object.keys(ACTION_TYPE_BY_MODE) as (keyof typeof ACTION_TYPE_BY_MODE)[]) {
    expect(Object.keys(en.actionTool.toast[mode]).sort()).toEqual(["error", "loading", "success"]);
    expect(Object.keys(ko.actionTool.toast[mode]).sort()).toEqual(["error", "loading", "success"]);
  }
});
