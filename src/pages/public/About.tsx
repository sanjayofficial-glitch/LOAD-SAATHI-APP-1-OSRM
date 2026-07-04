"use client";

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Target, Eye, Heart, Shield, Zap, Users, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const values = [
  { icon: Target, title: "Purpose-Driven Innovation", desc: "Every feature we build directly targets India's 40% empty kilometer problem. We don't add fluff — we solve real logistics inefficiencies." },
  { icon: Heart, title: "Trust Above All", desc: "Our platform is built on transparency and accountability. Digital credit scores, bidirectional reviews, and verified profiles ensure trust in every transaction." },
  { icon: Shield, title: "Empathy for Both Sides", desc: "We design for shippers AND truckers, understanding the unique challenges each face. A healthy logistics ecosystem serves both equally." },
  { icon: Zap, title: "Speed & Simplicity", desc: "Logistics is complex, but using LoadSaathi shouldn't be. We obsess over reducing friction — from registration to payment settlement." },
  { icon: Users, title: "Community First", desc: "We're building more than a platform — we're building a network. Every member strengthens the ecosystem for everyone else." },
];

const stats = [
  { value: "40%", label: "Empty Kilometers Today", detail: "Of all truck kilometers in India are run empty" },
  { value: "₹1.5L Cr", label: "Annual Economic Loss", detail: "Wasted annually due to logistics inefficiency" },
  { value: "0%", label: "Tolerance for Inefficiency", detail: "Our commitment to eliminating waste" },
];

const About = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-section").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-[#050816] text-foreground antialiased overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.12] dark:opacity-[0.15]"
            style={{ background: "radial-gradient(circle, #f97316 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.10] dark:opacity-[0.15]"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 w-full relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 w-fit mb-6">
              <span className="text-xs font-semibold tracking-widest uppercase bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-700/30">
                Our Story
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6">
              Building the <span className="text-gradient-orange-blue">operating system</span> for Indian freight.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              LoadSaathi was born from a simple observation: India doesn&apos;t have a truck shortage. India has a utilization problem. We&apos;re here to fix it.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="fade-section py-24 relative">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-xl border border-orange-500/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-orange-600/10 dark:bg-orange-500/10 flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To eliminate empty kilometers from Indian logistics by building an AI-powered network that connects every load to its perfect truck — instantly, transparently, and efficiently.
              </p>
            </div>
            <div className="glass-card p-10 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-blue-600/10 dark:bg-blue-500/10 flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                A future where no truck runs empty, every shipment finds its match in seconds, and India&apos;s logistics industry operates at peak efficiency — powered by intelligence, not guesswork.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM & SOLUTION */}
      <section className="fade-section py-24 bg-muted/30 dark:bg-[#010f1f] border-y border-border dark:border-white/5 relative">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-red-500 mb-4 block">The Problem</span>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground dark:text-white mb-6">A Broken System</h2>
              <ul className="space-y-4">
                {[
                  "40% of truck kilometers in India are run empty — that's millions of tons of CO₂ and billions in wasted fuel",
                  "Fragmented broker networks with opaque pricing erode margins for both shippers and truckers",
                  "No standardized credit or trust system forces cash-only transactions and limits access to reliable partners",
                  "Manual coordination via phone calls and WhatsApp groups creates inefficiency at every step",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-green-500 mb-4 block">Our Solution</span>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground dark:text-white mb-6">Intelligence, Not Intermediaries</h2>
              <ul className="space-y-4">
                {[
                  "AI-powered matching that connects shipments to trucks in real-time, eliminating empty return trips",
                  "Transparent, market-reflective pricing powered by our prediction engine — no more guesswork",
                  "Digital Freight Credit Score (300-900) creates trust and enables secure, cashless transactions",
                  "End-to-end digitization from posting to payment with real-time tracking and automated workflows",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="fade-section border-y border-border dark:border-white/5 bg-muted/50 dark:bg-[#010f1f]/80 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-12 flex flex-col md:flex-row justify-around items-center gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-orange-600 dark:text-orange-400 tracking-tight">{stat.value}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">{stat.label}</div>
              <div className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">{stat.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="fade-section py-24 relative">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground dark:text-white">What We Stand For</h2>
            <p className="text-lg text-muted-foreground">Our values shape every product decision we make and every partnership we build.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <div key={i} className="glass-card p-8 rounded-xl hover:border-orange-500/30 transition-all duration-300 group border-border dark:border-white/[0.08]">
                <value.icon className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-5 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="fade-section py-24 bg-muted/30 dark:bg-[#010f1f] border-y border-border dark:border-white/5 relative">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 relative z-10 text-center">
          <Globe className="h-12 w-12 text-orange-500 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black mb-6 text-foreground dark:text-white">The LoadSaathi Story</h2>
          <div className="text-muted-foreground leading-relaxed space-y-4 text-left max-w-3xl mx-auto">
            <p>
              LoadSaathi started with a simple question: why do 40% of India&apos;s trucks run empty? After months of talking to shippers, truckers, and fleet owners across the country, the answer became clear — not a lack of demand, but a lack of visibility and trust.
            </p>
            <p>
              Shippers couldn&apos;t find reliable transporters for their routes. Truckers couldn&apos;t find return loads after delivering. Brokers controlled information and took a cut from both sides. The entire system ran on phone calls, gut feel, and cash.
            </p>
            <p>
              We built LoadSaathi to change that. Our AI-powered platform brings transparency, efficiency, and trust to Indian freight. We&apos;re not just digitizing existing processes — we&apos;re reimagining how logistics works in a connected India.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fade-section py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-900/5 to-transparent dark:bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.12),transparent_70%)]" />
        <div className="max-w-xl w-full mx-auto px-6 sm:px-12 relative z-10">
          <div className="glass-card p-10 sm:p-14 rounded-2xl border border-orange-500/20 shadow-[0_0_50px_rgba(249,115,22,0.1)] text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Join the Movement</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8">Be part of India&apos;s freight transformation. Sign up today.</p>
            <Link to="/register">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wider uppercase px-8 py-4 h-auto rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
