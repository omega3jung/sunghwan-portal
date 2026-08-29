import { describe, expect, it } from "vitest";

import type { Company } from "@/domain/organization";
import type { Tenant } from "@/domain/serviceDesk";

import { DEFAULT_TENANT_COLOR } from "../constants";
import type { TenantSettingItem } from "../types";
import {
  buildInitialTenantSettings,
  cloneTenantSettingItems,
  createTenantFromCompany,
  createTenantSettingItem,
  createTenantSignature,
  normalizeLocalizedText,
} from "./mapper";

const customerCompany: Company = {
  id: "company-1",
  name: { en: "Customer company" },
  code: "C1",
  isPortalOwner: false,
  active: true,
};

const ownerCompany: Company = {
  id: "company-owner",
  name: { en: "Owner company", ko: "오너 회사" },
  code: "OWNER",
  isPortalOwner: true,
  active: true,
};

const customerTenant: Tenant = {
  id: "tenant-1",
  companyId: customerCompany.id,
  name: { en: "Customer tenant", ko: "고객 테넌트" },
  color: "#2563eb",
  active: true,
};

const ownerTenant: Tenant = {
  id: "tenant-owner",
  companyId: ownerCompany.id,
  name: { en: "Owner tenant", ko: "오너 테넌트" },
  color: "#345791",
  active: true,
};

function createTenantSetting(
  overrides: Partial<TenantSettingItem> = {},
): TenantSettingItem {
  return {
    id: "tenant-1",
    companyId: "company-1",
    name: normalizeLocalizedText({ en: "Customer tenant" }),
    code: "C1",
    color: "#2563eb",
    active: true,
    isPortalOwner: false,
    ...overrides,
  };
}

describe("normalizeLocalizedText", () => {
  it("uses English as the fallback while preserving an explicit translation", () => {
    // Arrange
    const name = { en: "Customer tenant", ko: "고객 테넌트" };

    // Act
    const result = normalizeLocalizedText(name);

    // Assert
    expect(result).toEqual({
      en: "Customer tenant",
      es: "Customer tenant",
      fr: "Customer tenant",
      ko: "고객 테넌트",
    });
  });
});

describe("cloneTenantSettingItems", () => {
  it("creates independent name objects so draft edits do not mutate the source", () => {
    const source = [createTenantSetting()];

    const cloned = cloneTenantSettingItems(source);
    cloned[0].name.en = "Edited tenant";

    expect(cloned).not.toBe(source);
    expect(cloned[0]).not.toBe(source[0]);
    expect(cloned[0].name).not.toBe(source[0].name);
    expect(source[0].name.en).toBe("Customer tenant");
  });
});

describe("createTenantSignature", () => {
  it("treats omitted optional metadata as its stable default value", () => {
    const omittedMetadata = createTenantSetting({
      code: undefined,
      isPortalOwner: undefined,
    });
    const explicitDefaults = createTenantSetting({
      code: "",
      isPortalOwner: false,
    });

    expect(createTenantSignature([omittedMetadata])).toBe(
      createTenantSignature([explicitDefaults]),
    );
  });

  it("changes when an editable tenant setting changes", () => {
    const original = createTenantSetting();
    const edited = createTenantSetting({ color: "#dc2626" });

    expect(createTenantSignature([edited])).not.toBe(
      createTenantSignature([original]),
    );
  });
});

describe("createTenantSettingItem", () => {
  it("combines persisted tenant values with company display metadata", () => {
    // Arrange
    const tenantWithoutColor = { ...customerTenant, color: "" };

    // Act
    const result = createTenantSettingItem(tenantWithoutColor, customerCompany);

    // Assert
    expect(result).toEqual({
      id: "tenant-1",
      companyId: "company-1",
      name: {
        en: "Customer tenant",
        es: "Customer tenant",
        fr: "Customer tenant",
        ko: "고객 테넌트",
      },
      code: "C1",
      color: DEFAULT_TENANT_COLOR,
      active: true,
      isPortalOwner: false,
    });
  });

  it("excludes an inactive tenant or a tenant without a matching company", () => {
    expect(
      createTenantSettingItem(
        { ...customerTenant, active: false },
        customerCompany,
      ),
    ).toBeNull();
    expect(createTenantSettingItem(customerTenant)).toBeNull();
  });
});

describe("buildInitialTenantSettings", () => {
  it("keeps only active tenants that have a matching company", () => {
    const inactiveTenant: Tenant = {
      ...customerTenant,
      id: "tenant-inactive",
      active: false,
    };
    const tenantWithoutCompany: Tenant = {
      ...customerTenant,
      id: "tenant-without-company",
      companyId: "missing-company",
    };

    const result = buildInitialTenantSettings(
      [customerCompany, ownerCompany],
      [customerTenant, inactiveTenant, tenantWithoutCompany],
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "tenant-1",
      companyId: "company-1",
      code: "C1",
    });
  });

  it("creates the active portal-owner fallback when no tenant can be restored", () => {
    const result = buildInitialTenantSettings([ownerCompany], []);

    expect(result).toEqual([
      {
        id: "company-owner",
        companyId: "company-owner",
        name: {
          en: "Owner company",
          es: "Owner company",
          fr: "Owner company",
          ko: "오너 회사",
        },
        code: "OWNER",
        color: DEFAULT_TENANT_COLOR,
        active: true,
        isPortalOwner: true,
      },
    ]);
  });

  it("returns an empty list when there is no restorable tenant or active owner", () => {
    const inactiveOwner = { ...ownerCompany, active: false };

    expect(buildInitialTenantSettings([inactiveOwner], [])).toEqual([]);
  });
});

describe("createTenantFromCompany", () => {
  it("restores persisted tenant values and combines them with company metadata", () => {
    const result = createTenantFromCompany(customerCompany, customerTenant);

    expect(result).toEqual({
      id: "tenant-1",
      companyId: "company-1",
      name: {
        en: "Customer tenant",
        es: "Customer tenant",
        fr: "Customer tenant",
        ko: "고객 테넌트",
      },
      code: "C1",
      color: "#2563eb",
      active: true,
      isPortalOwner: false,
    });
  });

  it("creates an active tenant with company values and the default color", () => {
    const result = createTenantFromCompany(customerCompany);

    expect(result).toEqual({
      id: "company-1",
      companyId: "company-1",
      name: {
        en: "Customer company",
        es: "Customer company",
        fr: "Customer company",
        ko: "Customer company",
      },
      code: "C1",
      color: DEFAULT_TENANT_COLOR,
      active: true,
      isPortalOwner: false,
    });
  });

  it("restores the owner tenant and marks it as the portal owner", () => {
    const result = createTenantFromCompany(ownerCompany, ownerTenant);

    expect(result).toEqual({
      id: "tenant-owner",
      companyId: "company-owner",
      name: {
        en: "Owner tenant",
        es: "Owner tenant",
        fr: "Owner tenant",
        ko: "오너 테넌트",
      },
      code: "OWNER",
      color: "#345791",
      active: true,
      isPortalOwner: true,
    });
  });
});
