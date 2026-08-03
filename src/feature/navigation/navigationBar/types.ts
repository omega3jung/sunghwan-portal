import type { LucideProps } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import type { UserMenuDemoCandidates } from "@/components/menu/UserMenu";

/** Models one link or label rendered in the navigation bar. */
export type LinkBarItem = {
  text: ReactNode;
  value?: string;
  route: string;
  selected?: boolean;
  icon?: ReactElement<LucideProps>;
  disabled?: boolean;
  canNavigate?: boolean;
  onClick?: (index: number, name?: string | ReactNode) => void;
};

/** Models one breadcrumb with optional navigation metadata. */
export type NavigationBreadcrumbItem = {
  label: ReactNode;
  href?: string;
  icon?: ReactElement<LucideProps>;
  dropdownItems?: NavigationBreadcrumbDropdownItem[];
};

/** Models an alternative sibling route displayed in a breadcrumb dropdown. */
export type NavigationBreadcrumbDropdownItem = {
  id: number;
  label: ReactNode;
  href: string;
  disabled?: boolean;
};

/** Configures navigation-bar breadcrumbs and the optional current-page override. */
export type NavigationBarProps = {
  className?: string;
  title?: ReactNode;
  breadcrumbs?: NavigationBreadcrumbItem[];
  actions?: ReactNode;
  tabs?: LinkBarItem[];
  userMenuDemoCandidates?: UserMenuDemoCandidates;

  /**
   * @deprecated Role state is displayed by UserMenu and is not rendered here.
   */
  userRoleBadge?: string;
};
