import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest } from "@/app/api/_helpers";
import { resetLocalDemoSettingsState } from "@/server/serviceDesk/settings/state";
import { resetLocalDemoTicketState } from "@/server/serviceDesk/ticket/state";

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // reset is available on local demo only.
  if (isRemote) {
    return NextResponse.json(
      {
        success: false,
        message: "Demo reset is only available in local demo mode.",
      },
      { status: 403 },
    );
  }

  resetLocalDemoTicketState();
  resetLocalDemoSettingsState();

  return NextResponse.json({ success: true }, { status: 200 });
}
