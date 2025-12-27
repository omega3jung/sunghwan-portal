import { LucideProps } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Fragment, ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

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

type Props = {
  items: LinkBarItem[];
  isLinkable?: boolean;
  onClick?: (index: number, name?: string | ReactNode, value?: string) => void;
};

export const LinksBar = (props: Props) => {
  const { items, isLinkable = true, onClick = () => {} } = props;
  const path = usePathname();
  const firstSelectedItem = items.find((item) => item.selected);

  const renderLink = (link: LinkBarItem, index: number) => (
    <Link
      key={`${link.text}-${index}`}
      href={link.route}
      className={cn(
        `flex h-full max-w-72 grow items-center justify-center px-11 text-[14px] hover:text-primary ${
          !link.selected ? "dark:text-label-secondary" : ""
        }`,
        path === link.route ? "font-bold text-primary" : "",
        link === firstSelectedItem
          ? "rounded-md border-b-[3px] border-b-primary bg-foreground font-bold text-primary"
          : ""
      )}
    >
      <div className="mt-0.5">{link.text}</div>
    </Link>
  );

  const renderButton = (link: LinkBarItem, index: number) => (
    <button
      key={`${link.text}-${index}`}
      onClick={() => {
        if (!link.isDisable) {
          onClick(index, link.text, link.value);
        }
      }}
      className={cn(
        `flex h-full max-w-72 grow items-center justify-center px-11 text-[14px] hover:text-primary ${
          !link.selected ? "dark:text-label-secondary" : ""
        }`,
        link.selected
          ? "border-b-2 border-b-primary font-bold text-primary"
          : "",
        link.isDisable
          ? "cursor-not-allowed text-muted-foreground hover:text-muted-foreground"
          : "cursor-pointer",
        link === firstSelectedItem
          ? "rounded-md border-b-[3px] border-b-primary bg-foreground font-bold text-primary"
          : ""
      )}
      data-active={link === firstSelectedItem}
      style={{
        padding: 0,
        margin: 0,
        cursor: link.isDisable ? "not-allowed" : "pointer",
      }}
    >
      {link?.icon &&
        React.isValidElement<LucideProps>(link?.icon) &&
        React.cloneElement(link?.icon, {
          className: cn(
            "mr-2 w-[14px] h-[14px] mr-1",
            !link.selected ? "text-primary" : "text-muted-foreground"
          ),
        })}
      <div className="mt-0.5">{link.text}</div>
    </button>
  );

  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg">
      {items.map((link, index) => (
        <Fragment key={`${link.text}-${index}`}>
          {!isLinkable || link.isLinkable === false
            ? renderButton(link, index)
            : renderLink(link, index)}
        </Fragment>
      ))}
    </div>
  );
};
