"use client";

import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

export default function ClientNavigationMenuLink(props: {
  label: string;
  href: string;
  className?: string;
}) {
  const { href, label } = props;
  const isActive = href === usePathname();

  return (
    <NavigationMenuLink
      href={href}
      active={isActive}
      className={cn(
        props.className,
        isActive && "before:scale-x-100 text-primary",
      )}
    >
      {label}
    </NavigationMenuLink>
  );
}
