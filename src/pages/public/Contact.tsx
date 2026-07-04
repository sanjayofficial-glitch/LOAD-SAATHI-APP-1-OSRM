"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Clock, MapPin, Send, ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const supportInfo = [
  { icon: Mail, label: "Email Us", value: "support@loadsaathi.com", detail: "We respond within 2-4 hours" },
  { icon: MessageSquare, label: "Live Chat", value: "Available 24/7", detail: "Instant responses from our support team" },
  { icon: Clock, label: "Response Time", value: "Under 4 hours", detail: "Average first response time" },
  { icon: MapPin, label: "Office", value: "Bengaluru, India", detail: "Remote-first team across India" },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#050816] text-foreground antialiased overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
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
                Get in Touch
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6">
              Let&apos;s <span className="text-gradient-orange-blue">talk</span>.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Have a question, feedback, or want to learn more about LoadSaathi? We&apos;d love to hear from you. Our team typically responds within 2-4 hours.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT FORM & INFO */}
      <section className="fade-section py-24 relative">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="glass-card p-8 sm:p-10 rounded-xl border-border dark:border-white/[0.08]">
                <h2 className="text-2xl font-black text-foreground mb-6">Send Us a Message</h2>
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                      <Send className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">Thank you for reaching out. Our team will get back to you within 2-4 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="bg-background dark:bg-[#0B1220] border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="bg-background dark:bg-[#0B1220] border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="bg-background dark:bg-[#0B1220] border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about what you're looking for..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="bg-background dark:bg-[#0B1220] border-border resize-none"
                      />
                    </div>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wider uppercase px-8 py-4 h-auto rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)] w-full sm:w-auto">
                      Send Message <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="lg:col-span-2 space-y-4">
              {supportInfo.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="glass-card p-6 rounded-xl border-border dark:border-white/[0.08] hover:border-orange-500/30 transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-600/10 dark:bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{item.label}</div>
                        <div className="text-sm font-bold text-foreground">{item.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.detail}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="glass-card p-6 rounded-xl border-border dark:border-white/[0.08] mt-6">
                <h3 className="text-sm font-bold text-foreground mb-3">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="text-foreground font-medium">9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="text-foreground font-medium">10:00 AM - 2:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="text-foreground font-medium">Closed (Chat support available)</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl border border-orange-500/10 bg-orange-500/5 mt-6">
                <h3 className="text-sm font-bold text-foreground mb-2">Enterprise Inquiries</h3>
                <p className="text-xs text-muted-foreground mb-3">Looking to integrate LoadSaathi with your existing systems or need a custom solution?</p>
                <a href="mailto:enterprise@loadsaathi.com" className="text-sm text-orange-500 hover:text-orange-400 font-semibold underline underline-offset-2">
                  enterprise@loadsaathi.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fade-section py-24 relative overflow-hidden bg-muted/30 dark:bg-[#010f1f] border-y border-border dark:border-white/5">
        <div className="max-w-xl w-full mx-auto px-6 sm:px-12 relative z-10 text-center">
          <Truck className="h-10 w-10 text-orange-500 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black text-foreground dark:text-white mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">Join India&apos;s intelligent freight network today.</p>
          <Link to="/register">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wider uppercase px-8 py-4 h-auto rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Contact;
