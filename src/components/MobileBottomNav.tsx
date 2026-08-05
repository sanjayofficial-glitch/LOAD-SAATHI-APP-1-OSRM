import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, BookOpen, Tag, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MobileBottomNavProps {
  items: BottomNavItem[];
  visible?: boolean;
  extra?: React.ReactNode;
}

export const publicBottomNavItems: BottomNavItem[] = [
  { label: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
  { label: "Features", path: "/features", icon: <Sparkles className="h-5 w-5" /> },
  { label: "How It Works", path: "/how-it-works", icon: <BookOpen className="h-5 w-5" /> },
  { label: "Pricing", path: "/pricing", icon: <Tag className="h-5 w-5" /> },
  { label: "Contact", path: "/contact", icon: <Phone className="h-5 w-5" /> },
];

const MobileBottomNav = React.memo(({ items, visible, extra }: MobileBottomNavProps) => {
  const location = useLocation();
  if (visible) return null;

  const isActive = (path: string) => {
    if (path === "/trucker/dashboard" || path === "/shipper/dashboard") {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 dark:bg-[#050816]/95 backdrop-blur-xl border-t border-border dark:border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around max-w-[1440px] mx-auto">
        {items.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-all min-w-0 flex-1",
                active
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              <div className={cn("transition-transform", active && "scale-110")}>{item.icon}</div>
              <span className="text-[10px] font-medium mt-0.5 truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
        {extra}
      </div>
    </nav>
  );
});
MobileBottomNav.displayName = "MobileBottomNav";

export default MobileBottomNav;
