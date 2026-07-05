"use client";

import { useState } from "react";

import {
  HierarchicalSelect,
  type HierarchicalSelectItem,
} from "@/components/custom/HierarchicalSelect";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";

const categoryItems: HierarchicalSelectItem[] = [
  {
    value: "portal",
    label: "Portal",
    children: [
      {
        value: "portal-account",
        label: "Account",
        children: [
          { value: "portal-account-login", label: "Login" },
          { value: "portal-account-profile", label: "Profile" },
        ],
      },
      {
        value: "portal-notification",
        label: "Notification",
        children: [
          { value: "portal-notification-email", label: "Email" },
          { value: "portal-notification-push", label: "Push" },
        ],
      },
    ],
  },
  {
    value: "operations",
    label: "Operations",
    children: [
      { value: "operations-approval", label: "Approval" },
      { value: "operations-assignment", label: "Assignment" },
      { value: "operations-reporting", label: "Reporting", disabled: true },
    ],
  },
  {
    value: "general",
    label: "General",
  },
];

export default function HierarchicalSelectPage() {
  const [category, setCategory] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 p-4">
      <FieldGroup className="max-w-xl">
        <FieldSet>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <HierarchicalSelect
              value={category}
              items={categoryItems}
              placeholder="Select category"
              backLabel="Back"
              emptyText="No categories"
              onValueChange={setCategory}
              getDisplayLabel={(_, path) =>
                path.map((item) => item.label).join(" / ")
              }
            />
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
