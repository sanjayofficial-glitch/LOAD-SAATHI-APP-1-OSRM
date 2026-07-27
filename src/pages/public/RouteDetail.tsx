"use client";

import { useParams, Link } from "react-router-dom";
import { ArrowRight, MapPin, Clock, Route, Truck, Package, Search, Shield, TrendingUp, CheckCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeoMeta from "@/components/SeoMeta";
import { routes } from "@/data/routes";
import { articles } from "@/data/blog";

const benefits = [
  {
    icon: Search,
    title: "AI-Powered Matching",
    desc: "Our algorithm finds the best truck for your load by analyzing route compatibility, capacity, pricing history, and trucker ratings in seconds.",
    stat: "2.4x",
    statLabel: "Faster Matching",
  },
  {
    icon: MapPin,
    title: "Real-Time GPS Tracking",
    desc: "Know exactly where your shipment is at every moment. Live tracking, ETA updates, and automatic milestone notifications for every load.",
    stat: "100%",
    statLabel: "Live Visibility",
  },
  {
    icon: Shield,
    title: "Digital Credit Scores",
    desc: "Every shipper and trucker has a verified digital reputation. Higher scores unlock better rates, faster matches, and priority support.",
    stat: "300-900",
    statLabel: "Credit Score Range",
  },
  {
    icon: TrendingUp,
    title: "AI Price Predictions",
    desc: "Know the fair market rate before you book. Our price prediction engine analyzes current demand, fuel costs, and route data in real time.",
    stat: "95%",
    statLabel: "Price Accuracy",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Post Your Load",
    desc: "Enter origin, destination, weight, dimensions, and pickup window. Takes less than 3 minutes.",
  },
  {
    step: "2",
    title: "AI Matches Trucks",
    desc: "Our algorithm evaluates hundreds of factors to rank the best truckers for your specific shipment.",
  },
  {
    step: "3",
    title: "Book & Track",
    desc: "Confirm the match and track your shipment live from pickup to delivery with GPS tracking.",
  },
  {
    step: "4",
    title: "Pay & Review",
    desc: "Pay securely through the platform. Leave a review and build your digital reputation for future shipments.",
  },
];

export default function RouteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const route = slug ? routes.find((r) => r.slug === slug) : null;

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#050816]">
        <div className="text-center max-w-md mx-auto px-6">
          <Truck className="h-16 w-16 text-orange-400/50 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-foreground mb-3">Route Not Found</h1>
          <p className="text-muted-foreground mb-6">The freight route you're looking for doesn't exist or has been removed.</p>
          <Link to="/routes">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Browse All Routes <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const crossState = route.fromState !== route.toState;
  const stateLabel = crossState
    ? `${route.fromState} → ${route.toState}`
    : `Within ${route.fromState}`;

  const routeSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `PTL Freight ${route.from} to ${route.to}`,
    description: route.metaDescription,
    url: `https://loadsaathi.in/routes/${route.slug}`,
    brand: {
      "@type": "Brand",
      name: "LoadSaathi",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <SeoMeta
        title={`PTL Freight ${route.from} to ${route.to} | Book Trucks Online`}
        description={route.metaDescription}
        canonical={`/routes/${route.slug}`}
        keywords={route.keywords}
        jsonLd={routeSchema}
        breadcrumbs={[
          { name: "Freight Routes", url: "/routes" },
          { name: `${route.from} → ${route.to}`, url: `/routes/${route.slug}` },
        ]}
      />

      <div className="min-h-screen bg-background dark:bg-[#050816]">
        {/* Hero */}
        <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent dark:from-orange-500/10" />
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Link to="/routes" className="hover:text-orange-400 transition-colors">Freight Routes</Link>
                <span>/</span>
                <span className="text-orange-400">{route.from} → {route.to}</span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-800/30 mb-6">
                <MapPin className="h-3.5 w-3.5" />
                {stateLabel}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground dark:text-white mb-6 tracking-tight">
                PTL & LTL Freight from<br />
                <span className="text-orange-600 dark:text-orange-400">{route.from} to {route.to}</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
                {route.description}
              </p>

              {/* Route stats */}
              <div className="flex flex-wrap gap-6 mb-10">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 border border-border">
                  <Route className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="font-bold text-foreground">{route.distanceKm} km</div>
                    <div className="text-xs text-muted-foreground">Total Distance</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 border border-border">
                  <Clock className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="font-bold text-foreground">~{route.transitTime} hours</div>
                    <div className="text-xs text-muted-foreground">Transit Time</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 border border-border">
                  <Package className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="font-bold text-foreground">PTL / LTL</div>
                    <div className="text-xs text-muted-foreground">Freight Type</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wider uppercase px-8 py-4 h-auto rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)] group">
                    Ship from {route.from} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={`/fare-calculator?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`}>
                  <Button variant="outline" className="w-full sm:w-auto border-orange-500/30 text-foreground hover:bg-orange-500/5 text-sm font-bold px-8 py-4 h-auto rounded-lg">
                    Check Estimated Fare
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why this route */}
        <section className="py-20 border-y border-border dark:border-white/5 relative">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-foreground dark:text-white mb-6">
                  Why Ship {route.from} → {route.to} with LoadSaathi?
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Whether you need PTL (Part Truck Load) or LTL (Less Than Truck Load) shipping on the {route.from}–{route.to} corridor, LoadSaathi's AI-powered platform makes freight booking simple, transparent, and cost-effective.
                </p>
                <div className="space-y-4">
                  {[
                    `AI-matched trucks on the ${route.from}–${route.to} route within minutes`,
                    `GPS tracking from pickup to delivery across ${route.distanceKm} km`,
                    `Transparent pricing — know the fair market rate before you book`,
                    `Digital credit scores for trusted shippers and truckers`,
                    crossState ? `Cross-state logistics made simple — Odisha to Jharkhand border crossing handled seamlessly` : `Intra-state shipping within ${route.fromState} — fast and reliable`,
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-8 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
                <div className="text-center">
                  <div className="text-6xl font-black text-orange-600 dark:text-orange-400 mb-2">{route.distanceKm}</div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Kilometers Covered</div>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent my-6" />
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-black text-foreground">{route.transitTime}h</div>
                    <div className="text-xs text-muted-foreground mt-1">Avg Transit</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-foreground">PTL</div>
                    <div className="text-xs text-muted-foreground mt-1">Freight Type</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground dark:text-white mb-4">
                Why LoadSaathi for {route.from} → {route.to}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to ship freight on this corridor — from booking to delivery.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="glass-card p-6 rounded-xl border border-border dark:border-white/[0.08] hover:border-orange-500/30 transition-all duration-300">
                  <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                  <div className="mt-4 pt-3 border-t border-border dark:border-white/[0.06]">
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400">{benefit.stat}</span>
                    <span className="text-xs text-muted-foreground ml-1">{benefit.statLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30 dark:bg-[#010f1f] border-y border-border dark:border-white/5">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground dark:text-white mb-4">
                How to Ship from {route.from} to {route.to}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your freight moving on the {route.from}–{route.to} corridor in four simple steps.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 sm:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground dark:text-white mb-4">
                PTL Freight {route.from} to {route.to} — FAQs
              </h2>
              <p className="text-lg text-muted-foreground">Everything you need to know about shipping on this route.</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: `How much does it cost to ship PTL freight from ${route.from} to ${route.to}?`,
                  a: `Pricing depends on cargo weight, dimensions, vehicle type, and current market demand. On the ${route.from}–${route.to} corridor (${route.distanceKm} km), PTL rates typically range based on per-kg or per-CBM pricing. Use LoadSaathi's fare calculator to get an instant estimate, or post your shipment to receive competitive bids from available truckers.`,
                },
                {
                  q: `How long does it take to ship from ${route.from} to ${route.to}?`,
                  a: `The average transit time on the ${route.from}–${route.to} corridor is approximately ${route.transitTime} hours, depending on road conditions, traffic, and the specific pickup and delivery locations within each city. LoadSaathi's GPS tracking gives you real-time ETAs so you always know when your shipment will arrive.`,
                },
                {
                  q: `What types of trucks are available on the ${route.from}–${route.to} route?`,
                  a: `LoadSaathi's network includes a wide range of trucks operating on this corridor: pickup vans, 7-ton trucks, 9-ton trucks, 14-ton trucks, 17-ton trucks, 21-ton trucks, 25-ton trailer trucks, and container trucks. The right vehicle depends on your cargo type and volume. Post your shipment and our AI will match you with the most suitable truck.`,
                },
                {
                  q: `Can I track my ${route.from} to ${route.to} shipment in real time?`,
                  a: `Yes. Every LoadSaathi shipment comes with live GPS tracking. You can see your truck's location on a map, receive estimated time of arrival updates, and get notified at pickup confirmation, in-transit milestones, and delivery completion. Share the tracking link with your supply chain partners automatically.`,
                },
                {
                  q: `Is PTL freight available on the ${route.from}–${route.to} route?`,
                  a: `Absolutely. LoadSaathi specializes in PTL (Part Truck Load) and LTL (Less Than Truck Load) freight, making it cost-effective to ship smaller loads on the ${route.from}–${route.to} corridor. Instead of paying for a full truck, you share the space and save up to 40% compared to exclusive truck hire.`,
                },
              ].map((item, i) => (
                <div key={i} className="glass-card p-6 rounded-xl border-border dark:border-white/[0.08]">
                  <h3 className="font-bold text-foreground mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Blog Articles */}
        {(function() {
          const relevantArticles = Object.entries(articles).filter(
            ([, a]) => a.relatedRoutes?.includes(route.slug)
          ).slice(0, 3);
          if (relevantArticles.length === 0) return null;
          return (
            <section className="py-20 bg-muted/30 dark:bg-[#010f1f] border-y border-border dark:border-white/5">
              <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
                <div className="text-center mb-10">
                  <h2 className="text-3xl sm:text-4xl font-black text-foreground dark:text-white mb-4">
                    Related Resources for {route.from} → {route.to}
                  </h2>
                  <p className="text-lg text-muted-foreground">Guides and insights for shipping on this route.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-5">
                  {relevantArticles.map(([s, a]) => (
                    <Link key={s} to={`/blog/${s}`} className="glass-card p-5 rounded-xl border border-border hover:border-orange-500/30 transition-all group">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-4 w-4 text-orange-400" />
                        <span className="text-xs font-medium text-muted-foreground">{a.category}</span>
                      </div>
                      <h3 className="font-bold text-foreground text-sm mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">{a.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{a.summary.substring(0, 100)}...</p>
                      <p className="text-xs text-muted-foreground mt-2">{a.readTime}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* Other Routes You Might Need */}
        <section className="py-20">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground dark:text-white mb-4">
                Other Routes You Might Need
              </h2>
              <p className="text-lg text-muted-foreground">Explore more freight corridors across East India.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {routes.filter((r) => r.slug !== route.slug).slice(0, 8).map((r) => (
                <Link key={r.slug} to={`/routes/${r.slug}`} className="glass-card p-4 rounded-xl border border-border hover:border-orange-500/30 transition-all group flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{r.from}</span>
                      <ArrowRight className="h-3 w-3 text-orange-400" />
                      <span className="text-sm font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{r.to}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.distanceKm} km · ~{r.transitTime} hrs</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-400 shrink-0 ml-2" />
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/routes">
                <Button variant="outline" className="border-orange-500/30 text-foreground hover:bg-orange-500/5">
                  View All Routes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-900/5 to-transparent dark:bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.12),transparent_70%)]" />
          <div className="max-w-xl mx-auto px-6 sm:px-12 relative z-10 text-center">
            <div className="glass-card p-10 sm:p-14 rounded-2xl border border-orange-500/20 shadow-[0_0_50px_rgba(249,115,22,0.1)]">
              <Truck className="h-12 w-12 text-orange-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
                Ship from {route.from} to {route.to} Today
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto">
                Post your load and get AI-matched with available trucks on this route. Save up to 40% on freight costs.
              </p>
              <div className="space-y-3">
                <Link to="/register">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wider uppercase px-6 py-4 h-auto rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)] group">
                    Post a Shipment <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-6 pt-2">
                  {["AI matching", "GPS tracking", "Transparent pricing"].map((item, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-400" /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
