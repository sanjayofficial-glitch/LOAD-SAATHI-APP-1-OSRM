import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, BookOpen, Tag, Phone } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { cn } from "@/lib/utils";

export interface BottomNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface DockNavProps {
  items: BottomNavItem[];
  visible?: boolean;
  extra?: React.ReactNode;
  className?: string;
}

export const publicBottomNavItems: BottomNavItem[] = [
  { label: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
  { label: "Features", path: "/features", icon: <Sparkles className="h-5 w-5" /> },
  { label: "How It Works", path: "/how-it-works", icon: <BookOpen className="h-5 w-5" /> },
  { label: "Pricing", path: "/pricing", icon: <Tag className="h-5 w-5" /> },
  { label: "Contact", path: "/contact", icon: <Phone className="h-5 w-5" /> },
];

const DockNav = React.memo(({ items, visible, extra, className }: DockNavProps) => {
  const location = useLocation();
  if (visible) return null;

  const isActive = (path: string) => {
    if (path === "/trucker/dashboard" || path === "/shipper/dashboard") {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div
      className={cn(
        "fixed bottom-3 left-0 right-0 z-50 flex justify-center px-2 pointer-events-none safe-area-bottom",
        className
      )}
    >
      <Dock className="pointer-events-auto gap-2.5 rounded-[1.75rem] border border-gray-200/60 bg-white/70 px-3.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/60">
        {items.map((item) => {
          const active = isActive(item.path);
          const icon = React.isValidElement<{ className?: string }>(item.icon)
            ? React.cloneElement(item.icon, { className: "h-6 w-6" })
            : item.icon;
          return (
            <Link key={item.path} to={item.path} aria-label={item.label} className="outline-none">
              <DockItem className={cn(active && "text-orange-600 dark:text-orange-400")}>
                <DockIcon>
                  <span
                    className={cn(
                      "flex h-full w-full items-center justify-center rounded-2xl transition-colors",
                      active
                        ? "bg-orange-500/15 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400"
                        : "bg-transparent text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
                    )}
                  >
                    {icon}
                  </span>
                </DockIcon>
                <DockLabel>{item.label}</DockLabel>
              </DockItem>
            </Link>
          );
        })}
        {extra}
      </Dock>
    </div>
  );
});
DockNav.displayName = "DockNav";

export default DockNav;
