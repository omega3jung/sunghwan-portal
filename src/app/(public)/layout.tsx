import type { ReactNode } from "react";

import { PublicProviders } from "./_providers";

type Props = {
  children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return <PublicProviders>{children}</PublicProviders>;
}
