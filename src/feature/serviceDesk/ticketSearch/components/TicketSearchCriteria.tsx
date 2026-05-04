import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MainCategory } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import { ImageValueLabel } from "@/shared/types";

import type { TicketSearchCriteriaFormValues } from "../forms";
import { TicketSearchCriteriaFields } from "./TicketSearchCriteriaFields";

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
            variant="outline"
            className="gap-2 border-border/70 shadow-sm hover:bg-muted/40"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Filter />
            {t("action.searchCriteria")}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent size="md" className="border-l p-0 shadow-2xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col"
        >
          <SheetHeader>
            <div className="flex h-12 items-center justify-between border-b border-border/70 bg-muted/30 px-3">
              <SheetTitle className="text-base text-foreground">
                {t("message.refineSearchCriteria")}
              </SheetTitle>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6 pb-8">
            <FieldGroup>
              <TicketSearchCriteriaFields
                form={form}
                categories={categories}
                users={users}
              />
            </FieldGroup>
          </ScrollArea>

          <SheetFooter className="border-t border-border/60 p-4">
            <Button
              size="sm"
              className="h-10 w-full rounded-md px-4 text-sm font-semibold"
              type="submit"
              data-testid="ticket-search-submit"
            >
              <Search />
              {t("action.search", { ns: NS.common })}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
