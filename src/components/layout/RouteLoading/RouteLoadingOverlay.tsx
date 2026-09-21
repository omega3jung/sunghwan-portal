"use client";

import styles from "./RouteLoadingOverlay.module.css";

type RouteLoadingOverlayProps = {
  visible: boolean;
  label: string;
  progress: number;
  completing: boolean;
};

export function RouteLoadingOverlay({
  visible,
  label,
  progress,
  completing,
}: RouteLoadingOverlayProps) {
  return (
    <>
      {/* Keep the live region mounted; progress ticks must not repeat the announcement. */}
      <span role="status" className="sr-only">
        {visible && !completing ? label : ""}
      </span>
      {visible ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] ${completing ? styles.completing : ""}`}
        >
          <div
            className="h-full w-full origin-left bg-primary transition-transform duration-200 ease-out motion-reduce:transition-none"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      ) : null}
    </>
  );
}
