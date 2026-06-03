"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
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
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationBell from "./NotificationBell";
import OfflineBanner from "./OfflineBanner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const getNavItems = () => {
    if (userProfile?.user_type === 'admin') {
      return [
        { label: "Command Center", path: "/admin/monitoring", icon: <ShieldCheck className="h-4 w-4" /> },
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClick}
          className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2"
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <Truck className="h-7 w-7 sm:h-8 sm:w-8 text-orange-600" />
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  <span className="sm:hidden">LS</span>
                  <span className="hidden sm:inline">LoadSaathi</span>
                </span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-1">
                <NavLinks />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <NotificationBell />

              <Link to="/messages">
                <Button variant="ghost" size="icon" className="text-gray-600 h-9 w-9 sm:h-10 sm:w-10">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>

              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 h-9 w-9 sm:h-10 sm:w-10"
                  onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                >
                  {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 h-9 w-9 sm:h-10 sm:w-10">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{userProfile?.full_name || "My Account"}</span>
                      <span className="text-xs font-normal text-gray-500 capitalize">{userProfile?.user_type}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
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
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <NavLinks onClick={() => setMobileNavOpen(false)} />
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t py-6 sm:py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">LoadSaathi</span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mb-4">
            Connecting India's truckers with shippers directly.
          </p>
          <div className="flex justify-center space-x-6 text-xs sm:text-sm text-gray-400">
            <Link to="/" className="hover:text-gray-600">Home</Link>
            <Link to="/profile" className="hover:text-gray-600">Profile</Link>
            <Link to="/messages" className="hover:text-gray-600">Messages</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
