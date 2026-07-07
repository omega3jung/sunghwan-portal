import type { LucideProps } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export type LinkBarItem = {
  text: ReactNode;
  value?: string;
  route: string;
  selected?: boolean;
  icon?: ReactElement<LucideProps>;
  isDisable?: boolean;
  isLinkable?: boolean;
  onClick?: (index: number, name?: string | ReactNode) => void;
};

export type NavigationBreadcrumbItem = {
  label: ReactNode;
  href?: string;
  icon?: ReactElement<LucideProps>;
  dropdownItems?: NavigationBreadcrumbDropdownItem[];
};

export type NavigationBreadcrumbDropdownItem = {
  id: number;
  label: ReactNode;
  href: string;
  disabled?: boolean;
};

export type NavigationBarProps = {
  className?: string;
  title?: ReactNode;
  breadcrumbs?: NavigationBreadcrumbItem[];
  actions?: ReactNode;
  tabs?: LinkBarItem[];

  /**
   * @deprecated Role state is displayed by UserMenu and is not rendered here.
   */
  userRoleBadge?: string;
};
