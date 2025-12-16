"use client";

import { useState } from "react";
import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
import { data } from "./mock";
import { Input } from "@/components/ui/input";

export default function AvatarMultiComboBoxPage() {
  const [userValue, setUserValue] = useState<string[]>([]);
  const [maxCount, setMaxCount] = useState<number>(2);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex">
        <h4 className="p-2">Max Count</h4>
        <Input
          className="w-20"
          value={maxCount}
          onChange={(e) => setMaxCount(parseInt(e.target.value))}
          type={"number"}
          min={1}
        />
      </div>
      <div>
        <h4 className="p-2">Avatar Multi Combo Box</h4>

        <AvatarMultiComboBox
          options={data ? data : []}
          value={userValue}
          maxImages={maxCount}
          placeholder="Select Users"
          onSelect={(e) => {
            if (e) {
              const currentValue = [...userValue];

              currentValue.push(e);

              setUserValue(currentValue);
            }
          }}
          onRemove={(e) => {
            const currentValue = [...userValue];

            const currentValueindex = currentValue.indexOf(e);

            if (currentValueindex > -1) {
              currentValue.splice(currentValueindex, 1);
              setUserValue(currentValue);
            } else {
              return;
            }
          }}
        />
      </div>
    </div>
  );
}
