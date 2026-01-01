import { cva } from "class-variance-authority";

// comboBox variants.
export const comboBoxVariants = cva(
  "w-full justify-between rounded-md px-3 py-2 text-sm text-basic font-semibold disabled:cursor-not-allowed disabled:opacity-50 bg-white dark:bg-accent h-auto p-1 flex items-center",
  {
    variants: {
      variant: {
        default: "border-input border border-slate-150",
        ghost:
          "bg-transparent dark:bg-transparent border-none rounded-none hover:bg-transparent hover:text-primary [&>svg]:hover:text-primary",
        readOnly:
          "bg-transparent font-normal opacity-100 disabled:opacity-100 dark:bg-transparent border-none rounded-none hover:bg-transparent hover:text-primary [&>svg]:hover:text-primary",
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
