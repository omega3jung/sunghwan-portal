import { TFunction } from "i18next";
import {
  BadgeCheck,
  Bot,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Database,
  Eye,
  Factory,
  FolderKanban,
  Headset,
  ListOrdered,
  Network,
  PanelsTopLeft,
  Ship,
  Tag,
  Tags,
  UserCog,
  UserRound,
  Users,
  UsersRound,
  Workflow,
} from "lucide-react";

import type { LucideIcon } from "@/shared/types";

interface SettingsCardGroup {
  triggerTitle: string;
  triggerDescription: string;
  path: string;
  icon: LucideIcon;
}

interface SettingsNavigationGroup {
  triggerTitle: string;
  triggerDescription: string;
  items: SettingsCardGroup[];
}

const ns = { ns: "settings" };

export function createSettingsCardItems(t: TFunction): SettingsCardGroup[] {
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
        ns,
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
        ns,
      ),
      path: "/settings/workflow-settings/",
      icon: Workflow,
    },
    {
      triggerTitle: t("settingsNavigation.serviceDeskSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.serviceDeskSettings.description",
        ns,
      ),
      path: "/settings/service-desk-settings",
      icon: Headset,
    },
  ];
}

export function createSettingsNavigationGroups(
  t: TFunction,
): SettingsNavigationGroup[] {
  return [
    {
      triggerTitle: t("settingsNavigation.dataSetup.title", ns),
      triggerDescription: t("settingsNavigation.dataSetup.description", ns),
      items: [
        {
          triggerTitle: t("settingsNavigation.dataSetup.carrier.title", ns),
          path: "/settings/data-setup/carrier",
          triggerDescription: t(
            "settingsNavigation.dataSetup.carrier.description",
            ns,
          ),
          icon: Ship,
        },
        {
          triggerTitle: t("settingsNavigation.dataSetup.project.title", ns),
          path: "/settings/data-setup/project",
          triggerDescription: t(
            "settingsNavigation.dataSetup.project.description",
            ns,
          ),
          icon: FolderKanban,
        },
        {
          triggerTitle: t("settingsNavigation.dataSetup.maker.title", ns),
          path: "/settings/data-setup/maker",
          triggerDescription: t(
            "settingsNavigation.dataSetup.maker.description",
            ns,
          ),
          icon: Factory,
        },
        {
          triggerTitle: t("settingsNavigation.dataSetup.model.title", ns),
          path: "/settings/data-setup/model",
          triggerDescription: t(
            "settingsNavigation.dataSetup.model.description",
            ns,
          ),
          icon: Boxes,
        },
        {
          triggerTitle: t("settingsNavigation.dataSetup.label.title", ns),
          path: "/settings/data-setup/label",
          triggerDescription: t(
            "settingsNavigation.dataSetup.label.description",
            ns,
          ),
          icon: Tag,
        },
      ],
    },
    {
      triggerTitle: t("settingsNavigation.accountSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.accountSettings.description",
        ns,
      ),
      items: [
        {
          triggerTitle: t(
            "settingsNavigation.accountSettings.company.title",
            ns,
          ),
          path: "/settings/account-settings/company",
          triggerDescription: t(
            "settingsNavigation.accountSettings.company.description",
            ns,
          ),
          icon: Building2,
        },
        {
          triggerTitle: t(
            "settingsNavigation.accountSettings.departments.title",
            ns,
          ),
          path: "/settings/account-settings/departments",
          triggerDescription: t(
            "settingsNavigation.accountSettings.departments.description",
            ns,
          ),
          icon: Network,
        },
        {
          triggerTitle: t(
            "settingsNavigation.accountSettings.jobFields.title",
            ns,
          ),
          path: "/settings/account-settings/job-fields",
          triggerDescription: t(
            "settingsNavigation.accountSettings.jobFields.description",
            ns,
          ),
          icon: BriefcaseBusiness,
        },
        {
          triggerTitle: t(
            "settingsNavigation.accountSettings.shifts.title",
            ns,
          ),
          path: "/settings/account-settings/shifts",
          triggerDescription: t(
            "settingsNavigation.accountSettings.shifts.description",
            ns,
          ),
          icon: CalendarClock,
        },
        {
          triggerTitle: t("settingsNavigation.accountSettings.users.title", ns),
          path: "/settings/account-settings/users",
          triggerDescription: t(
            "settingsNavigation.accountSettings.users.description",
            ns,
          ),
          icon: Users,
        },
        {
          triggerTitle: t(
            "settingsNavigation.accountSettings.workspaces.title",
            ns,
          ),
          path: "/settings/account-settings/workspaces",
          triggerDescription: t(
            "settingsNavigation.accountSettings.workspaces.description",
            ns,
          ),
          icon: PanelsTopLeft,
        },
      ],
    },
    {
      triggerTitle: t("settingsNavigation.accessControl.title", ns),
      triggerDescription: t("settingsNavigation.accessControl.description", ns),
      items: [
        {
          triggerTitle: t(
            "settingsNavigation.accessControl.userPermissions.title",
            ns,
          ),
          path: "/settings/access-control/user-permissions",
          triggerDescription: t(
            "settingsNavigation.accessControl.userPermissions.description",
            ns,
          ),
          icon: UserCog,
        },
        {
          triggerTitle: t(
            "settingsNavigation.accessControl.groupPermissions.title",
            ns,
          ),
          path: "/settings/access-control/group-permissions",
          triggerDescription: t(
            "settingsNavigation.accessControl.groupPermissions.description",
            ns,
          ),
          icon: UsersRound,
        },
      ],
    },
    {
      triggerTitle: t("settingsNavigation.workflowSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.workflowSettings.description",
        ns,
      ),
      items: [
        {
          triggerTitle: t(
            "settingsNavigation.workflowSettings.steps.title",
            ns,
          ),
          path: "/settings/workflow-settings/steps",
          triggerDescription: t(
            "settingsNavigation.workflowSettings.steps.description",
            ns,
          ),
          icon: ListOrdered,
        },
        {
          triggerTitle: t(
            "settingsNavigation.workflowSettings.validations.title",
            ns,
          ),
          path: "/settings/workflow-settings/validations",
          triggerDescription: t(
            "settingsNavigation.workflowSettings.validations.description",
            ns,
          ),
          icon: BadgeCheck,
        },
      ],
    },
    {
      triggerTitle: t("settingsNavigation.serviceDeskSettings.title", ns),
      triggerDescription: t(
        "settingsNavigation.serviceDeskSettings.description",
        ns,
      ),
      items: [
        {
          triggerTitle: t(
            "settingsNavigation.serviceDeskSettings.category.title",
            ns,
          ),
          path: "/settings/service-desk-settings/category",
          triggerDescription: t(
            "settingsNavigation.serviceDeskSettings.category.description",
            ns,
          ),
          icon: Tags,
        },
        {
          triggerTitle: t(
            "settingsNavigation.serviceDeskSettings.approvalSteps.title",
            ns,
          ),
          path: "/settings/service-desk-settings/approval-step",
          triggerDescription: t(
            "settingsNavigation.serviceDeskSettings.approvalSteps.description",
            ns,
          ),
          icon: Workflow,
        },
        {
          triggerTitle: t(
            "settingsNavigation.serviceDeskSettings.assignmentRules.title",
            ns,
          ),
          path: "/settings/service-desk-settings/assignment-rule",
          triggerDescription: t(
            "settingsNavigation.serviceDeskSettings.assignmentRules.description",
            ns,
          ),
          icon: Bot,
        },
        {
          triggerTitle: t(
            "settingsNavigation.serviceDeskSettings.tenant.title",
            ns,
          ),
          path: "/settings/service-desk-settings/tenant",
          triggerDescription: t(
            "settingsNavigation.serviceDeskSettings.tenant.description",
            ns,
          ),
          icon: Building2,
        },
      ],
    },
  ];
}
