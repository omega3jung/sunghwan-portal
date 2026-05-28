"use client";

import { useState } from "react";

import {
  AvatarComboBox,
  AvatarMultiComboBox,
} from "@/components/custom/AvatarComboBox";
import { Input } from "@/components/ui/input";
import { avatarComboMock } from "@/mocks/ui/demo/avatar-multi-combo-box";

export default function AvatarMultiComboBoxPage() {
  const [userValue, setUserValue] = useState<string | null>(null);
  const [usersValue, setUsersValue] = useState<string[]>([]);
  const [maxCount, setMaxCount] = useState<number>(2);

  return (
    <div className="flex flex-col gap-10 p-4">
      <div className="flex items-center gap-2">
        <h4>Max Count</h4>
        <Input
          className="w-20"
          value={maxCount}
          onChange={(e) => setMaxCount(parseInt(e.target.value))}
          type={"number"}
          min={1}
        />
      </div>
      <div>
        <h4 className="py-2">Avatar Combo Box</h4>

        <AvatarComboBox
          options={avatarComboMock}
          value={userValue}
          placeholder="Select User"
          onChange={setUserValue}
          clearable
        />
      </div>
      <div>
        <h4 className="py-2">Avatar Multi Combo Box</h4>

        <AvatarMultiComboBox
          options={avatarComboMock}
          value={usersValue}
          maxImages={maxCount}
          placeholder="Select Users"
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
