import { cva } from "class-variance-authority";

export const comboBoxVariants = cva(
  "h-10 w-full justify-between rounded-md px-3 py-2 text-sm text-basic font-semibold disabled:cursor-not-allowed disabled:opacity-50 bg-white dark:bg-accent focus:border-primary",
  {
    variants: {
      variant: {
        default: "border-input border border-slate-150",
        ghost:
          "bg-transparent dark:bg-transparent border-none rounded-none hover:bg-transparent hover:text-primary [&>svg]:hover:text-primary",
        icon: "border-input border border-slate-150",
        readOnly:
          "bg-transparent font-normal opacity-100 disabled:opacity-100 dark:bg-transparent border-none rounded-none hover:bg-transparent hover:text-primary [&>svg]:hover:text-primary",
        underline:
          "rounded-none border-x-0 border-b border-slate-150 dark:bg-transparent dark:border-white border-t-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
