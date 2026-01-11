export function useImpersonationApi() {
  const start = (subjectId: string) =>
    fetch("/api/auth/impersonation", {
      method: "POST",
      body: JSON.stringify({ subjectId }),
    });

  const stop = () => fetch("/api/auth/impersonation", { method: "DELETE" });

  return { start, stop };
}
