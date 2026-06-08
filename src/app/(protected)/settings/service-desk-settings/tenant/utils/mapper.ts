import { Company } from "@/domain/organization";
import { Tenant } from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";

import { DEFAULT_TENANT_COLOR } from "../constants";
import {
  CompanySettingItem,
  TenantLocalizedText,
  TenantSettingItem,
} from "../types";

export function normalizeLocalizedText(
  value: LocalizedText,
): TenantLocalizedText {
  const fallback = value.en ?? "";

  return {
    en: value.en ?? fallback,
    es: value.es ?? fallback,
    fr: value.fr ?? fallback,
    ko: value.ko ?? fallback,
  };
}

export function cloneTenantSettingItem(
  item: TenantSettingItem,
): TenantSettingItem {
  return {
    ...item,
    name: { ...item.name },
  };
}

export function cloneTenantSettingItems(
  items: TenantSettingItem[],
): TenantSettingItem[] {
  return items.map(cloneTenantSettingItem);
}

export function createTenantSignature(items: TenantSettingItem[]) {
  return JSON.stringify(
    items.map((item) => ({
      id: item.id,
      companyId: item.companyId,
      name: item.name,
      code: item.code ?? "",
      color: item.color,
      active: item.active,
      isPortalOwner: item.isPortalOwner ?? false,
    })),
  );
}

export function createTenantSettingItem(
  tenant: Tenant,
  company?: CompanySettingItem,
): TenantSettingItem | null {
  if (!company || tenant.active === false) {
    return null;
  }

  return {
    id: tenant.id,
    companyId: tenant.companyId,
    name: normalizeLocalizedText(tenant.name),
    code: company.code,
    color: tenant.color || DEFAULT_TENANT_COLOR,
    active: tenant.active,
    isPortalOwner: company.isPortalOwner,
  };
}

export function buildInitialTenantSettings(
  companies: CompanySettingItem[],
  sourceTenants: Tenant[],
): TenantSettingItem[] {
  const companyById = new Map(
    companies.map((company) => [company.id, company]),
  );

  const mappedTenants: TenantSettingItem[] = [];

  sourceTenants.forEach((tenant) => {
    const nextTenant = createTenantSettingItem(
      tenant,
      companyById.get(tenant.companyId),
    );

    if (nextTenant) {
      mappedTenants.push(nextTenant);
    }
  });

  if (mappedTenants.length > 0) {
    return mappedTenants;
  }

  const fallbackCompany = companies.find(
    (company) => company.isPortalOwner && company.active,
  );

  return fallbackCompany
    ? [
        {
          id: fallbackCompany.id,
          companyId: fallbackCompany.id,
          name: normalizeLocalizedText(fallbackCompany.name),
          code: fallbackCompany.code,
          color: DEFAULT_TENANT_COLOR,
          active: true,
          isPortalOwner: true,
        },
      ]
    : [];
}

export function createTenantFromCompany(
  company: Company,
): TenantSettingItem {
  return {
    id: company.id,
    companyId: company.id,
    name: normalizeLocalizedText(company.name),
    code: company.code,
    color: DEFAULT_TENANT_COLOR,
    active: company.active,
    isPortalOwner: company.isPortalOwner,
  };
}
