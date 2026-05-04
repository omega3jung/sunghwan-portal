"use client";

import { RefreshCcwDot } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useResetServiceDeskDemo } from "@/feature/serviceDesk/shared/api/demoReset";
import { NS } from "@/lib/i18n";

export function ResetDemoMenu() {
  const { t } = useTranslation(NS.demo);
  const [open, setOpen] = useState(false);

  const { mutate: resetServiceDeskDemo, isPending } = useResetServiceDeskDemo();

  const handleResetDemo = () => {
    resetServiceDeskDemo(undefined, {
      onSuccess: () => {
        toast.success(t("common.reset.successfully", { ns: NS.message }));
        setOpen(false);
      },
      onError: () => {
        toast.error(t("resetDemo.error"));
      },
    });
  };

  const closeResetMenu = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="mx-5 bg-orange-400/80 hover:bg-orange-400">
          <RefreshCcwDot />
          {t("resetDemo.title")}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="center" className="w-60 p-4 flex flex-col gap-4">
        <p className="font-medium">{t("resetDemo.message")}</p>
        <p className="text-sm text-foreground/80">
          {t("resetDemo.description")}
        </p>
        <div className="grid grid-cols-3 gap-4">
          <Button
            className="border-muted-foreground"
            variant={"outline"}
            onClick={closeResetMenu}
          >
            {t("action.close", { ns: NS.common })}
          </Button>
          <Button
            className="col-span-2 bg-orange-400/80 hover:bg-orange-400"
            disabled={isPending}
            onClick={handleResetDemo}
          >
            {isPending ? t("resetDemo.resetting") : t("resetDemo.title")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
