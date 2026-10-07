import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { isCurrentPage, isInternal } from "../data/navigation";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

/* Router link for site paths ("/about", "/#chain"), plain anchor for
   mailto:, tel: and external URLs. Marks the current page. */
export default function SmartLink({ href, children, ...rest }: Props) {
  const { pathname } = useLocation();
  if (!isInternal(href)) {
    const external = /^https?:/.test(href);
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} aria-current={isCurrentPage(href, pathname) ? "page" : undefined} {...rest}>
      {children}
    </Link>
  );
}
