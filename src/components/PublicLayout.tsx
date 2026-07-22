"use client";

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import OfflineBanner from "./OfflineBanner";
import { Button } from "./ui/button";
import LogoMark from "./LogoMark";

const footerLinks = {
  Platform: [
    { label: "Features", path: "/features" },
    { label: "How It Works", path: "/how-it-works" },
    { label: "Pricing", path: "/pricing" },
    { label: "Network", path: "/features" },
  ],
  Solutions: [
    { label: "For Shippers", path: "/solutions/shippers" },
    { label: "For Truckers", path: "/solutions/truckers" },
    { label: "Safety & Trust", path: "/safety-trust" },
    { label: "Fare Calculator", path: "/fare-calculator" },
  ],
  Company: [
    { label: "About", path: "/about" },
    { label: "Blog", path: "/blog" },
    { label: "Contact", path: "/contact" },
    { label: "FAQ", path: "/faq" },
  ],
  Legal: [
    { label: "Privacy", path: "/privacy" },
    { label: "Terms", path: "/terms" },
  ],
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background dark:bg-[#050816] text-foreground antialiased overflow-x-hidden">
      <OfflineBanner />
      <nav className="fixed top-0 w-full z-50 bg-background/70 dark:bg-[#050816]/70 backdrop-blur-xl border-b border-border dark:border-white/10 h-20">
        <div className="flex justify-between items-center w-full px-6 sm:px-12 max-w-[1440px] mx-auto h-full">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark size="h-10 w-10" />
            <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">LoadSaathi</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">Features</Link>
            <Link to="/fare-calculator" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">Fare Calculator</Link>
            <Link to="/how-it-works" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">How It Works</Link>
            <Link to="/pricing" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">Pricing</Link>
            <Link to="/about" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">About</Link>
            <Link to="/faq" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">FAQ</Link>
            <Link to="/contact" className="nav-link text-muted-foreground hover:text-foreground dark:hover:text-orange-400">Contact</Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Link to="/login" className="hidden sm:inline-block text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold tracking-wider uppercase px-5 py-2 h-auto shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      <main className="pt-20 min-h-screen">
        {children}
      </main>
      <footer className="bg-muted dark:bg-[#0B1220] border-t border-border dark:border-white/5 w-full py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 px-6 sm:px-12 max-w-[1440px] mx-auto">
          <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <LogoMark size="h-10 w-10" />
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">LoadSaathi</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Precision Freight Intelligence — matching every load to its perfect space using AI.
            </p>
            <div className="flex items-center gap-2">
              <Link to="/register">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold tracking-wider uppercase px-4 py-2 h-auto rounded-lg">
                  Join Now <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="flex flex-col gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{group}</span>
              {links.map(link => (
                <Link key={link.path} to={link.path} className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-border dark:border-white/5 mt-12 pt-8 text-center">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} LoadSaathi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
