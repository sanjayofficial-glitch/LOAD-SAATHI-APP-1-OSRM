
import React, { useState, useMemo, useCallback } from "react";
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
  Heart,
  ImageIcon,
} from "lucide-react";
import LogoMark from "./LogoMark";
import { Button } from "@/components/ui/button";
import NotificationBell from "./NotificationBell";
import OfflineBanner from "./OfflineBanner";
import ThemeToggle from "./ThemeToggle";
import VerificationBadge from "./VerificationBadge";
import AutoGpsTracker from "./AutoGpsTracker";
import DockNav from "./DockNav";
import { DockItem, DockIcon, DockLabel } from "@/components/ui/dock";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NavLinks = React.memo(({ navItems, currentPath, onClick, mobile }: { navItems: NavItem[]; currentPath: string; onClick?: () => void; mobile?: boolean }) => (
  <>
    {navItems.map((item) => {
      const active = item.path === '/trucker/dashboard' || item.path === '/shipper/dashboard'
        ? currentPath === item.path
        : currentPath.startsWith(item.path);
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
));
NavLinks.displayName = "NavLinks";

const FooterSocialLinks = React.memo(() => (
  <TooltipProvider>
    <div className="flex items-center justify-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <a href="https://x.com/LoadSaathi" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" aria-label="Follow on X"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
        </TooltipTrigger>
        <TooltipContent>X</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href="https://www.facebook.com/people/Load-Saathi/61590859902405/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#1877F2] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" aria-label="Follow on Facebook"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></a>
        </TooltipTrigger>
        <TooltipContent>Facebook</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href="https://www.instagram.com/loadsaathi/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#E4405F] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" aria-label="Follow on Instagram"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></a>
        </TooltipTrigger>
        <TooltipContent>Instagram</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href="https://www.reddit.com/user/Loadsaathi/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#FF4500] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" aria-label="Join on Reddit"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.79 6.9a1.56 1.56 0 0 1 1.56 1.56 1.56 1.56 0 0 1-.68 1.28 7.35 7.35 0 0 1 2.03 5.7A7.55 7.55 0 0 1 12 20.38a7.56 7.56 0 0 1-6.7-4.94 7.35 7.35 0 0 1 2.03-5.7 1.56 1.56 0 0 1-.68-1.28A1.56 1.56 0 0 1 8.2 6.9c.55 0 1.04.29 1.31.72a7.31 7.31 0 0 1 4.97 0 1.56 1.56 0 0 1 1.31-.72zm-3.23 7.03c.48.47.48 1.24 0 1.7a1.2 1.2 0 0 1-1.7 0L12 14.2l-1.37 1.37a1.2 1.2 0 0 1-1.7 0c-.48-.46-.48-1.23 0-1.7L10.3 12.5l-1.37-1.37a1.2 1.2 0 0 1 1.7-1.7l1.37 1.37 1.37-1.37a1.2 1.2 0 0 1 1.7 1.7L13.7 12.5zm-4.22 3.7a.82.82 0 0 0 0 1.63.82.82 0 0 0 0-1.63zm5.56 0a.82.82 0 0 0 0 1.63.82.82 0 0 0 0-1.63z" /></svg></a>
        </TooltipTrigger>
        <TooltipContent>Reddit</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href="https://www.threads.com/@loadsaathi" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" aria-label="Follow on Threads"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M14.6 3.1c.3.6.6 1.2.9 1.9.3.7.5 1.4.7 2.2.2.8.4 1.6.5 2.5.5.1 1 .3 1.5.5.5.2.9.4 1.3.7.4.3.7.6.9 1 .2.4.4.9.4 1.5 0 .9-.3 1.7-.8 2.3-.5.6-1.2 1.1-2 1.4-.8.3-1.7.5-2.6.5-.9 0-1.7-.1-2.5-.4-.8-.3-1.4-.7-1.9-1.2-.5-.5-.9-1.1-1.1-1.8-.2-.7-.3-1.4-.3-2.2 0-.8.1-1.6.4-2.3.3-.7.6-1.4 1.1-1.9.5-.5 1-1 1.6-1.3.6-.3 1.3-.5 2-.5.4 0 .9.1 1.4.2.1-.9.3-1.8.6-2.6.3-.8.6-1.6 1-2.3l1.5 2.9zm-4.6 2c-.6.3-1 .7-1.4 1.2-.4.5-.7 1.1-.9 1.7-.2.6-.3 1.3-.3 2 0 .7.1 1.3.3 1.9.2.6.5 1.1.9 1.5.4.4.8.8 1.3 1 .5.2 1.1.4 1.7.4.6 0 1.1-.1 1.6-.3.5-.2.9-.5 1.3-.9.4-.4.6-.8.8-1.4.2-.5.3-1.1.3-1.7 0-.6-.1-1.2-.3-1.7-.2-.5-.4-1-.8-1.4-.4-.4-.8-.7-1.3-.9-.5-.2-1-.3-1.6-.3-.3 0-.6 0-.9.1.1 1.5-.3 2.8-1.2 3.9l-2-3.6z" /></svg></a>
        </TooltipTrigger>
        <TooltipContent>Threads</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href="https://www.linkedin.com/in/load-saathi-119867422/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#0A66C2] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" aria-label="Follow on LinkedIn"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></a>
        </TooltipTrigger>
        <TooltipContent>LinkedIn</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
));
FooterSocialLinks.displayName = "FooterSocialLinks";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = useMemo(() => {
    if (userProfile?.user_type === 'admin') {
      return [
        { label: "Command Center", path: "/admin/monitoring", icon: <ShieldCheck className="h-4 w-4" /> },
        { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: "Users", path: "/admin/users", icon: <Users className="h-4 w-4" /> },
        { label: "Moderation", path: "/admin/moderation", icon: <Shield className="h-4 w-4" /> },
        { label: "Gallery", path: "/admin/gallery", icon: <ImageIcon className="h-4 w-4" /> },
        { label: "Team", path: "/admin/team", icon: <Users className="h-4 w-4" /> },
        { label: "Messages", path: "/messages", icon: <MessageSquare className="h-4 w-4" /> },
      ];
    }
    return userProfile?.user_type === 'trucker' ? [
      { label: "Dashboard", path: "/trucker/dashboard", icon: <Clock className="h-4 w-4" /> },
      { label: "Post Trip", path: "/trucker/post-trip", icon: <PlusCircle className="h-4 w-4" /> },
      { label: "Find Goods", path: "/trucker/browse-shipments", icon: <Search className="h-4 w-4" /> },
      { label: "My Trips", path: "/trucker/my-trips", icon: <Truck className="h-4 w-4" /> },
      { label: "Favorites", path: "/favorites", icon: <Heart className="h-4 w-4" /> },
      { label: "History", path: "/trucker/history", icon: <History className="h-4 w-4" /> },
    ] : [
      { label: "Dashboard", path: "/shipper/dashboard", icon: <Clock className="h-4 w-4" /> },
      { label: "Post Load", path: "/shipper/post-shipment", icon: <PlusCircle className="h-4 w-4" /> },
      { label: "Find Trucks", path: "/browse-trucks", icon: <Truck className="h-4 w-4" /> },
      { label: "My Loads", path: "/shipper/my-shipments", icon: <Search className="h-4 w-4" /> },
      { label: "Favorites", path: "/favorites", icon: <Heart className="h-4 w-4" /> },
      { label: "History", path: "/shipper/history", icon: <History className="h-4 w-4" /> },
    ];
  }, [userProfile?.user_type]);

  const currentPath = location.pathname;

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <OfflineBanner />
      
      {userProfile?.user_type !== 'admin' && <AutoGpsTracker />}
      
      <nav className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <LogoMark size="h-8 w-8 sm:h-9 sm:w-9" />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                  <span className="sm:hidden">LS</span>
                  <span className="hidden sm:inline">LoadSaathi</span>
                </span>
              </Link>
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
                      <span className="truncate flex items-center gap-1">
                        {userProfile?.full_name || "My Account"}
                        <VerificationBadge isVerified={userProfile?.is_verified} size="md" />
                      </span>
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

        {mobileNavOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 px-4 py-3 space-y-1 animate-fade-in-up shadow-lg backdrop-blur-xl">
            <NavLinks navItems={navItems} currentPath={currentPath} onClick={() => setMobileNavOpen(false)} mobile />
          </div>
        )}
      </nav>

      <main className="flex-grow pb-24">
        {children}
      </main>

      <DockNav
        items={navItems.filter((item) => item.path !== "/messages")}
        visible={mobileNavOpen}
        extra={
          <Link to="/messages" aria-label="Chat" className="outline-none min-w-11 min-h-11 flex items-center justify-center rounded-2xl focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-1">
            <DockItem
              className={cn(
                currentPath === "/messages" && "text-orange-600 dark:text-orange-400"
              )}
            >
              <DockIcon>
                <span
                  className={cn(
                    "flex h-full w-full items-center justify-center rounded-2xl transition-colors",
                    currentPath === "/messages"
                      ? "bg-orange-500/15 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400"
                      : "bg-transparent text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
                  )}
                >
                  <MessageSquare className="h-6 w-6" />
                </span>
              </DockIcon>
              <DockLabel>Chat</DockLabel>
            </DockItem>
          </Link>
        }
      />

      <footer className="hidden lg:block bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 pt-6 sm:pt-8 pb-24 mt-auto backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LogoMark size="h-8 w-8" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">LoadSaathi</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-4">
            Connecting India's truckers with shippers directly.
          </p>
          <div className="flex justify-center space-x-6 text-xs sm:text-sm text-gray-400 dark:text-gray-500 mb-4">
            <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">Home</Link>
            <Link to="/profile" className="hover:text-gray-600 dark:hover:text-gray-300">Profile</Link>
            <Link to="/messages" className="hover:text-gray-600 dark:hover:text-gray-300">Messages</Link>
          </div>
          <FooterSocialLinks />
        </div>
      </footer>
    </div>
  );
}
