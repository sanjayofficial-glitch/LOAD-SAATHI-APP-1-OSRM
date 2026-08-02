
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import OfflineBanner from "./OfflineBanner";
import { Button } from "./ui/button";
import LogoMark from "./LogoMark";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";

const footerLinks = {
  Platform: [
    { label: "Features", path: "/features" },
    { label: "How It Works", path: "/how-it-works" },
    { label: "Pricing", path: "/pricing" },
    { label: "Network", path: "/about" },
  ],
  Solutions: [
    { label: "For Shippers", path: "/solutions/shippers" },
    { label: "For Truckers", path: "/solutions/truckers" },
    { label: "Safety & Trust", path: "/safety-trust" },
    { label: "Fare Calculator", path: "/fare-calculator" },
  ],
  Freight: [
    { label: "All Routes", path: "/routes" },
    { label: "Rourkela–Ranchi", path: "/routes/rourkela-to-ranchi" },
    { label: "Ranchi–Kolkata", path: "/routes/ranchi-to-kolkata" },
    { label: "Bhubaneswar–Kolkata", path: "/routes/bhubaneswar-to-kolkata" },
  ],
  Company: [
    { label: "About", path: "/about" },
    { label: "Blog", path: "/blog" },
    { label: "Guides", path: "/guide/ptl-vs-ftl" },
    { label: "Contact", path: "/contact" },
  ],
  Legal: [
    { label: "Privacy", path: "/privacy" },
    { label: "Terms", path: "/terms" },
  ],
};

const socialLinks = [
  { name: "X", url: "https://x.com/LoadSaathi", label: "Follow on X", color: "text-foreground", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
  { name: "Facebook", url: "https://www.facebook.com/people/Load-Saathi/61590859902405/", label: "Follow on Facebook", color: "text-[#1877F2]", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
  { name: "Instagram", url: "https://www.instagram.com/loadsaathi/", label: "Follow on Instagram", color: "text-[#E4405F]", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg> },
  { name: "Reddit", url: "https://www.reddit.com/user/Loadsaathi/", label: "Join on Reddit", color: "text-[#FF4500]", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.79 6.9a1.56 1.56 0 0 1 1.56 1.56 1.56 1.56 0 0 1-.68 1.28 7.35 7.35 0 0 1 2.03 5.7A7.55 7.55 0 0 1 12 20.38a7.56 7.56 0 0 1-6.7-4.94 7.35 7.35 0 0 1 2.03-5.7 1.56 1.56 0 0 1-.68-1.28A1.56 1.56 0 0 1 8.2 6.9c.55 0 1.04.29 1.31.72a7.31 7.31 0 0 1 4.97 0 1.56 1.56 0 0 1 1.31-.72zm-3.23 7.03c.48.47.48 1.24 0 1.7a1.2 1.2 0 0 1-1.7 0L12 14.2l-1.37 1.37a1.2 1.2 0 0 1-1.7 0c-.48-.46-.48-1.23 0-1.7L10.3 12.5l-1.37-1.37a1.2 1.2 0 0 1 1.7-1.7l1.37 1.37 1.37-1.37a1.2 1.2 0 0 1 1.7 1.7L13.7 12.5zm-4.22 3.7a.82.82 0 0 0 0 1.63.82.82 0 0 0 0-1.63zm5.56 0a.82.82 0 0 0 0 1.63.82.82 0 0 0 0-1.63z" /></svg> },
  { name: "Threads", url: "https://www.threads.com/@loadsaathi", label: "Follow on Threads", color: "text-foreground", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M19.884 13.228c-.392-.558-.964-.89-1.654-.96-.022-.002-.045-.004-.067-.004l-.002.002c-.59.034-1.136.236-1.545.568-.046-1.325-.514-2.478-1.346-3.316-.886-.894-2.092-1.386-3.46-1.414h-.03c-1.168-.024-2.27.346-3.155 1.06-.889.718-1.497 1.74-1.736 2.915l1.818.546c.174-.846.584-1.544 1.196-2.032.609-.487 1.357-.72 2.13-.706.523.007 1.02.12 1.478.337.7.332 1.233.893 1.568 1.654.28.636.443 1.429.482 2.358-1.14.2-2.086.622-2.79 1.235-.647.562-1.047 1.309-1.155 2.164-.048.38.004.778.152 1.147.176.438.49.832.915 1.147.71.527 1.635.816 2.646.816h.002c2.068 0 3.97-1.29 4.885-2.598.738-1.054 1.117-2.413 1.09-3.9-.03-1.365-.485-2.365-.985-3.121zm-4.496 5.084c-.64-.016-1.207-.26-1.59-.685-.384-.426-.554-.979-.477-1.558.069-.522.332-.968.78-1.322.598-.471 1.433-.79 2.536-.938l.012.002c-.123 1.756-.675 3.04-1.261 4.501zM12.062 0C5.482 0 .012 5.332.012 11.896c0 6.565 5.47 11.896 12.05 11.896 6.582 0 12.026-5.33 12.026-11.896C24.088 5.331 18.644 0 12.062 0zm.064 3.154c4.754 0 8.702 3.518 9.226 8.598-1.192 2.402-3.17 3.953-5.034 5.075-1.34.807-2.776 1.395-4.136 1.395-1.856 0-3.378-1.042-4.043-2.523-.849.5-1.86.805-2.96.838-.775.023-1.54-.11-2.24-.393-.841-.34-1.542-.883-2.074-1.57-.54-.696-.854-1.525-.896-2.39-.044-.906.163-1.797.606-2.607.443-.81 1.07-1.474 1.83-1.95.742-.464 1.618-.73 2.552-.73.313 0 .625.03.933.09.296.058.586.14.866.249.14-.536.346-1.049.618-1.524.808-1.408 2.108-2.433 3.754-2.79.06-.01.12-.02.17-.03 1.136-.27 2.342-.22 3.446.145 1.088.36 2.034.98 2.726 1.793.085.1.176.214.272.342.266.354.493.736.678 1.14.182-.026.367-.04.554-.04 1.342 0 2.586.593 3.47 1.582-.757-2.62-3.176-4.616-6.096-4.616z" /></svg> },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/load-saathi-119867422/", label: "Follow on LinkedIn", color: "text-[#0A66C2]", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
];

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
              {links.map((link, i) => (
                <Link key={`${group}-${i}`} to={link.path} className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-orange-400 transition-all">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-border dark:border-white/5 mt-12 pt-8">
          <TooltipProvider>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-6 sm:px-12 max-w-[1440px] mx-auto mb-6">
            {socialLinks.map((social) => (
              <Tooltip key={social.name}>
                <TooltipTrigger asChild>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-9 h-9 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center ${social.color} hover:bg-muted-foreground/10 dark:hover:bg-white/10 transition-all`}
                  >
                    {social.icon}
                  </a>
                </TooltipTrigger>
                <TooltipContent>{social.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          </TooltipProvider>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} LoadSaathi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
