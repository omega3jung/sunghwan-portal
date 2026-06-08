"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Company } from "@/domain/organization";
import { Tenant } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";

import { TenantLocaleKey, TenantSettingItem } from "../types";
import {
  buildInitialTenantSettings,
  cloneTenantSettingItems,
  createTenantFromCompany,
  createTenantSignature,
} from "../utils/mapper";

function toggleSelection(id: string, selectedIds: string[]) {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

type UseTenantSettingsOptions = {
  companies: Company[];
  sourceTenants: Tenant[];
};

export function useTenantSettings({
  companies,
  sourceTenants,
}: UseTenantSettingsOptions) {
  const { t } = useTranslation(NS.settings);
  const mutationToast = useMutationToast();

  const initialTenants = useMemo(() => {
    return buildInitialTenantSettings(companies, sourceTenants);
  }, [companies, sourceTenants]);
  const initialSignature = useMemo(() => {
    return createTenantSignature(initialTenants);
  }, [initialTenants]);
  const [tenants, setTenants] = useState<TenantSettingItem[]>(() =>
    cloneTenantSettingItems(initialTenants),
  );
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [focusedTenantId, setFocusedTenantId] = useState<string | null>(null);
  const [savedSignature, setSavedSignature] = useState(initialSignature);
  const [isSaving, setIsSaving] = useState(false);

  const currentSignature = useMemo(
    () => createTenantSignature(tenants),
    [tenants],
  );
  const tenantCompanyIds = useMemo(
    () => new Set(tenants.map((tenant) => tenant.companyId)),
    [tenants],
  );
  const availableCompanies = useMemo(() => {
    return companies.filter(
      (company) => company.active && !tenantCompanyIds.has(company.id),
    );
  }, [companies, tenantCompanyIds]);
  const focusedTenant =
    tenants.find((tenant) => tenant.id === focusedTenantId) ?? null;
  const removableSelectedTenantIds = useMemo(() => {
    return selectedTenantIds.filter((tenantId) => {
      const tenant = tenants.find((item) => item.id === tenantId);
      return Boolean(tenant && !tenant.isPortalOwner);
    });
  }, [selectedTenantIds, tenants]);

  const canSave = currentSignature !== savedSignature && !isSaving;
  const canReset =
    currentSignature !== initialSignature ||
    selectedCompanyIds.length > 0 ||
    selectedTenantIds.length > 0 ||
    focusedTenantId !== null;

  useEffect(() => {
    if (currentSignature !== savedSignature) {
      return;
    }

    setTenants(cloneTenantSettingItems(initialTenants));
    setSavedSignature(initialSignature);
  }, [currentSignature, initialSignature, initialTenants, savedSignature]);

  useEffect(() => {
    const availableCompanyIds = new Set(availableCompanies.map((company) => company.id));

    setSelectedCompanyIds((currentIds) =>
      currentIds.filter((companyId) => availableCompanyIds.has(companyId)),
    );
  }, [availableCompanies]);

  useEffect(() => {
    const tenantIds = new Set(tenants.map((tenant) => tenant.id));

    setSelectedTenantIds((currentIds) =>
      currentIds.filter((tenantId) => tenantIds.has(tenantId)),
    );
    setFocusedTenantId((currentId) =>
      currentId && tenantIds.has(currentId) ? currentId : null,
    );
  }, [tenants]);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyIds((currentIds) =>
      toggleSelection(companyId, currentIds),
    );
  };

  const handleTenantSelect = (tenant: TenantSettingItem) => {
    setFocusedTenantId(tenant.id);

    if (tenant.isPortalOwner) {
      return;
    }

    setSelectedTenantIds((currentIds) =>
      toggleSelection(tenant.id, currentIds),
    );
  };

  const handleAddTenants = () => {
    if (selectedCompanyIds.length === 0) {
      return;
    }

    const companiesToAdd = availableCompanies.filter((company) =>
      selectedCompanyIds.includes(company.id),
    );

    if (companiesToAdd.length === 0) {
      return;
    }

    const nextTenants = [
      ...tenants,
      ...companiesToAdd.map((company) => createTenantFromCompany(company)),
    ];

    setTenants(nextTenants);
    setSelectedTenantIds(
      companiesToAdd
        .filter((company) => !company.isPortalOwner)
        .map((company) => company.id),
    );
    setFocusedTenantId(companiesToAdd[0]?.id ?? null);
    setSelectedCompanyIds([]);
  };

  const handleRemoveTenants = () => {
    if (removableSelectedTenantIds.length === 0) {
      return;
    }

    setTenants((currentTenants) =>
      currentTenants.filter(
        (tenant) => !removableSelectedTenantIds.includes(tenant.id),
      ),
    );
    setSelectedTenantIds((currentIds) =>
      currentIds.filter(
        (tenantId) => !removableSelectedTenantIds.includes(tenantId),
      ),
    );
    setFocusedTenantId((currentId) =>
      currentId && removableSelectedTenantIds.includes(currentId)
        ? null
        : currentId,
    );
  };

  const handleTenantNameChange = (
    tenantId: string,
    locale: TenantLocaleKey,
    value: string,
  ) => {
    setTenants((currentTenants) =>
      currentTenants.map((tenant) =>
        tenant.id === tenantId
          ? {
              ...tenant,
              name: {
                ...tenant.name,
                [locale]: value,
              },
            }
          : tenant,
      ),
    );
  };

  const handleTenantColorChange = (tenantId: string, color: string) => {
    setTenants((currentTenants) =>
      currentTenants.map((tenant) =>
        tenant.id === tenantId
          ? {
              ...tenant,
              color,
            }
          : tenant,
      ),
    );
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);

    try {
      const nextTenants = cloneTenantSettingItems(tenants);
      const savePromise = Promise.resolve(nextTenants);
      void mutationToast(
        savePromise,
        "save",
        t("serviceDeskSettings.general.tenant"),
      );
      await savePromise;
      setSavedSignature(createTenantSignature(nextTenants));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTenants(cloneTenantSettingItems(initialTenants));
    setSelectedCompanyIds([]);
    setSelectedTenantIds([]);
    setFocusedTenantId(null);
  };

  return {
    companies,
    tenants,
    availableCompanies,
    focusedTenant,
    selectedCompanyIds,
    selectedTenantIds,
    focusedTenantId,
    removableSelectedTenantIds,
    canSave,
    canReset,
    isSaving,
    handleCompanySelect,
    handleTenantSelect,
    handleAddTenants,
    handleRemoveTenants,
    handleTenantNameChange,
    handleTenantColorChange,
    handleSave,
    handleReset,
  };
}
