import { NextRequest, NextResponse } from "next/server";

import { isRemoteRequest } from "@/app/api/_helpers";
import {
  camelCompanyMapper,
  mapCompanyItemPayload,
  mapCompanyListPayload,
} from "@/feature/organization/company/mapper";
import {
  CreateCompanyInput,
  toCompanyMockResource,
  toCompanyWritePayload,
} from "@/feature/organization/company/write";
import { allCompaniesMock } from "@/mocks/domain/organization/companies";

import { portalApiJson } from "../../_helpers/portalApiJson";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    const companyData = camelCompanyMapper(
      allCompaniesMock
        .filter((company) => company.company_active)
        .sort(compareCompanies),
    );

    return NextResponse.json({
      items: companyData,
      total: companyData.length,
    });
  }

  // real backend
  return portalApiJson(request, {
    path: "/company",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch companies",
    mapData: mapCompanyListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  const body = (await request.json()) as CreateCompanyInput;

  // demo mode
  if (!isRemote) {
    return NextResponse.json(toCompanyMockResource(body), { status: 201 });
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/company",
    body: toCompanyWritePayload(body),
    errorMessage: "Failed to create company",
    mapData: mapCompanyItemPayload,
  });
}

function compareCompanies(
  a: (typeof allCompaniesMock)[number],
  b: (typeof allCompaniesMock)[number],
) {
  if (a.company_portal_owner !== b.company_portal_owner) {
    return Number(a.company_portal_owner) - Number(b.company_portal_owner);
  }

  const nameCompare = (a.company_name.en ?? "").localeCompare(
    b.company_name.en ?? "",
  );

  if (nameCompare !== 0) {
    return nameCompare;
  }

  const codeCompare = (a.company_code ?? "").localeCompare(b.company_code ?? "");

  if (codeCompare !== 0) {
    return codeCompare;
  }

  return a.company_id - b.company_id;
}
