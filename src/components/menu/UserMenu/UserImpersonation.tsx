"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AvatarComboBox } from "@/components/custom/AvatarComboBox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEligibleImpersonationEmployeeListQuery } from "@/feature/auth/impersonation/client";
import { useCompanyListQuery } from "@/feature/organization/company/client";
import { useCurrentPreference } from "@/feature/user/preference/client";
import { NS } from "@/lib/application/i18n";
import { useLocalizedValue } from "@/lib/client/i18n";
import type { DbParams } from "@/shared/types";

type Props = {
  username?: string;
  excludeUsernames?: string[];
  onUserImpersonate: (impersonatedUsername: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const companyListParams: DbParams = {};

export function UserImpersonation(props: Props) {
  const {
    username,
    excludeUsernames = [],
    onUserImpersonate,
    open,
    onOpenChange,
  } = props;

  const { t } = useTranslation(NS.auth, { keyPrefix: "userMenu" });
  const { t: tCommon } = useTranslation(NS.common);
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [candidate, setCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: companies, isFetching: isCompanyFetching } =
    useCompanyListQuery(companyListParams);
  const { data: eligibleEmployees, isFetching: isEligibleEmployeeFetching } =
    useEligibleImpersonationEmployeeListQuery(open ? selectedCompanyId : null);
  const excludedUserSet = useMemo(
    () =>
      new Set(
        [username, ...excludeUsernames]
          .filter((value): value is string => !!value)
          .map((value) => normalizeUsername(value)),
      ),
    [excludeUsernames, username],
  );

  const selectableEmployees = useMemo(
    () =>
      (eligibleEmployees ?? []).filter(
        (employee) =>
          !excludedUserSet.has(normalizeUsername(employee.username)),
      ),
    [eligibleEmployees, excludedUserSet],
  );
  const companyOptions = useMemo(() => {
    return (companies ?? [])
      .filter((company) => company.active)
      .map((company) => ({
        value: company.id,
        label: tLocal(company.name),
      }));
  }, [companies, tLocal]);
  const impersonationCandidates = useMemo(() => {
    if (!selectedCompanyId) {
      return [];
    }

    return selectableEmployees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.username,
        label: `${name.first} ${name.last}`.trim(),
        displayName: employee.email,
        image: employee.imageUrl ?? undefined,
      };
    });
  }, [selectableEmployees, selectedCompanyId, tLocal]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-md left-auto right-1 top-[60px] translate-x-0 translate-y-0">
        <DialogHeader>
          <DialogTitle>{t("impersonation.label")}</DialogTitle>
        </DialogHeader>

        <Select
          items={companyOptions}
          value={selectedCompanyId ?? ""}
          disabled={isCompanyFetching || companyOptions.length === 0}
          onValueChange={(companyId) => {
            setSelectedCompanyId(companyId);
            setCandidate(null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                isCompanyFetching ? t("loading") : t("selectCompany")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {companyOptions.map((company) => (
              <SelectItem key={company.value} value={company.value}>
                {company.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AvatarComboBox
          badgeVariant={"primary"}
          options={impersonationCandidates}
          value={candidate}
          onChange={setCandidate}
          placeholder={
            isEligibleEmployeeFetching ? t("loading") : t("selectUser")
          }
          disabled={!selectedCompanyId || isEligibleEmployeeFetching}
          clearable
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCandidate(null);
              onOpenChange(false);
            }}
          >
            {tCommon("action.cancel")}
          </Button>

          <Button
            type="button"
            disabled={!candidate || isSubmitting}
            onClick={async () => {
              if (!candidate || isSubmitting) return;

              setIsSubmitting(true);

              try {
                await onUserImpersonate(candidate);
                setCandidate(null);
                onOpenChange(false);
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {t("impersonation.start")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
