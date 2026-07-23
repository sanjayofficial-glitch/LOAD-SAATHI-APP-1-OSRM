"use client";

import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import SeoMeta from "@/components/SeoMeta";

const articles = [
  {
    slug: "indian-logistics-eway-bill-gst-2026",
    category: "Industry Insights",
    title: "e-Way Bill Rules 2026: New GST Compliance Changes Every Indian Business Must Know",
    excerpt: "The GSTN has introduced mandatory Ship-To GSTIN fields and voluntary e-Way Bill closure effective August 1, 2026. Here's what changed, who's affected, and how to stay compliant.",
    date: "July 23, 2026",
    readTime: "12 min read",
    author: "LoadSaathi Team",
  },
  {
    slug: "ai-freight-matching",
    category: "Industry Insights",
    title: "How AI is Transforming Freight Matching in India",
    excerpt: "India's logistics industry loses ₹1.5 lakh crore annually to empty truck returns. AI-powered freight matching is changing that by predicting the perfect load for every truck in real time.",
    date: "June 15, 2026",
    readTime: "5 min read",
    author: "LoadSaathi Team",
  },
  {
    slug: "reduce-empty-kilometers",
    category: "Trucker Tips",
    title: "5 Ways to Reduce Empty Truck Kilometers",
    excerpt: "Empty return trips eat into your profits more than you think. Here are five actionable strategies to keep your truck loaded in both directions.",
    date: "June 10, 2026",
    readTime: "4 min read",
    author: "Rajesh Kumar",
  },
  {
    slug: "freight-credit-score-guide",
    category: "Product Updates",
    title: "Understanding the Digital Freight Credit Score",
    excerpt: "Your digital reputation matters. LoadSaathi's credit score system helps truckers and shippers build trust before the first handshake.",
    date: "June 5, 2026",
    readTime: "6 min read",
    author: "Priya Sharma",
  },
  {
    slug: "first-shipment-guide",
    category: "Shipper Guide",
    title: "The Complete Guide to Posting Your First Shipment",
    excerpt: "New to digital freight? Here's everything you need to know about posting a shipment, setting the right price, and choosing the best trucker for your load.",
    date: "May 28, 2026",
    readTime: "7 min read",
    author: "Amit Verma",
  },
  {
    slug: "digital-load-boards-india",
    category: "Industry Insights",
    title: "Why Indian Truckers Are Switching to Digital Load Boards",
    excerpt: "From broker-dependent to direct digital matching — how India's truckers are reclaiming margins and control over their routes.",
    date: "May 20, 2026",
    readTime: "5 min read",
    author: "LoadSaathi Team",
  },
  {
    slug: "real-time-tracking-launch",
    category: "Product Updates",
    title: "LoadSaathi Launches Real-Time GPS Tracking",
    excerpt: "Know exactly where your shipment is at every moment. Our new GPS integration gives both shippers and truckers unprecedented visibility.",
    date: "May 12, 2026",
    readTime: "3 min read",
    author: "Vikram Singh",
  },
  {
    slug: "ai-price-prediction",
    category: "Product Updates",
    title: "How Our AI Price Predictions Work",
    excerpt: "Pricing freight is complex. Our multi-provider AI chain analyzes route, weight, market conditions, and historical data to recommend fair rates every time.",
    date: "May 5, 2026",
    readTime: "6 min read",
    author: "Priya Sharma",
  },
  {
    slug: "broker-to-direct-shipper",
    category: "Case Study",
    title: "From Broker-Dependent to Direct: One Shipper's Journey",
    excerpt: "How a Delhi-based manufacturer cut logistics costs by 28% in three months by switching to LoadSaathi's direct matching platform.",
    date: "April 28, 2026",
    readTime: "8 min read",
    author: "Amit Verma",
  },
];

const categoryColors: Record<string, string> = {
  "Industry Insights": "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30",
  "Trucker Tips": "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/30",
  "Product Updates": "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/30",
  "Shipper Guide": "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/30",
  "Case Study": "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/30",
};

export default function BlogList() {
  return (
    <>
    <SeoMeta
      title="Blog — Freight & Logistics Insights"
      description="Insights, guides, and stories from India's intelligent freight network. Learn about AI freight matching, reducing empty kilometers, digital load boards, and more."
      keywords="freight blog India, logistics insights, trucking tips India, PTL LTL blog, digital freight marketplace, load board India"
      canonical="/blog"
    />
    <div className="min-h-screen bg-background dark:bg-[#050816]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f97316 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-24 relative z-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-orange-500" />
            <span className="text-xs font-semibold tracking-widest uppercase bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-700/30">Our Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 text-foreground dark:text-white">
            LoadSaathi Blog
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
            Insights, guides, and stories from India's intelligent freight network. Stay updated on industry trends and product updates.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="glass-card rounded-xl border border-border hover:border-orange-500/30 transition-all duration-300 group overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-orange-500/10 via-blue-500/5 to-transparent dark:from-orange-900/20 dark:via-blue-900/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                  📦
                </div>
              </div>
              <div className="p-6">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${categoryColors[article.category] || ""}`}>
                  {article.category}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-3 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {article.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-orange-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
