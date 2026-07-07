import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { prepareTicketAttachments } from "@/server/serviceDesk/ticket/attachments/ticketAttachmentPrepareService";

const BODY_FIELD_NAME = "body";
const FILES_FIELD_NAME = "files";

export async function POST(request: NextRequest) {
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (currentUserName === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Keep the data-scope resolution here to mirror Service Desk route policy.
    // LOCAL and REMOTE intentionally use the same demo replacement implementation:
    // no Supabase Storage, no raw File persistence, no binary upload.
    await isRemoteRequest(request);

    const formData = await request.formData();
    const body = String(formData.get(BODY_FIELD_NAME) ?? "");
    const files = formData.getAll(FILES_FIELD_NAME).filter(isFile);

    return NextResponse.json(
      prepareTicketAttachments({
        body,
        files,
      }),
    );
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: "Failed to prepare ticket attachments.",
      fallbackStatus: 400,
    });
  }
}

function isFile(value: FormDataEntryValue): value is File {
  return value instanceof File;
}
