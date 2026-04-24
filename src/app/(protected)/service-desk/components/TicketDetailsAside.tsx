"use client";

import { Info, Mail, UserRound, UserRoundKey } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TicketDetail } from "@/domain/serviceDesk";
import { useCurrentSession } from "@/feature/auth/session/hooks/useCurrentSession";
import { RecipientGroup } from "@/feature/serviceDesk/shared";
import { NS } from "@/lib/i18n";
import { ImageValueLabel } from "@/shared/types";
import { cn, initials } from "@/shared/utils";

type TicketDetailsAsideProps = {
  ticket: TicketDetail;
  requester?: ImageValueLabel;
  assignees: ImageValueLabel[];
};

export function TicketDetailsAside({
  ticket,
  requester,
  assignees,
}: TicketDetailsAsideProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);
  const { current } = useCurrentSession();
  const currentEmployeeUserName = current.user?.username ?? null;
  const requesterName =
    requester?.label ||
    t("detailAside.requesterUnknown", { defaultValue: "Unknown requester" });

  return (
    <div className="space-y-4">
      <InfoCard
        icon={<UserRound className="h-4 w-4" />}
        title={tCommon("field.requester")}
      >
        <PersonRow
          name={requesterName}
          subText={requester?.displayName || "-"}
          image={requester?.image}
        />
      </InfoCard>

      <InfoCard
        icon={<UserRoundKey className="h-4 w-4" />}
        title={tCommon("field.assignee")}
      >
        {assignees.length > 0 ? (
          <div className="space-y-3">
            {assignees.map((assignee) => (
              <PersonRow
                key={assignee.value}
                name={assignee.label}
                subText={assignee.displayName}
                image={assignee.image}
                isCurrentUser={
                  ticket.assigned &&
                  !!currentEmployeeUserName &&
                  assignee.value === currentEmployeeUserName
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("detailAside.unassigned")}
          </p>
        )}
      </InfoCard>

      <InfoCard
        icon={<Mail className="h-4 w-4" />}
        title={t("detailAside.recipientsTitle")}
      >
        <RecipientGroup
          label={t("field.emailTo", { ns: NS.common })}
          values={ticket.email.to}
        />
        <RecipientGroup
          label={t("field.emailCc", { ns: NS.common })}
          values={ticket.email.cc}
        />
        <RecipientGroup
          label={t("field.emailBcc", { ns: NS.common })}
          values={ticket.email.bcc}
        />
      </InfoCard>

      <InfoCard
        icon={<Info className="h-4 w-4" />}
        title={t("field.details", { ns: NS.common })}
      >
        <InfoLine label={t("detailAside.ticketId")} value={ticket.id} />
        <InfoLine label={tCommon("field.category")} value={ticket.categoryId} />
        <InfoLine
          label={t("recentActivity.lastCommenter.label")}
          value={ticket.lastCommenterEmail}
        />
      </InfoCard>
    </div>
  );
}

type InfoCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

function InfoCard({ icon, title, children }: InfoCardProps) {
  return (
    <section className="rounded-xl border bg-background">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="space-y-3 px-4 py-4">{children}</div>
    </section>
  );
}

type InfoLineProps = {
  label: string;
  value?: string;
};

function InfoLine({ label, value }: InfoLineProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="break-words text-sm">{value || "-"}</p>
    </div>
  );
}

type PersonRowProps = {
  name: string;
  subText?: string;
  image?: string;
  isCurrentUser?: boolean;
};

function PersonRow({
  name,
  subText,
  isCurrentUser = false,
  image,
}: PersonRowProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-2 py-1.5",
        isCurrentUser && "border border-primary/20 bg-primary/5",
      )}
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={image} />
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{name}</p>
          {isCurrentUser && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
              {t("detailAside.currentUserBadge")}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {subText || "-"}
        </p>
      </div>
    </div>
  );
}
