"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Company } from "@/domain/organization";
import { Tenant } from "@/domain/serviceDesk";
import {
  useCreateServiceDeskTenant,
  useDeleteServiceDeskTenant,
  useUpdateServiceDeskTenant,
} from "@/feature/serviceDesk/tenant/client";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";
import { Locale } from "@/shared/types";

import { TenantSettingItem } from "../types";
import {
  buildInitialTenantSettings,
  cloneTenantSettingItems,
  createTenantFromCompany,
  createTenantSettingItem,
  createTenantSignature,
} from "../utils/mapper";

function toggleSelection(id: string, selectedIds: string[]) {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

function hasTenantSettingsChanged(
  currentTenant: TenantSettingItem,
  baselineTenant: TenantSettingItem,
) {
  return (
    currentTenant.companyId !== baselineTenant.companyId ||
    currentTenant.color !== baselineTenant.color ||
    currentTenant.active !== baselineTenant.active ||
    createTenantSignature([currentTenant]) !==
      createTenantSignature([baselineTenant])
  );
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
  const { mutateAsync: createTenant } = useCreateServiceDeskTenant();
  const { mutateAsync: updateTenant } = useUpdateServiceDeskTenant();
  const { mutateAsync: deleteTenant } = useDeleteServiceDeskTenant();

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
  const lastInitialSignatureRef = useRef(initialSignature);

  const currentSignature = useMemo(
    () => createTenantSignature(tenants),
    [tenants],
  );
  const restorableSourceTenantsByCompanyId = useMemo(
    () => new Map(sourceTenants.map((tenant) => [tenant.companyId, tenant])),
    [sourceTenants],
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

  // logics.
  const hasUnsavedChanges = currentSignature !== savedSignature;
  const canSave = hasUnsavedChanges && !isSaving;
  const canReset = hasUnsavedChanges;

  useEffect(() => {
    const previousInitialSignature = lastInitialSignatureRef.current;
    const matchesLatestQuery = currentSignature === initialSignature;
    const isPristineFromPreviousQuery =
      currentSignature === savedSignature &&
      savedSignature === previousInitialSignature;

    lastInitialSignatureRef.current = initialSignature;

    if (matchesLatestQuery) {
      setSavedSignature(initialSignature);
      return;
    }

    if (!isPristineFromPreviousQuery) {
      return;
    }

    setTenants(cloneTenantSettingItems(initialTenants));
    setSavedSignature(initialSignature);
  }, [currentSignature, initialSignature, initialTenants, savedSignature]);

  useEffect(() => {
    const availableCompanyIds = new Set(
      availableCompanies.map((company) => company.id),
    );

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

    const addedTenants = companiesToAdd.map((company) =>
      createTenantFromCompany(
        company,
        restorableSourceTenantsByCompanyId.get(company.id),
      ),
    );
    const nextTenants = [...tenants, ...addedTenants];

    setTenants(nextTenants);
    setSelectedTenantIds(
      addedTenants
        .filter((tenant) => !tenant.isPortalOwner)
        .map((tenant) => tenant.id),
    );
    setFocusedTenantId(addedTenants[0]?.id ?? null);
    setSelectedCompanyIds([]);
    setSelectedTenantIds([]);
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
    setSelectedCompanyIds([]);
    setSelectedTenantIds([]);
  };

  const handleTenantNameChange = (
    tenantId: string,
    locale: Locale,
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
      const baselineTenantsById = new Map(
        initialTenants.map((tenant) => [tenant.id, tenant]),
      );
      const sourceTenantsById = new Map(
        sourceTenants.map((tenant) => [tenant.id, tenant]),
      );
      const sourceTenantsByCompanyId = new Map(
        sourceTenants.map((tenant) => [tenant.companyId, tenant]),
      );
      const companyById = new Map(
        companies.map((company) => [company.id, company]),
      );
      const createdTenants = nextTenants.filter(
        (tenant) => !sourceTenantsById.has(tenant.id),
      );
      const updatedTenants = nextTenants.filter((tenant) => {
        const sourceTenant = sourceTenantsById.get(tenant.id);
        const baselineTenant = baselineTenantsById.get(tenant.id);

        if (!sourceTenant) {
          return false;
        }

        if (!baselineTenant) {
          return sourceTenant.active === false;
        }

        return hasTenantSettingsChanged(tenant, baselineTenant);
      });
      const removedTenants = initialTenants.filter(
        (tenant) =>
          !tenant.isPortalOwner &&
          !nextTenants.some((nextTenant) => nextTenant.id === tenant.id),
      );
      const savePromise = (async () => {
        const persistedTenantsByCompanyId = new Map(sourceTenantsByCompanyId);

        for (const tenant of createdTenants) {
          const savedTenant = await createTenant({
            companyId: tenant.companyId,
            name: tenant.name,
            color: tenant.color,
            active: tenant.active,
          });

          persistedTenantsByCompanyId.set(savedTenant.companyId, savedTenant);
        }

        for (const tenant of updatedTenants) {
          const savedTenant = await updateTenant({
            id: tenant.id,
            companyId: tenant.companyId,
            name: tenant.name,
            color: tenant.color,
            active: tenant.active,
          });

          persistedTenantsByCompanyId.set(savedTenant.companyId, savedTenant);
        }

        for (const tenant of removedTenants) {
          await deleteTenant(tenant.id);
          persistedTenantsByCompanyId.delete(tenant.companyId);
        }

        const persistedTenantItems = nextTenants.flatMap((tenant) => {
          const persistedTenant = persistedTenantsByCompanyId.get(
            tenant.companyId,
          );
          const nextTenant =
            persistedTenant &&
            createTenantSettingItem(
              persistedTenant,
              companyById.get(tenant.companyId),
            );

          return nextTenant ? [nextTenant] : [];
        });
        const nextSignature = createTenantSignature(persistedTenantItems);
        const idByPreviousId = new Map(
          nextTenants.map((tenant) => [
            tenant.id,
            persistedTenantsByCompanyId.get(tenant.companyId)?.id ?? tenant.id,
          ]),
        );

        setTenants(persistedTenantItems);
        setSelectedTenantIds((currentIds) =>
          Array.from(
            new Set(
              currentIds
                .map((tenantId) => idByPreviousId.get(tenantId) ?? tenantId)
                .filter((tenantId) =>
                  persistedTenantItems.some((tenant) => tenant.id === tenantId),
                ),
            ),
          ),
        );
        setFocusedTenantId((currentId) => {
          if (!currentId) {
            return null;
          }

          const nextTenantId = idByPreviousId.get(currentId) ?? currentId;

          return persistedTenantItems.some(
            (tenant) => tenant.id === nextTenantId,
          )
            ? nextTenantId
            : null;
        });
        setSavedSignature(nextSignature);

        return persistedTenantItems;
      })();

      void mutationToast(
        savePromise,
        "save",
        t("serviceDeskSettings.common.tenant"),
      );
      await savePromise;
    } catch {
      // Toast is handled by useMutationToast.
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTenants(cloneTenantSettingItems(initialTenants));
    setSavedSignature(initialSignature);
    setSelectedCompanyIds([]);
    setSelectedTenantIds([]);
    setFocusedTenantId(null);
  };

  return {
    pageHeader: {
      canSave,
      canReset,
      isSaving,
      onSave: handleSave,
      onReset: handleReset,
    },
    companyList: {
      companies: availableCompanies,
      selectedCompanyIds,
      disabled: isSaving,
      onSelectCompany: handleCompanySelect,
    },
    transferControls: {
      canAddTenants: selectedCompanyIds.length > 0 && !isSaving,
      canRemoveTenants: removableSelectedTenantIds.length > 0 && !isSaving,
      disabled: isSaving,
      onAddTenants: handleAddTenants,
      onRemoveTenants: handleRemoveTenants,
    },
    tenantList: {
      tenants,
      selectedTenantIds,
      focusedTenantId,
      onSelectTenant: handleTenantSelect,
    },
    settingInfo: {
      tenant: focusedTenant,
      disabled: isSaving,
      onTenantNameChange: handleTenantNameChange,
      onTenantColorChange: handleTenantColorChange,
    },
  };
}
