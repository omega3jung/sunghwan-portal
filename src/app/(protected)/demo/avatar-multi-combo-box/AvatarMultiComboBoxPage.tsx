"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AvatarComboBox,
  AvatarMultiComboBox,
} from "@/components/custom/AvatarComboBox";
import { Input } from "@/components/ui/input";
import { NS } from "@/lib/application/i18n";
import { avatarComboMock } from "@/mocks/ui/demo/avatar-multi-combo-box";

export function AvatarMultiComboBoxPage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "avatarComboBox" });
  const [userValue, setUserValue] = useState<string | null>(null);
  const [usersValue, setUsersValue] = useState<string[]>([]);
  const [maxCount, setMaxCount] = useState<number>(2);

  return (
    <div className="flex flex-col gap-10 p-4">
      <div className="flex items-center gap-2">
        <h4>{t("maxCount")}</h4>
        <Input
          className="w-20"
          value={maxCount}
          onChange={(e) => setMaxCount(parseInt(e.target.value))}
          type={"number"}
          min={1}
        />
      </div>
      <div>
        <h4 className="py-2">{t("singleTitle")}</h4>

        <AvatarComboBox
          className="h-10"
          options={avatarComboMock}
          value={userValue}
          placeholder={t("selectUser")}
          onChange={setUserValue}
          clearable
        />
      </div>
      <div>
        <h4 className="py-2">{t("multipleTitle")}</h4>

        <AvatarMultiComboBox
          className="h-10"
          options={avatarComboMock}
          value={usersValue}
          maxImages={maxCount}
          placeholder={t("selectUsers")}
          onSelect={(e) => {
            if (e) {
              const currentValue = [...usersValue];

              currentValue.push(e);

              setUsersValue(currentValue);
            }
          }}
          onRemove={(e) => {
            const currentValue = [...usersValue];

            const currentValueIndex = currentValue.indexOf(e);

            if (currentValueIndex > -1) {
              currentValue.splice(currentValueIndex, 1);
              setUsersValue(currentValue);
            } else {
              return;
            }
          }}
        />
      </div>
    </div>
  );
}
