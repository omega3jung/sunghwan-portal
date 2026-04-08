import type { ReactNode } from "react";

import { cn } from "@/shared/utils/classnames";
import { withBasePath } from "@/shared/utils/path";

type PublicLayoutProps = {
  children: ReactNode;
};

const backgroundImageUrl = withBasePath("/images/background.jpg");
const logoImageUrl = withBasePath("/images/logo_light.png");

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full flex-col gap-12 bg-bottom bg-cover bg-no-repeat p-4",
        "md:flex-row-reverse lg:gap-32 lg:px-32",
      )}
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="flex grow items-center justify-center">
        <div className="flex w-full max-w-2xl justify-center">
          <img src={logoImageUrl} alt="logo" />
        </div>
      </div>
      <main className="flex flex-col items-center justify-center text-primary">
        {children}
      </main>
    </div>
  );
}
