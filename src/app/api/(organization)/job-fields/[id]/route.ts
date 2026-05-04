// app/api/job-fields/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { IdRouteContext } from "@/app/api/_helpers/types";
import {
  camelJobFieldMapper,
  mapJobFieldItemPayload,
} from "@/feature/organization/jobField/mapper";
import {
  toJobFieldMockResource,
  toJobFieldWritePayload,
  UpdateJobFieldInput,
} from "@/feature/organization/jobField/write";
import { jobFieldsMock } from "@/mocks/domain/organization/jobFields";

export async function GET(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    // Return mock department.

    const jobFieldData = camelJobFieldMapper(jobFieldsMock);
    const targetDepartment = jobFieldData.find(
      (jobField) => jobField.id === id,
    );

    if (!targetDepartment) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(targetDepartment);
  }

  return proxyJson(request, {
    path: `/job-field/${id}`,
    errorMessage: "Failed to fetch job field",
    mapData: mapJobFieldItemPayload,
  });
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as UpdateJobFieldInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(toJobFieldMockResource(body, id), { status: 200 });
  }

  return proxyJson(request, {
    method: "PUT",
    path: `/job-field/${id}`,
    body: toJobFieldWritePayload({ ...body, id }),
    errorMessage: "Failed to update job field",
    mapData: mapJobFieldItemPayload,
  });
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const { id } = context.params;
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    return new NextResponse(null, { status: 204 }); // DELETE is 204.
  }

  return proxyJson(request, {
    method: "DELETE",
    path: `/job-field/${id}`,
    errorMessage: "Failed to delete job field",
  });
}
