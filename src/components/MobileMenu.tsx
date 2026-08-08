import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "Features", path: "/features" },
  { label: "Fare Calculator", path: "/fare-calculator" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "Pricing", path: "/pricing" },
  { label: "About", path: "/about" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
];

const MobileMenu = React.memo(({ open, onClose }: MobileMenuProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-background/95 dark:bg-[#050816]/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center gap-7 overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] right-6 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        aria-label="Close menu"
      >
        <X className="h-6 w-6" />
      </button>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClose}
          className="text-2xl font-bold text-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-all"
        >
          {item.label}
        </Link>
      ))}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link to="/login" onClick={onClose}>
          <Button variant="outline" className="text-sm font-bold tracking-wider uppercase px-8 py-3 h-auto rounded-lg">
            Sign In
          </Button>
        </Link>
        <Link to="/register" onClick={onClose}>
          <Button className="bg-orange-700 hover:bg-orange-800 text-white text-sm font-bold tracking-wider uppercase px-8 py-3 h-auto rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
});
MobileMenu.displayName = "MobileMenu";

export default MobileMenu;
