import { cva } from "class-variance-authority";

export const comboBoxVariants = cva(
  "w-full justify-between rounded-md text-sm text-basic font-semibold disabled:cursor-not-allowed disabled:opacity-50 bg-white dark:bg-accent h-auto p-1 flex items-center",
  {
    variants: {
      variant: {
        default: "border-input border border-slate-150",
        ghost:
          "bg-transparent dark:bg-transparent border-none rounded-none hover:bg-transparent hover:text-primary [&>svg]:hover:text-primary",
        grayscale: "bg-muted-primary text-muted-foreground",
      },
      size: {
        default: "min-h-8",
        sm: "min-h-6 px-2",
        lg: "min-h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
