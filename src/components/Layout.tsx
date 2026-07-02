"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  User, 
  Search, 
  Clock, 
  Truck, 
  Menu, 
  X,
  LogOut, 
  MessageSquare, 
  History,
  PlusCircle,
  ShieldCheck,
  Shield,
  Users,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationBell from "./NotificationBell";
import OfflineBanner from "./OfflineBanner";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const getNavItems = () => {
    if (userProfile?.user_type === 'admin') {
      return [
        { label: "Command Center", path: "/admin/monitoring", icon: <ShieldCheck className="h-4 w-4" /> },
        { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: "Users", path: "/admin/users", icon: <Users className="h-4 w-4" /> },
        { label: "Messages", path: "/messages", icon: <MessageSquare className="h-4 w-4" /> },
      ];
    }

    return userProfile?.user_type === 'trucker' ? [
      { label: "Dashboard", path: "/trucker/dashboard", icon: <Clock className="h-4 w-4" /> },
      { label: "Post Trip", path: "/trucker/post-trip", icon: <PlusCircle className="h-4 w-4" /> },
      { label: "Find Goods", path: "/trucker/browse-shipments", icon: <Search className="h-4 w-4" /> },
      { label: "My Trips", path: "/trucker/my-trips", icon: <Truck className="h-4 w-4" /> },
      { label: "History", path: "/trucker/history", icon: <History className="h-4 w-4" /> },
    ] : [
      { label: "Dashboard", path: "/shipper/dashboard", icon: <Clock className="h-4 w-4" /> },
      { label: "Post Load", path: "/shipper/post-shipment", icon: <PlusCircle className="h-4 w-4" /> },
      { label: "Find Trucks", path: "/browse-trucks", icon: <Truck className="h-4 w-4" /> },
      { label: "My Loads", path: "/shipper/my-shipments", icon: <Search className="h-4 w-4" /> },
      { label: "History", path: "/shipper/history", icon: <History className="h-4 w-4" /> },
    ];
  };

  const navItems = getNavItems();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/trucker/dashboard' || path === '/shipper/dashboard') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NavLinks = ({ onClick, mobile }: { onClick?: () => void; mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClick}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              active
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800",
              mobile && "text-base py-3"
            )}
          >
            {item.icon}
            {item.label}
            {active && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400 ml-auto" />}
          </Link>
        );
      })}
    </>
  );

  const MobileBottomNav = () => {
    if (mobileNavOpen) return null;
    const mainItems = navItems.slice(0, 4);
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
        <div className="flex items-center justify-around py-1">
          {mainItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-lg transition-all min-w-0",
                  active ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                <div className={cn("transition-transform", active && "scale-110")}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium mt-0.5 truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/messages"
            className={cn(
              "flex flex-col items-center py-2 px-3 rounded-lg transition-all min-w-0",
              currentPath === '/messages' ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-[10px] font-medium mt-0.5">Chat</span>
          </Link>
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <OfflineBanner />
      
      {/* Top Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg shadow-sm">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                  <span className="sm:hidden">LS</span>
                  <span className="hidden sm:inline">LoadSaathi</span>
                </span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-1">
                <NavLinks />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <ThemeToggle />
              <NotificationBell />

              <Link to="/messages">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 h-9 w-9 sm:h-10 sm:w-10">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>

              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 dark:text-gray-400 h-9 w-9 sm:h-10 sm:w-10"
                  onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                >
                  {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      {(userProfile?.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="truncate">{userProfile?.full_name || "My Account"}</span>
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 capitalize">{userProfile?.user_type}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/credit-score" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      Credit Score
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center gap-2 cursor-pointer">
                      <Home className="h-4 w-4" />
                      Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1 animate-fade-in shadow-lg">
            <NavLinks onClick={() => setMobileNavOpen(false)} mobile />
          </div>
        )}
      </nav>

      <main className="flex-grow pb-16 lg:pb-0">
        {children}
      </main>

      <MobileBottomNav />

      <footer className="hidden lg:block bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1 rounded-lg">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">LoadSaathi</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-4">
            Connecting India's truckers with shippers directly.
          </p>
          <div className="flex justify-center space-x-6 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
            <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">Home</Link>
            <Link to="/profile" className="hover:text-gray-600 dark:hover:text-gray-300">Profile</Link>
            <Link to="/messages" className="hover:text-gray-600 dark:hover:text-gray-300">Messages</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
