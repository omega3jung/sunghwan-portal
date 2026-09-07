import { describe, expect, it } from "vitest";

import {
  toCompanyWritePayload,
  toDepartmentWritePayload,
  toEmployeeWritePayload,
  toJobFieldWritePayload,
} from "./write";

describe("organization write contracts", () => {
  it("normalizes optional company and department fields at the API boundary", () => {
    expect(
      toCompanyWritePayload({
        name: { en: "Customer" },
        code: undefined,
        isPortalOwner: false,
        active: true,
      }),
    ).toEqual({
      company_id: null,
      company_name: { en: "Customer" },
      company_code: null,
      company_portal_owner: false,
      company_active: true,
    });

    expect(
      toDepartmentWritePayload({
        id: "10",
        name: { en: "Support" },
        code: undefined,
        description: undefined,
        companyId: "2",
        parentId: undefined,
        active: true,
      }),
    ).toEqual(
      expect.objectContaining({
        d_id: 10,
        d_code: null,
        d_description: null,
        d_company_id: 2,
        d_parent_id: null,
      }),
    );
  });

  it("normalizes job-field relationship identifiers and invalid optional ids", () => {
    expect(
      toJobFieldWritePayload({
        id: "invalid",
        name: { en: "Engineer" },
        description: undefined,
        departmentId: "20",
        companyId: "2",
        parentId: undefined,
        active: true,
      }),
    ).toEqual(
      expect.objectContaining({
        jf_id: null,
        jf_description: null,
        jf_department_id: 20,
        jf_company_id: 2,
        jf_parent_id: null,
      }),
    );
  });

  it("maps employee relationships, dates, and nullable optional fields", () => {
    const startDate = new Date("2026-01-01T00:00:00.000Z");

    expect(
      toEmployeeWritePayload({
        id: "42",
        username: "worker",
        name: { en: { first: "W", last: "K" } },
        phone: "010",
        email: "worker@example.com",
        imageUrl: undefined,
        departmentId: "10",
        jobFieldId: "20",
        companyId: "2",
        startDate,
        endDate: undefined,
        shiftId: undefined,
        active: true,
        engineerId: "30",
        rfTagId: undefined,
        hourRate: undefined,
      }),
    ).toEqual({
      e_id: 42,
      e_username: "worker",
      e_name: { en: { first: "W", last: "K" } },
      e_phone: "010",
      e_email: "worker@example.com",
      e_image_url: null,
      e_department_id: 10,
      e_job_field_id: 20,
      e_company_id: 2,
      e_start_date: startDate,
      e_end_date: null,
      e_work_shift_id: null,
      e_active: true,
      e_engineer_id: 30,
      e_rf_tag_id: null,
      e_hour_rate: null,
    });
  });
});
