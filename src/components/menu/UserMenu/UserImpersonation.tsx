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
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useCurrentPreference } from "@/feature/user/preference/client";
import { useLocalizedValue } from "@/lib/client/i18n";
import type { DbParams } from "@/shared/types";
import { createFieldFilter } from "@/shared/utils/routing";

type Props = {
  username?: string;
  excludeUsernames?: string[];
  onUserImpersonate: (impersonatedUsername: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const activeEmployeeListParams: DbParams = {
  filter: createFieldFilter({
    field: "e_active",
    value: true,
  }),
};

export function UserImpersonation(props: Props) {
  const {
    username,
    excludeUsernames = [],
    onUserImpersonate,
    open,
    onOpenChange,
  } = props;

  const { t } = useTranslation("UserMenu");
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);

  const [candidate, setCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: employees, isFetching } = useEmployeeListQuery(
    activeEmployeeListParams,
  );
  const excludedUserSet = useMemo(
    () =>
      new Set(
        [username, ...excludeUsernames].filter(
          (value): value is string => !!value,
        ).map((value) => normalizeUsername(value)),
      ),
    [excludeUsernames, username],
  );

  const impersonationCandidates = useMemo(() => {
    if (!employees) {
      return [];
    }

    return employees
      .filter(
        (employee) =>
          !excludedUserSet.has(normalizeUsername(employee.username)),
      )
      .map((employee) => {
        const name = tLocal(employee.name);

        return {
          value: employee.username,
          label: `${name.first} ${name.last}`.trim(),
          displayName: employee.email,
          image: employee.imageUrl,
        };
      });
  }, [employees, excludedUserSet, tLocal]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-md left-auto right-1 top-[60px] translate-x-0 translate-y-0">
        <DialogHeader>
          <DialogTitle>{t("impersonation")}</DialogTitle>
        </DialogHeader>

        <AvatarComboBox
          options={impersonationCandidates}
          value={candidate}
          onChange={setCandidate}
          placeholder={isFetching ? t("loading") : t("selectUser")}
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
            {t("action.cancel", { ns: "common" })}
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
            {t("startImpersonation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
