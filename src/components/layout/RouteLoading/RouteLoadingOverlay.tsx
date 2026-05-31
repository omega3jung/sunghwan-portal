"use client";

type RouteLoadingOverlayProps = {
  visible: boolean;
  label: string;
};

export function RouteLoadingOverlay({
  visible,
  label,
}: RouteLoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-background/80 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative grid h-32 w-32 place-items-center">
        <div className="absolute inset-0 animate-spin rounded-full border-8 border-x-primary/20 border-y-primary" />
        <span className="text-sm text-foreground">{label}</span>
      </div>
    </div>
  );
}
