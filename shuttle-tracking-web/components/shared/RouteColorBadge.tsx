import type { ReactNode } from "react";

import { routeColorStyle } from "@/utils/colorContrast";

interface RouteColorBadgeProps {
  children: ReactNode;
  className?: string;
  routeColor: unknown;
}

export default function RouteColorBadge({
  children,
  className,
  routeColor,
}: RouteColorBadgeProps) {
  const style = routeColorStyle(routeColor);

  return (
    <span
      className={className}
      data-route-color-badge
      data-route-color={style.backgroundColor}
      style={style}
    >
      {children}
    </span>
  );
}
