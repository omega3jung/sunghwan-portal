import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RuleGroupTypeIC } from "react-querybuilder";

import { fetchItServiceDeskCategory } from "@/feature/it-service-desk/category/api";
import { ImageValueLabel, ValueLabel } from "@/types";
import { FilterOperatorsType } from "~/components/cynergy/FilterQueryBuilder";
import { PrimaryTable } from "~/components/cynergy/PrimaryTable/PrimaryTable";
import { InputTableHeaders } from "~/components/cynergy/PrimaryTable/utilities/types";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { Filter } from "~/types/filter";

import { CategoryData } from "../constants/interfaces";
import {
  useDeleteItServiceDeskCategory,
  usePostItServiceDeskCategory,
  usePutItServiceDeskCategory,
} from "../hooks/useCategory";

type CategoryListProps = {
  user: ImageValueLabel[];
};

export const CategoryList = (props: CategoryListProps) => {
  const { user } = props;

  const { toast } = useToast();
  const { t: configText } = useTranslation("configuration");

  const [tableData, setTableData] = useState<Array<CategoryData>>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [rowsSelected, setRowsSelected] = useState<Array<CategoryData>>([]);
  const [params, setParams] = useState<Filter>({
    filter: { rules: [{ rules: [] }] },
    page: 1,
    size: 10,
  });

  const { data: serviceHubCat, isLoading: categoryLoading } =
    fetchItServiceDeskCategory(params);
  const { mutateAsync: createCategory } = usePostItServiceDeskCategory();
  const { mutateAsync: updateCategory } = usePutItServiceDeskCategory();
  const { mutateAsync: deleteCategory } = useDeleteItServiceDeskCategory();
  const { data: serviceHubDept } = useFetchDeptValueLabel();

  const filterCriteria = [
    {
      label: configText("serviceHub.general.department"),
      value: "shc_group",
      type: "text",
    },
    {
      label: configText("serviceHub.general.description"),
      value: "shc_desc",
      type: "text",
    },
    {
      label: configText("serviceHub.general.active"),
      value: "shc_dis",
      type: "select",
      options: [
        { name: 1, label: configText("serviceHub.general.active") },
        { name: 0, label: configText("serviceHub.general.deactive") },
      ],
    },
  ] as FilterOperatorsType[];

  const tableHeader = useMemo<Array<InputTableHeaders>>(() => {
    return [
      {
        label: configText("serviceHub.general.id"),
        value: "shc_id",
        show: false,
      },
      {
        label: configText("serviceHub.general.department"),
        value: "shc_group_id",
        show: true,
        type: "combobox",
        options: serviceHubDept ?? [],
      },
      {
        label: configText("serviceHub.general.description"),
        value: "shc_desc",
        show: true,
      },
      {
        label: configText("serviceHub.general.agent"),
        value: "shc_agent",
        show: true,
        type: "avatarmultiselect",
        options: user ?? [],
      },
      {
        label: configText("serviceHub.general.active"),
        value: "shc_dis",
        show: true,
        type: "switch",
      },
    ];
  }, [configText, serviceHubDept, user]);

  // trigered when finihsed to load user setting.
  useEffect(() => {
    setTableData(
      serviceHubCat?.map(
        (item) => ({ ...item, type: undefined } as CategoryData)
      ) ?? ([] as CategoryData[])
    );
  }, [serviceHubCat]);

  if (categoryLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="h-[480px]">
        <PrimaryTable
          data={tableData}
          isLoading={false}
          headers={tableHeader}
          actions={{
            show: true,
            hideDelete: true,
            onSaveClicked(
              newData: ValueLabel[],
              index: number,
              type: "create" | "edit"
            ) {
              tableData[index].shc_group_id =
                newData.find((e) => e.label === "shc_group_id")?.value ?? "-1";
              tableData[index].shc_desc =
                newData.find((e) => e.label === "shc_desc")?.value ?? "";
              tableData[index].shc_agent = (
                JSON.parse(
                  `[${newData.find((e) => e.label === "shc_agent")?.value}]`
                ) as Array<number>
              ).map((agent) => agent.toString());
              tableData[index].shc_dis =
                newData.find((e) => e.label === "shc_dis")?.value === "checked"
                  ? 1
                  : 0;
              tableData[index].type = type;

              setTableData([...tableData]);
            },
          }}
          ref={{ current: undefined }}
          checkbox={{
            show: true,
            onRowSelection(indexes: number[]) {
              const selected = indexes
                .map((index) => tableData[index])
                .filter((item) => item !== undefined);

              setRowsSelected(selected);
            },
            onAllRowSelection(selected: boolean) {
              setAllSelected(selected);
            },
          }}
          topBar={{
            search: {
              active: true,
              onSubmit(keyword: string) {
                setParams((current: any) => {
                  return {
                    ...current,
                    filter: {
                      rules: [
                        {
                          rules: [
                            {
                              field: "ticket",
                              type: "string",
                              input: "text",
                              operator: "like",
                              valueSource: "value",
                              value: keyword,
                            },
                          ],
                        },
                      ],
                    },
                    page: 1,
                  };
                });
              },
            },
            filter: {
              active: true,
              criteria: filterCriteria,
              onChange(filters: RuleGroupTypeIC) {
                setParams((current: any) => {
                  return {
                    ...current,
                    filter: filters,
                    page: 1,
                  };
                });
              },
            },
            pagination: {
              active: true,
              limit: params.size,
              page: params.page,
              onPagination(direction) {
                if (direction === "back" && !!params.page && params.page > 1) {
                  setParams({
                    ...params,
                    page: params.page - 1,
                  });
                } else if (direction === "next" && !!params.page) {
                  setParams({
                    ...params,
                    page: params.page + 1,
                  });
                }
              },
            },
            dynamicElements: [
              {
                active: true,
                content: (
                  <Button
                    key={"create"}
                    size={"icon"}
                    className="p-1"
                    onClick={() => {
                      const data = [...tableData];

                      data.unshift({
                        shc_id: -1,
                        shc_group_id: "-1",
                        shc_group: "",
                        shc_desc: "",
                        shc_agent: [],
                        shc_dis: 1,
                        type: "create",
                      });

                      setTableData(data);
                    }}
                  >
                    <Plus />
                  </Button>
                ),
              },
              {
                active: true,
                content: (
                  <Button
                    disabled={rowsSelected.length === 0 && !allSelected}
                    key={"delete"}
                    variant={"destructive"}
                    size={"icon"}
                    className="p-1"
                    onClick={() => {
                      if (allSelected) {
                        setTableData([]);
                        setRowsSelected([]);
                        setAllSelected(false);
                      } else {
                        setTableData((current) => {
                          const newData = [...current];

                          rowsSelected.forEach((selected) => {
                            const index = newData.findIndex(
                              (item) => item === selected
                            );

                            if (index !== -1) {
                              newData.splice(index, 1);
                            }
                          });

                          setRowsSelected([]);

                          return newData;
                        });
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                ),
              },
            ],
          }}
        />
      </div>
      <div className="flex w-full flex-row items-center justify-center gap-2 p-4">
        <Button
          key={"save"}
          className="flex h-[30px] w-[284px] flex-row items-center justify-center gap-[10px] px-2 py-1"
          onClick={() => {
            const invalidData = tableData.filter(
              (item) => !item.shc_group_id || !item.shc_desc
            );

            if (!!invalidData.length) {
              toast({
                variant: "warning",
                title: configText(
                  "serviceHub.department.saveInvaildToastTitle"
                ),
                description: configText(
                  "serviceHub.department.saveInvaildToastMessage"
                ),
              });

              return;
            }

            const beforeKeys = serviceHubCat?.map((item) => item.shc_id) ?? [];
            const afterKeys = tableData.map((item) => item.shc_id);

            updateCategory({
              newItems: tableData.filter((item) => item.type === "create"),
              edittedItems: tableData.filter((item) => item.type === "edit"),
              removedItems:
                serviceHubCat?.filter(
                  (item) =>
                    beforeKeys.includes(item.shc_id) &&
                    !afterKeys.includes(item.shc_id)
                ) ?? [],
            });
          }}
        >
          <Save size={"16"} />
          {configText("serviceHub.general.saveBtn")}
        </Button>
      </div>
    </>
  );
};
