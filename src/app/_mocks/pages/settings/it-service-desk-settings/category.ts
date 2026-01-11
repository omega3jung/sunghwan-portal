import { TFunction } from "i18next";

import { MainCategoryData } from "@/app/(protected)/(admin)/settings/it-service-desk-settings/types";

const ns = { ns: "itServiceDeskSettings" };

export function createCategorySettingsMock(t: TFunction): MainCategoryData[] {
  return [
    {
      category_id: "1",
      category_index: 1,
      category_name: t("settingsNavigation.dataSetup.title", ns),
      category_description: t("settingsNavigation.dataSetup.title", ns),
      category_agent: [],
      category_disabled: true,
      edit_type: undefined,
      sub_category: [
        {
          category_id: "2",
          category_index: 1,
          category_name: t("settingsNavigation.dataSetup.title", ns),
          category_description: t("settingsNavigation.dataSetup.title", ns),
          category_agent: [],
          category_disabled: true,
          edit_type: undefined,
        },
      ],
    },
  ];
}
