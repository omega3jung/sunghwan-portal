import { ChevronLeft, ChevronsRight, Filter, Search } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MainCategory } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import { ImageValueLabel } from "@/shared/types";

import { TicketSearchCriteriaFormValues } from "../forms/searchCriteria";
import { TicketSearchCriteriaFields } from "./TicketSearchCriteria/TicketSearchCriteriaFields";

type FilterProps = {
  trigger?: React.ReactNode;
  form: UseFormReturn<TicketSearchCriteriaFormValues>;
  categories: MainCategory[];
  users: ImageValueLabel[];
  onSubmit: (values: TicketSearchCriteriaFormValues) => Promise<void>;
};

export const TicketSearchCriteria = (props: FilterProps) => {
  const { form, categories, users, onSubmit } = props;

  const { t } = useTranslation(NS.serviceDesk);

  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {props.trigger ?? (
          <Button
            type="button"
            className="gap-2"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Filter />
            {t("action.searchCriteria")}
          </Button>
        )}
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
              {t("general.filter")}
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
              <TicketSearchCriteriaFields
                form={form}
                categories={categories}
                users={users}
              />
              <Field>
                <Button
                  className="mt-6 h-12 rounded-lg text-base font-normal w-full"
                  type="submit"
                  data-testid="login-submit"
                >
                  <Search />
                  {t("action.search", { ns: NS.common })}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
