// app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";

import { camelEmployeeMapper } from "@/api/organization/employee/mapper";
import { createEmployeesMock } from "@/app/_mocks/organization/employee/employees";
import { isRemoteRequest } from "@/app/api/_helpers";
import { Employee } from "@/domain/organization";
import { DbParams } from "@/shared/types/api";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock categories of it service deck.

    const employeeData = camelEmployeeMapper(createEmployeesMock());

    return NextResponse.json({
      items: employeeData,
      total: employeeData.length,
    });
  }

  // real backend
  const params = Object.fromEntries(request.nextUrl.searchParams) as DbParams;

  const query = new URLSearchParams(params as any).toString();

  const res = await fetch(`${process.env.API_BASE_URL}/employee?${query}`, {
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

  const body = (await request.json()) as Employee;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  const res = await fetch(`${process.env.API_BASE_URL}/employee`, {
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

  const body = (await request.json()) as Employee;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200.
  }

  // real backend
  const res = await fetch(`${process.env.API_BASE_URL}/employee`, {
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

  const body = (await request.json()) as Employee;

  // demo mode

  if (!isRemote) {
    return NextResponse.json(null, { status: 204 }); // DELETE is 204.
  }

  // real backend
  const res = await fetch(`${process.env.API_BASE_URL}/employee`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status !== 204) {
    await res.json();
  }

  return NextResponse.json(null, { status: 204 });
}
