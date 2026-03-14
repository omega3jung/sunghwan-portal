/* eslint-disable react/forbid-component-props */
import { ChevronLeft, ChevronsRight, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Period } from "@/components/custom/DatePicker";
import {
  AvatarMultiCombobox,
  Item,
} from "@/components/cynergy/AvatarMultiCombobox";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimpleSelect } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Category } from "@/domain/serviceDesk";
import { cn } from "@/lib/utils";
import { serviceHubOptions } from "@/modules/service-hub/constants/options";
import { ListSearchArgType } from "@/modules/service-hub/forms/useTicketListForm";
import { ValueLabel } from "@/shared/types";

import { TicketFilterFormType } from "../../types/schema";

type FilterProps = {
  type?: "all" | "icon" | "string";
  form: UseFormReturn<ListSearchArgType>;
  categories: Category[];
  users: Item[];
  onSubmit: (values: TicketFilterFormType) => Promise<void>;
};

export const TicketSearchCriteria = (props: FilterProps) => {
  const { type = "icon", form, categories, users, onSubmit } = props;
  const { t: serviceHubText } = useTranslation("serviceHub");

  const [open, setOpen] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Array<number>>();
  const [selectedAgent, setSelectedAgent] = useState<Array<string>>([]);
  const [selectedRequester, setSelectedRequester] = useState<Array<string>>([]);
  const [period, setPeriod] = useState<Period>();
  const [range, setRange] = useState<DateRange | undefined>({
    from: form.getValues("start_date"),
    to: form.getValues("end_date"),
  });

  const categoryData = useMemo<Array<Item>>(() => {
    if (categories) return;

    const selected = categories?.filter((department) =>
      selectedDepartment?.includes(department.shc_id),
    );

    let categories = [] as IssueCategory[];

    selected?.forEach((department) => {
      categories = categories.concat(...department.category);
    });

    return (
      (categories.map(
        (category) =>
          ({
            value: category.shc_id.toString(),
            label: category.shc_desc,
          }) as ValueLabel,
      ) as ValueLabel[]) ?? ([] as ValueLabel[])
    );

    return [] as ValueLabel[];
  }, [categories]);

  // trigered when finihsed to load user setting.
  useEffect(() => {
    setSelectedDepartment(form.getValues("department"));
    setSelectedAgent(form.getValues("agent"));

    if (!!range?.from && !!range?.to) {
      form.setValue("start_date", range.from);
      form.setValue("end_date", range.to);
    }
  }, [departments, form, range]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          type="button"
          size={type === "icon" ? "icon" : "default"}
          className={cn(
            "gap-2 border border-muted-secondary text-basic",
            type === "icon" ? "p-1" : "",
          )}
          onClick={() => {
            setOpen(true);
          }}
        >
          <Filter fill="#008844" color="#008844" />
          {type !== "icon" && serviceHubText("general.filter")}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full min-w-80 border-none p-0 sm:max-w-full md:max-w-md">
        <SheetHeader>
          <div className="flex h-10 items-center justify-between bg-primary px-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="p-0 text-foreground"
              onClick={() => {
                setOpen(false);
              }}
            >
              <ChevronsRight className="hidden md:block" />
              <ChevronLeft className="md:hidden" />
            </Button>
            <SheetTitle className="text-base text-foreground">
              {serviceHubText("general.filter")}
            </SheetTitle>
            <div className="inline h-full w-6" />
          </div>
        </SheetHeader>

        <ScrollArea className="h-full p-6">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-2"
          >
            <FieldGroup>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="ticket-filter-select-category">
                      {serviceHubText("general.category")}
                    </FieldLabel>

                    <MultiCombobox
                      id="ticket-filter-select-category"
                      buttonVariant={"rainbow"}
                      rainbowPick={9}
                      options={categoryData}
                      onSelect={(selected) => {
                        const choise = parseInt(selected);

                        field.onChange([...field.value, choise]);
                      }}
                      onRemove={(selected) => {
                        const choise = parseInt(selected);

                        field.onChange(
                          field.value?.filter((value) => value !== choise),
                        );
                      }}
                      {...form.register("category")}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ticket-filter-select-status">
                      {serviceHubText("general.status")}
                    </FieldLabel>
                    <MultiCombobox
                      id="ticket-filter-select-status"
                      buttonVariant={"rainbow"}
                      rainbowStart={4}
                      options={serviceHubOptions.status.filter(
                        (item) =>
                          !["Approved", "Declined"].includes(item.value),
                      )}
                      value={field.value}
                      onSelect={(selected) => {
                        field.onChange([...field.value, selected]);
                      }}
                      onRemove={(selected) => {
                        field.onChange(
                          field.value?.filter((value) => value !== selected),
                        );
                      }}
                      {...form.register("status")}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="login-input-password">
                      {serviceHubText("general.priority")}
                    </FieldLabel>
                    <MultiCombobox
                      buttonVariant={"rainbow"}
                      rainbowStart={9}
                      options={serviceHubOptions.priority}
                      value={field.value}
                      onSelect={(selected) => {
                        field.onChange([...field.value, selected]);
                      }}
                      onRemove={(selected) => {
                        field.onChange(
                          field.value?.filter((value) => value !== selected),
                        );
                      }}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="login-input-password">
                      {serviceHubText("general.assignee")}
                    </FieldLabel>
                    <AvatarMultiCombobox
                      value={selectedAgent}
                      options={users}
                      onSelect={(value) => {
                        setSelectedAgent((current) => {
                          return [...current, value];
                        });
                        form.setValue("agent", [...selectedAgent, value]);
                      }}
                      onRemove={(selected) => {
                        const newValue = selectedAgent.filter(
                          (value) => value !== selected,
                        );

                        setSelectedAgent(newValue);
                        form.setValue("agent", newValue);
                      }}
                      maxImages={3}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="login-input-password">
                      {serviceHubText("general.requester")}
                    </FieldLabel>
                    <AvatarMultiCombobox
                      value={selectedRequester}
                      options={users}
                      onSelect={(value) => {
                        setSelectedRequester((current) => {
                          return [...current, value];
                        });
                        form.setValue("requester", [
                          ...selectedRequester,
                          value,
                        ]);
                      }}
                      onRemove={(selected) => {
                        const newValue = selectedRequester.filter(
                          (value) => value !== selected,
                        );

                        setSelectedRequester(newValue);
                        form.setValue("requester", newValue);
                      }}
                      maxImages={3}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="login-input-password">
                      {serviceHubText("general.period")}
                    </FieldLabel>
                    <DateRangePicker
                      period={period}
                      setPeriod={setPeriod}
                      range={range}
                      setRange={setRange}
                      showRange={true}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="login-input-password">
                      {serviceHubText("general.dueBy")}
                    </FieldLabel>
                    <SimpleSelect
                      placeholder={serviceHubText(
                        "dashboard.comboBoxPlaceHolder",
                      )}
                      value={field.value}
                      onValueChasnge={field.onChange}
                      options={serviceHubOptions.dueDate}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
              <Field>
                <Button
                  className="mt-6 h-12 rounded-lg text-base font-normal w-full"
                  type="submit"
                  disabled={isLoading}
                  data-testid="login-submit"
                >
                  {isLoading ? (
                    <>
                      {t("loading.loggingIn")}
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    </>
                  ) : (
                    t("login.logIn")
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
