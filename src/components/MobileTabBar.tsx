import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface MobileTabItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MobileTabBarProps {
  /** Quick-access tabs rendered directly in the bar (max 4, or 3 with a centerAction). */
  tabs: MobileTabItem[];
  /** Every item shown in the "More" sheet (usually the full navigation). */
  menuItems: MobileTabItem[];
  /** Optional prominent center action button (e.g. "Post Trip"). */
  centerAction?: MobileTabItem;
  /** When true, the whole bar is hidden (e.g. another menu is open). */
  visible?: boolean;
  /** Optional footer content rendered at the bottom of the More sheet. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Mobile-only bottom navigation. Replaces the animated desktop dock on phones:
 * no horizontal scrolling, no framer-motion springs, just plain flex tabs plus
 * a three-line "Menu" button that opens a bottom sheet with the full navigation.
 */
const MobileTabBar = React.memo(
  ({ tabs, menuItems, centerAction, visible, footer, className }: MobileTabBarProps) => {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    if (visible) return null;

    const isActive = (path: string) =>
      location.pathname === path || location.pathname.startsWith(path + "/");

    const tabActive = tabs.some((t) => isActive(t.path));
    const centerActive = !!centerAction && isActive(centerAction.path);
    // If the current page isn't a visible tab, highlight the Menu button instead.
    const menuActive = !tabActive && !centerActive;

    const tabClass = (active: boolean) =>
      cn(
        "flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors duration-150",
        active
          ? "text-orange-600 dark:text-orange-400"
          : "text-gray-500 dark:text-gray-400 active:text-orange-600"
      );

    const pillClass = (active: boolean) =>
      cn(
        "flex items-center justify-center rounded-full px-3 py-1 transition-colors duration-150",
        active && "bg-orange-500/15 dark:bg-orange-400/15"
      );

    return (
      <>
        <div className={cn("fixed inset-x-0 bottom-0 z-[100] md:hidden", className)}>
          <nav
            aria-label="Mobile navigation"
            className={cn(
              "flex items-stretch justify-around border-t border-gray-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/85 safe-area-bottom",
              centerAction && "pt-1"
            )}
          >
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                aria-label={tab.label}
                className={tabClass(isActive(tab.path))}
              >
                <span className={pillClass(isActive(tab.path))}>{tab.icon}</span>
                <span className="max-w-full truncate px-1">{tab.label}</span>
              </Link>
            ))}

            {centerAction && (
              <Link
                to={centerAction.path}
                aria-label={centerAction.label}
                className="relative z-10 -top-4 flex shrink-0 flex-col items-center gap-0.5"
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 ring-4 ring-white transition-transform duration-150 active:scale-95 dark:ring-gray-950",
                    centerActive && "ring-orange-200 dark:ring-orange-900"
                  )}
                >
                  {centerAction.icon}
                </span>
                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                  {centerAction.label}
                </span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={open}
              className={tabClass(menuActive)}
            >
              <span className={pillClass(menuActive)}>
                <Menu className="h-5 w-5" />
              </span>
              <span>Menu</span>
            </button>
          </nav>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="z-[110] max-h-[75dvh] overflow-y-auto rounded-t-3xl border-t border-gray-200/70 bg-white/95 p-0 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/95"
          >
            <SheetHeader className="px-5 pb-1 pt-5 text-left">
              <SheetTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Menu
              </SheetTitle>
              <SheetDescription className="sr-only">
                Primary and secondary navigation links
              </SheetDescription>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-1 px-3 pb-4 pt-2">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-4 text-[11px] font-medium transition-colors duration-150",
                      active
                        ? "bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400"
                        : "text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150",
                        active
                          ? "bg-orange-500/15 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400"
                          : "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="max-w-full truncate text-center leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
            {footer && (
              <div className="border-t border-gray-100 px-5 py-4 dark:border-white/10">
                {footer}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </>
    );
  }
);
MobileTabBar.displayName = "MobileTabBar";

export default MobileTabBar;
