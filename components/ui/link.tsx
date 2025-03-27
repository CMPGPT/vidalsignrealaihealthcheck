'use client';

import NextLink from "next/link";
import { forwardRef } from "react";

interface LinkProps extends React.ComponentPropsWithoutRef<typeof NextLink> {
  children: React.ReactNode;
  className?: string;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, className, ...props }, ref) => {
    return (
      <NextLink href={href} className={className} ref={ref} {...props}>
        {children}
      </NextLink>
    );
  }
);

Link.displayName = "Link";

export default Link; 