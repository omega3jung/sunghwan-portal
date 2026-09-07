// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CategoryData, SubCategoryData } from "../types";
import { CategoryForm } from "./CategoryForm";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: () => null,
}));

vi.mock("../../components/ServiceDeskSettingsLanguageEditor", () => ({
  ServiceDeskSettingsLanguageEditor: ({ children }: { children: ReactNode }) =>
    children,
  ServiceDeskSettingsEditorEmptyState: ({ children }: { children: ReactNode }) =>
    children,
}));

vi.mock("../../components/ServiceDeskSettingsToolbar", () => ({
  ScopeSelect: () => <div>scope select</div>,
}));

const mainCategory: CategoryData = {
  id: "category-1",
  name: { en: "Account" },
  description: { en: "Account requests" },
  requestTemplate: { en: "Describe the account request" },
  index: 1,
  active: false,
  scope: "PORTAL",
  defaultPriority: "medium",
  defaultRiskLevel: "medium",
  defaultSlaDays: 3,
  nodeType: "category",
  isCreated: false,
};

afterEach(cleanup);

function EditableCategoryForm() {
  const [selectedNode, setSelectedNode] = useState<
    CategoryData | SubCategoryData
  >(mainCategory);

  return (
    <CategoryForm
      selectedNode={selectedNode}
      parentCategory={null}
      language="en"
      availableScopes={["PORTAL"]}
      onChange={(updater) => setSelectedNode((current) => updater(current))}
      canActivateCategory
    />
  );
}

describe("CategoryForm", () => {
  it("updates the localized category name when the user edits it", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<EditableCategoryForm />);
    const nameInput = screen.getByLabelText(
      "serviceDeskSettings.categoryTab.name",
    );

    // Act
    await user.clear(nameInput);
    await user.type(nameInput, "Portal account");

    // Assert
    expect(nameInput).toHaveValue("Portal account");
  });

  it("shows the main category SLA as a disabled fallback for a subcategory", () => {
    const subCategory: SubCategoryData = {
      id: "subcategory-1",
      name: { en: "New account" },
      index: 1,
      active: false,
      nodeType: "subCategory",
      isCreated: false,
    };

    render(
      <CategoryForm
        selectedNode={subCategory}
        parentCategory={mainCategory}
        language="en"
        availableScopes={["PORTAL"]}
        onChange={vi.fn()}
        canEdit
        canActivateCategory
      />,
    );

    expect(
      screen.getByLabelText("serviceDeskSettings.categoryTab.resolutionDays"),
    ).toHaveValue(3);
    expect(
      screen.getByLabelText("serviceDeskSettings.categoryTab.resolutionDays"),
    ).toBeDisabled();
  });

  it("blocks activation until an effective assignment rule is ready", () => {
    render(
      <CategoryForm
        selectedNode={mainCategory}
        parentCategory={null}
        language="en"
        availableScopes={["PORTAL"]}
        onChange={vi.fn()}
        canEdit
        canActivateCategory={false}
      />,
    );

    expect(
      screen.getByRole("switch", {
        name: "serviceDeskSettings.categoryTab.active",
      }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByText(
        "serviceDeskSettings.categoryTab.activationRequiresAssignmentRule",
      ),
    ).toBeInTheDocument();
  });
});
