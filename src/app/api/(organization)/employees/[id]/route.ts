// app/api/employees/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { camelEmployeeMapper } from "@/api/organization/employee/mapper";
import { employeesMock } from "@/app/_mocks/organization/employee/employees";
import { isRemoteRequest } from "@/app/api/_helpers";
import { Employee } from "@/domain/organization";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(req);

  // demo mode
  if (!isRemote) {
    // Return mock department.

    const employeeData = camelEmployeeMapper(employeesMock);
    const targetEmployee = employeeData.find((employee) => employee.id === id);

    if (!targetEmployee) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetEmployee);
  }

  // real backend
  const res = await fetch(`${process.env.API_BASE_URL}/employee/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer TOKEN`,
    },
    cache: "no-store",
    body: JSON.stringify(id),
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to fetch user preference" },
      { status: 500 },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as Employee;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 201 }); // POST is 201.
  }

  // real backend
  const res = await fetch(`${process.env.API_BASE_URL}/employee/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as Employee;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(body, { status: 200 }); // PUT is 200.
  }

  // real backend
  const res = await fetch(`${process.env.API_BASE_URL}/employee/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(req);

  const body = (await req.json()) as Employee;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(null, { status: 204 }); // DELETE is 204.
  }

  // real backend
  const res = await fetch(`${process.env.API_BASE_URL}/employee/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status !== 204) {
    await res.json();
  }

  return NextResponse.json(null, { status: 204 });
}
