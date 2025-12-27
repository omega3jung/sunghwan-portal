import { Eye, LucideProps, Shield, ShieldCheck } from "lucide-react";

export interface ShieldBadgeProps extends LucideProps {
  badgeText: string;
  shieldText?: string;
  viewOnly?: boolean;
  color?: string;
}

const ShieldBadge = ({ ...props }: ShieldBadgeProps) => {
  const {
    absoluteStrokeWidth,
    badgeText,
    color,
    shieldText,
    strokeWidth,
    size,
    viewOnly,
  } = props;

  return (
    <div className="h-full pl-1">
      <div className="flex h-1/3 sm:w-28 flex-row items-center justify-start text-xs">
        {!viewOnly && shieldText && (
          <div className="relative">
            <Shield
              size={size}
              className={`text-${color ?? "primary"} absolute left-0 -top-1.5`}
              absoluteStrokeWidth={absoluteStrokeWidth}
              strokeWidth={strokeWidth}
            />
            <p
              className={`text-${
                color ?? "primary"
              } absolute left-[3.5px] top-[-8px] text-[6px] font-extrabold italic`}
            >
              {shieldText}
            </p>
          </div>
        )}

        {!viewOnly && !shieldText && (
          <div className="relative">
            <ShieldCheck
              size={size}
              className={`text-${color ?? "primary"} absolute left-0 -top-1.5`}
              absoluteStrokeWidth={absoluteStrokeWidth}
              strokeWidth={strokeWidth}
            />
          </div>
        )}

        {viewOnly && (
          <div className="relative">
            <Eye
              size={size}
              className={`text-${color ?? "primary"} absolute left-0 -top-1.5`}
              absoluteStrokeWidth={absoluteStrokeWidth}
              strokeWidth={strokeWidth}
            />
          </div>
        )}

        <p
          className={`hidden sm:block ml-3 font-extrabold italic tracking-[-0.8px] text-${
            color ?? "primary"
          }`}
        >
          {badgeText}
        </p>
      </div>
    </div>
  );
};

export default ShieldBadge;
