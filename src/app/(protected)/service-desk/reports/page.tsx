import i18n, { NS } from "@/lib/i18n";

export default function ServiceDeskReportsPage() {
  return (
    <main className="p-6">
      <h1 className="text-lg font-semibold">
        {i18n.t("reports.title", { ns: NS.serviceDesk })}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {i18n.t("reports.description", { ns: NS.serviceDesk })}
      </p>
    </main>
  );
}
