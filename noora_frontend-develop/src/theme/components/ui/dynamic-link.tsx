"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";

import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

interface DynamicLinkProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Link>,
    "href" | "prefetch"
  > {
  href: string;
}

const DynamicLink = forwardRef<React.ElementRef<typeof Link>, DynamicLinkProps>(
  ({ children, href, ...props }, ref) => {
    const pathname = usePathname();

    const absoluteUrl = href.startsWith("/")
      ? href
      : `${pathname.substring(0, pathname.lastIndexOf("/"))}/${href}`;

    return (
      <Link
        ref={ref}
        href={getDynamicUrl(absoluteUrl)}
        prefetch={false}
        {...props}
      >
        {children}
      </Link>
    );
  },
);
DynamicLink.displayName = "DynamicLink";

export { DynamicLink };
