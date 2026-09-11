import { NextRequest, NextResponse } from "next/server";

import { getAuthToken } from "@/app/api/_adapters";
import { resetLocalDemoSettingsState } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { resetLocalDemoTicketState } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/state";
import { resetLocalTicketWorkSessionState } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/workSession";

/** Handles POST /api/demo/service-desk/reset; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function POST(request: NextRequest) {
  const token = await getAuthToken(request);

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  // reset is available on local demo only.
  if (token.dataScope !== "LOCAL") {
    return NextResponse.json(
      {
        success: false,
        message: "Demo reset is only available in local demo mode.",
      },
      { status: 403 },
    );
  }

  resetLocalDemoTicketState();
  resetLocalTicketWorkSessionState();
  resetLocalDemoSettingsState();

  return NextResponse.json({ success: true }, { status: 200 });
}
