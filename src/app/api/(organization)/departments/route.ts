// app/api/departments/route.ts
import { NextRequest, NextResponse } from "next/server";

import { camelDepartmentMapper } from "@/api/organization/department/mapper";
import { departmentsMock } from "@/app/_mocks/organization";
import { isRemoteRequest } from "@/app/api/_helpers";
import { Preference } from "@/domain/config";
import { DbParams } from "@/shared/types/api";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const departmentData = camelDepartmentMapper(departmentsMock);

    return NextResponse.json({
      items: departmentData,
      total: departmentData.length,
    });
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  const query = new URLSearchParams(params as any).toString();

  const res = await fetch(`${process.env.API_BASE_URL}/department?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer TOKEN`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  const res = await fetch(`${process.env.API_BASE_URL}/department`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer TOKEN`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200.
  }

  // real backend
  const res = await fetch(`${process.env.API_BASE_URL}/department`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer TOKEN`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as Preference;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(null, { status: 204 }); // DELETE is 204.
  }

  // real backend
  const res = await fetch(`${process.env.API_BASE_URL}/department`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status !== 204) {
    await res.json();
  }

  return NextResponse.json(null, { status: 204 });
}
