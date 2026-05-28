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
import { useEmployeeListQuery } from "@/feature/organization/employee/queries";
import { useCurrentPreference } from "@/feature/user/preference/client";
import { useLocalizedValue } from "@/shared/hooks";

type Props = {
  username: string;
  onUserImpersonate: (impersonatedUsername: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserImpersonation(props: Props) {
  const { username, onUserImpersonate, open, onOpenChange } = props;

  const { t } = useTranslation("UserMenu");
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);

  const [candidate, setCandidate] = useState<string | null>(null);
  const { data: employees, isFetching } = useEmployeeListQuery({});

  const impersonationCandidates = useMemo(() => {
    if (!employees) {
      return [];
    }

    return employees
      .filter((employee) => employee.userName !== username)
      .map((employee) => {
        const name = tLocal(employee.name);

        return {
          value: employee.userName,
          label: `${name.first} ${name.last}`.trim(),
          displayName: employee.email,
          image: employee.imageUrl,
        };
      });
  }, [employees, tLocal, username]);

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
            onClick={() => onOpenChange(false)}
          >
            {t("action.cancel", { ns: "common" })}
          </Button>

          <Button
            type="button"
            disabled={!candidate}
            onClick={() => {
              if (candidate) {
                onUserImpersonate(candidate);
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
