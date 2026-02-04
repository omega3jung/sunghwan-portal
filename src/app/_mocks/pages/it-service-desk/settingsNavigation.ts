import { TFunction } from "i18next";
import { Database, Eye, Headset, UserRound, Workflow } from "lucide-react";

import { LucideIcon } from "@/types";

interface SettingsCardGroup {
  triggerTitle: string;
  triggerDescription: string;
  path: string;
  icon: LucideIcon;
}

interface SettingsNavigationGroup {
  triggerTitle: string;
  triggerDescription: string;
  items: { title: string; path: string; description: string }[];
}

const ns = { ns: "settings" };

export function createSettingsCardMock(t: TFunction): SettingsCardGroup[] {
  return [
    {
      triggerTitle: t("settingsNavigation.dataSetup.title", ns),
      triggerDescription: t("settingsNavigation.dataSetup.description", ns),
      path: "/settings/data-setup/",
      icon: Database,
    },
    {
      triggerTitle: t("settingsNavigation.accountSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.accountSettings.description",
        ns
      ),
      path: "/settings/account-settings/",
      icon: UserRound,
    },
    {
      triggerTitle: t("settingsNavigation.accessControl.title", ns),
      triggerDescription: t("settingsNavigation.accessControl.description", ns),
      path: "/settings/access-control/",
      icon: Eye,
    },
    {
      triggerTitle: t("settingsNavigation.workflowSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.workflowSettings.description",
        ns
      ),
      path: "/settings/workflow-settings/",
      icon: Workflow,
    },
    {
      triggerTitle: t("settingsNavigation.itServiceDeskSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.itServiceDeskSettings.description",
        ns
      ),
      path: "/settings/it-service-desk-settings",
      icon: Headset,
    },
  ];
}

export function createSettingsNavigationMock(
  t: TFunction
): SettingsNavigationGroup[] {
  return [
    {
      triggerTitle: t("settingsNavigation.dataSetup.title", ns),
      triggerDescription: t("settingsNavigation.dataSetup.description", ns),
      items: [
        {
          title: t("settingsNavigation.dataSetup.carrier.title", ns),
          path: "/settings/data-setup/carrier",
          description: t(
            "settingsNavigation.dataSetup.carrier.description",
            ns
          ),
        },
        {
          title: t("settingsNavigation.dataSetup.project.title", ns),
          path: "/settings/data-setup/project",
          description: t(
            "settingsNavigation.dataSetup.project.description",
            ns
          ),
        },
        {
          title: t("settingsNavigation.dataSetup.maker.title", ns),
          path: "/settings/data-setup/maker",
          description: t("settingsNavigation.dataSetup.maker.description", ns),
        },
        {
          title: t("settingsNavigation.dataSetup.model.title", ns),
          path: "/settings/data-setup/model",
          description: t("settingsNavigation.dataSetup.model.description", ns),
        },
        {
          title: t("settingsNavigation.dataSetup.label.title", ns),
          path: "/settings/data-setup/label",
          description: t("settingsNavigation.dataSetup.label.description", ns),
        },
      ],
    },
    {
      triggerTitle: t("settingsNavigation.accountSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.accountSettings.description",
        ns
      ),
      items: [
        {
          title: t("settingsNavigation.accountSettings.company.title", ns),
          path: "/settings/account-settings/company",
          description: t(
            "settingsNavigation.accountSettings.company.description",
            ns
          ),
        },
        {
          title: t("settingsNavigation.accountSettings.departments.title", ns),
          path: "/settings/account-settings/departments",
          description: t(
            "settingsNavigation.accountSettings.departments.description",
            ns
          ),
        },
        {
          title: t("settingsNavigation.accountSettings.jobFields.title", ns),
          path: "/settings/account-settings/job-fields",
          description: t(
            "settingsNavigation.accountSettings.jobFields.description",
            ns
          ),
        },
        {
          title: t("settingsNavigation.accountSettings.shifts.title", ns),
          path: "/settings/account-settings/shifts",
          description: t(
            "settingsNavigation.accountSettings.shifts.description",
            ns
          ),
        },
        {
          title: t("settingsNavigation.accountSettings.users.title", ns),
          path: "/settings/account-settings/users",
          description: t(
            "settingsNavigation.accountSettings.users.description",
            ns
          ),
        },
        {
          title: t("settingsNavigation.accountSettings.workspaces.title", ns),
          path: "/settings/account-settings/workspaces",
          description: t(
            "settingsNavigation.accountSettings.workspaces.description",
            ns
          ),
        },
      ],
    },
    {
      triggerTitle: t("settingsNavigation.accessControl.title", ns),
      triggerDescription: t("settingsNavigation.accessControl.description", ns),
      items: [
        {
          title: t(
            "settingsNavigation.accessControl.userPermissions.title",
            ns
          ),
          path: "/settings/access-control/user-permissions",
          description: t(
            "settingsNavigation.accessControl.userPermissions.description",
            ns
          ),
        },
        {
          title: t(
            "settingsNavigation.accessControl.groupPermissions.title",
            ns
          ),
          path: "/settings/access-control/group-permissions",
          description: t(
            "settingsNavigation.accessControl.groupPermissions.description",
            ns
          ),
        },
      ],
    },
    {
      triggerTitle: t("settingsNavigation.workflowSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.workflowSettings.description",
        ns
      ),
      items: [
        {
          title: t("settingsNavigation.workflowSettings.steps.title", ns),
          path: "/settings/workflow-settings/steps",
          description: t(
            "settingsNavigation.workflowSettings.steps.description",
            ns
          ),
        },
        {
          title: t("settingsNavigation.workflowSettings.validations.title", ns),
          path: "/settings/workflow-settings/validations",
          description: t(
            "settingsNavigation.workflowSettings.validations.description",
            ns
          ),
        },
      ],
    },
    {
      triggerTitle: t("settingsNavigation.itServiceDeskSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.itServiceDeskSettings.description",
        ns
      ),
      items: [
        {
          title: t(
            "settingsNavigation.itServiceDeskSettings.category.title",
            ns
          ),
          path: "/settings/it-service-desk-settings/category",
          description: t(
            "settingsNavigation.itServiceDeskSettings.category.description",
            ns
          ),
        },
        {
          title: t(
            "settingsNavigation.itServiceDeskSettings.approvalSteps.title",
            ns
          ),
          path: "/settings/it-service-desk-settings/approval-steps",
          description: t(
            "settingsNavigation.itServiceDeskSettings.approvalSteps.description",
            ns
          ),
        },
        {
          title: t(
            "settingsNavigation.itServiceDeskSettings.assignmentRules.title",
            ns
          ),
          path: "/settings/it-help-desk-settings/assignment-rules",
          description: t(
            "settingsNavigation.itServiceDeskSettings.assignmentRules.description",
            ns
          ),
        },
      ],
    },
  ];
}
