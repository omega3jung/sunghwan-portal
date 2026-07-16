import { ApiError } from "@/lib/application/api";

type SettingsWriteResource = "approvalSteps" | "assignmentRules";

export function mapSettingsWriteError(
  error: unknown,
  resource: SettingsWriteResource,
): Error {
  if (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error;
  }

  const code = getDatabaseErrorCode(error);

  switch (code) {
    case "23503":
    case "22P02":
      return Object.assign(
        new Error("An organization reference is invalid for this settings context."),
        { code: "INVALID_ORGANIZATION_REFERENCE", status: 400 },
      );
    case "23505":
      return Object.assign(new Error("The submitted settings contain a duplicate."), {
        code: "DUPLICATE_REFERENCE",
        status: 409,
      });
    case "40001":
    case "40P01":
      return Object.assign(
        new Error("The settings changed concurrently. Reload and try again."),
        { code: "CONCURRENT_SETTINGS_UPDATE", status: 409 },
      );
    default:
      return new ApiError(`serviceDesk.${resource}.save`, 500);
  }
}

function getDatabaseErrorCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}
