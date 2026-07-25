type AuthFormHeaderProps = {
  title: string;
  message: string;
  variant?: "login" | "workflow";
};

export function AuthFormHeader({
  title,
  message,
  variant = "workflow",
}: AuthFormHeaderProps) {
  return (
    <header className="pb-6 text-center">
      <h1
        className={
          variant === "login"
            ? "text-2xl font-medium leading-10 tracking-tight md:text-4xl"
            : "text-4xl font-medium leading-10 tracking-tight"
        }
      >
        {title}
      </h1>
      <p
        className={
          variant === "login"
            ? "leading-5 text-foreground/80 md:text-lg"
            : "mt-1 text-lg leading-5 text-foreground/80"
        }
      >
        {message}
      </p>
    </header>
  );
}
