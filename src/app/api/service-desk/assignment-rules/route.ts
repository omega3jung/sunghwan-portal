// app/api/user-preference/route.ts
import { NextRequest, NextResponse } from "next/server";

import client from "@/api/client";
import { camelAssignmentRuleMapper } from "@/api/serviceDesk/assignmentRule/mapper";
import {
  internalAssignmentRuleSettingsMock,
  tenantAssignmentRuleSettingsMock,
} from "@/app/_mocks/pages/service-desk/assignmentRules";
import { isInternalUser, isRemoteRequest } from "@/app/api/_helpers";
import { Preference } from "@/domain/config";
import { DbParams } from "@/shared/types/api";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const isInternal = await isInternalUser(request);

    // internal demo.
    if (isInternal) {
      const internalCategories = camelAssignmentRuleMapper(
        internalAssignmentRuleSettingsMock,
      );

      return NextResponse.json({
        items: internalCategories,
        total: internalCategories.length,
      });
    }

    const tenantCategories = camelAssignmentRuleMapper(
      tenantAssignmentRuleSettingsMock,
    );

    // tenant demo.
    return NextResponse.json({
      items: tenantCategories,
      total: tenantCategories.length,
    });
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  try {
    const res = await client.api.get("/service-desk/assignmet-rules", {
      params,
    });

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  try {
    const res = await client.api.post("/service-desk/assignmet-rules", {
      params,
    });

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200.
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  try {
    const res = await client.api.put("/service-desk/assignmet-rules", {
      params,
    });

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode

  if (!isRemote) {
    return NextResponse.json(null, { status: 204 }); // DELETE is 204.
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  try {
    await client.api.put("/service-desk/category", { params });

    return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 },
    );
  }
}
