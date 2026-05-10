"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/utils/presentation";

const dialogOverlayStyleClasses = {
  dark: "bg-black/60",
  light: "bg-white/60",
  system: "bg-background/60",
  none: "bg-transparent",
  darkBlur: "bg-black/40 backdrop-blur-[2px]",
  lightBlur: "bg-white/40 backdrop-blur-[2px]",
} as const;

type DialogOverlayStyle = keyof typeof dialogOverlayStyleClasses;

const dialogOverlayVariants = cva(
  "fixed inset-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      overlayStyle: dialogOverlayStyleClasses,
    },
    defaultVariants: {
      overlayStyle: "dark",
    },
  },
);

const DialogContext = React.createContext<{ modal: boolean }>({
  modal: true,
});

const Dialog = ({
  children,
  modal = true,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) => (
  <DialogContext.Provider value={{ modal }}>
    <DialogPrimitive.Root modal={modal} {...props}>
      {children}
    </DialogPrimitive.Root>
  </DialogContext.Provider>
);

const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    overlayStyle?: DialogOverlayStyle;
  }
>(({ className, overlayStyle, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(dialogOverlayVariants({ overlayStyle }), "z-50", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Non-modal dialogs may still show a visual overlay,
// but it must never block background interaction.
const DialogVisualOverlay = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    overlayStyle?: DialogOverlayStyle;
  }
>(({ className, overlayStyle }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    data-state="open"
    className={cn(
      dialogOverlayVariants({ overlayStyle }),
      "pointer-events-none z-40",
      className,
    )}
  />
));
DialogVisualOverlay.displayName = "DialogVisualOverlay";

type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  overlayStyle?: DialogOverlayStyle;
  showCloseButton?: boolean;
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    { className, children, overlayStyle, showCloseButton = true, ...props },
    ref,
  ) => {
    const { modal } = React.useContext(DialogContext);
    const resolvedOverlayStyle = overlayStyle ?? (modal ? "dark" : "none");
    const showVisualOverlay = !modal && resolvedOverlayStyle !== "none";

    return (
      <DialogPortal>
        {modal ? <DialogOverlay overlayStyle={resolvedOverlayStyle} /> : null}

        {showVisualOverlay ? (
          <DialogVisualOverlay overlayStyle={resolvedOverlayStyle} />
        ) : null}

        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  dialogOverlayVariants,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
