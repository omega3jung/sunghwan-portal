import { cva } from "class-variance-authority";

export const stepsBackgroundVariant = cva(
  "data-[orientation=vertical]:grid-col data-[orientation=horizontal]:flex data-[orientation=vertical]:grid data-[orientation=vertical]:h-full",
  {
    variants: {
      variant: {
        circle: "",
        square: "bg-background py-3 rounded-md border",
      },
    },
    defaultVariants: {
      variant: "square",
    },
  }
);

export const stepsVariant = cva("text-sm md:text-base !opacity-100 z-10", {
  variants: {
    variant: {
      circle: "rounded-full h-9 w-9",
      square: "rounded-md",
    },
  },
  defaultVariants: {
    variant: "square",
  },
});
