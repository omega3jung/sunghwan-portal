import { cva } from "class-variance-authority";

export const stepperContainer = cva("w-full", {
  variants: {
    orientation: {
      horizontal: "flex items-center",
      vertical: "flex flex-col",
    },
  },
});

export const triggerVariant = cva(
  "z-10 flex items-center justify-center text-sm font-medium transition",
  {
    variants: {
      variant: {
        circle: "relative h-9 w-9 rounded-full font-bold",
        square: "rounded-md px-3 py-2 gap-2",
      },
      state: {
        active: "border border-primary bg-background text-primary",
        completed: "bg-primary",
        future: "border bg-background text-muted-foreground",
      },
      color: {
        primary: "",
        secondary: "",
      },
    },
    compoundVariants: [
      // 🔥 ACTIVE
      {
        state: "active",
        color: "primary",
        className: "border-primary text-primary",
      },
      {
        state: "active",
        color: "secondary",
        className: "border-secondary text-foreground",
      },

      // 🔥 COMPLETED - background
      {
        state: "completed",
        color: "primary",
        className: "bg-primary",
      },
      {
        state: "completed",
        color: "secondary",
        className: "bg-secondary",
      },

      // 🔥 COMPLETED - text (circle)
      {
        variant: "circle",
        state: "completed",
        color: "primary",
        className: "text-primary",
      },
      {
        variant: "circle",
        state: "completed",
        color: "secondary",
        className: "text-secondary",
      },

      // 🔥 COMPLETED - text (square)
      {
        variant: "square",
        state: "completed",
        color: "primary",
        className: "text-white",
      },
      {
        variant: "square",
        state: "completed",
        color: "secondary",
        className: "text-foreground",
      },
    ],
  },
);

export const connectorVariant = cva("transition-colors", {
  variants: {
    orientation: {
      vertical: "w-px h-8",
      horizontal: "flex-1 h-px mx-2",
    },
    isCompleted: {
      true: "",
      false: "bg-border",
    },
    color: {
      primary: "",
      secondary: "",
    },
  },
  compoundVariants: [
    {
      isCompleted: true,
      color: "primary",
      className: "bg-primary",
    },
    {
      isCompleted: true,
      color: "secondary",
      className: "bg-secondary",
    },
  ],
});
