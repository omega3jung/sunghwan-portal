// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CategoryPage } from "./CategoryPage";

// vi.mock factories are hoisted, so shared mock functions must be created first.
const { addCategoryMock, onRetryMock, useCategorySettingsMock } = vi.hoisted(
  () => ({
    addCategoryMock: vi.fn(),
    onRetryMock: vi.fn(),
    useCategorySettingsMock: vi.fn(),
  }),
);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../hooks/useCategorySettings", () => ({
  useCategorySettings: useCategorySettingsMock,
}));

vi.mock("../../components/ServiceDeskSettingsPageHeader", () => ({
  ServiceDeskSettingsPageHeader: ({ title }: { title: string }) => (
    <h1>{title}</h1>
  ),
  ServiceDeskSettingsReadOnlyBanner: () => <div>read-only banner</div>,
}));

vi.mock("../../components/ServiceDeskSettingsPageLoading", () => ({
  ServiceDeskSettingsPageLoading: () => <div>category loading</div>,
}));

vi.mock("../../components/ServiceDeskSettingsToolbar", () => ({
  ServiceDeskSettingsToolbar: ({ action }: { action?: ReactNode }) => (
    <div>{action}</div>
  ),
}));

vi.mock("./CategoryTree", () => ({
  CategoryTree: () => <div>category tree</div>,
}));

vi.mock("./CategoryForm", () => ({
  CategoryForm: () => <div>category form</div>,
}));

function createSettings(overrides: Record<string, unknown> = {}) {
  return {
    title: "Category settings",
    description: "Configure ticket categories",
    access: "manage",
    managedBy: "serviceProvider",
    isLoading: false,
    errorMessage: undefined,
    retryLabel: "Retry",
    onRetry: onRetryMock,
    canReset: false,
    onReset: vi.fn(),
    canSave: false,
    onSave: vi.fn(),
    isSaving: false,
    selectedTenant: "tenant-1",
    toolbar: {
      scope: {
        value: "PORTAL",
        onValueChange: vi.fn(),
        availableScopes: ["PORTAL"],
      },
      language: { value: "en", onValueChange: vi.fn() },
    },
    tree: {
      tree: [],
      setTree: vi.fn(),
      selectedId: null,
      setSelectedId: vi.fn(),
      selectedNode: null,
      selectedParentCategory: null,
      addCategory: addCategoryMock,
      addSubCategory: vi.fn(),
      removeCategory: vi.fn(),
      updateSelectedNode: vi.fn(),
      canEdit: true,
      canActivateCategory: false,
    },
    ...overrides,
  };
}

afterEach(cleanup);

describe("CategoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCategorySettingsMock.mockReturnValue(createSettings());
  });

  it("shows a loading state while category settings are being prepared", () => {
    // Arrange
    useCategorySettingsMock.mockReturnValue(
      createSettings({ isLoading: true }),
    );

    // Act
    render(<CategoryPage />);

    // Assert
    expect(screen.getByText("category loading")).toBeInTheDocument();
    expect(screen.queryByText("category tree")).not.toBeInTheDocument();
  });

  it("shows the load error and requests a retry", async () => {
    const user = userEvent.setup();
    useCategorySettingsMock.mockReturnValue(
      createSettings({ errorMessage: "Failed to load categories" }),
    );
    render(<CategoryPage />);

    expect(screen.getByText("Failed to load categories")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetryMock).toHaveBeenCalledOnce();
  });

  it("assembles the settings UI and adds a category in the selected scope", async () => {
    const user = userEvent.setup();
    render(<CategoryPage />);

    expect(
      screen.getByRole("heading", { name: "Category settings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("category tree")).toBeInTheDocument();
    expect(screen.getByText("category form")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "serviceDeskSettings.categoryTab.addCategory",
      }),
    );

    expect(addCategoryMock).toHaveBeenCalledWith("PORTAL");
  });
});
