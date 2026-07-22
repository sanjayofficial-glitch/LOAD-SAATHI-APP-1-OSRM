"use client";

import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SeoMeta from "@/components/SeoMeta";

const articles: Record<string, {
  category: string;
  title: string;
  date: string;
  lastUpdated?: string;
  readTime: string;
  author: string;
  authorBio: string;
  summary: string;
  content: string[];
}> = {
  "ai-freight-matching": {
    category: "Industry Insights",
    title: "How AI is Transforming Freight Matching in India",
    date: "June 15, 2026",
    lastUpdated: "July 10, 2026",
    readTime: "5 min read",
    author: "LoadSaathi Team",
    authorBio: "The LoadSaathi engineering and product team builds AI-powered logistics tools for India's freight industry.",
    summary: "AI-powered freight matching platforms analyze route compatibility, vehicle capacity, pricing history, and real-time availability to connect shippers with truckers in seconds. LoadSaathi's multi-layered AI approach uses deterministic scoring and LLM refinement to deliver 34% higher capacity utilization and 28% faster matching times.",
    content: [
      "India's freight industry moves over 4.6 billion tonnes of goods annually, yet nearly 40% of truck kilometers are driven empty. This inefficiency costs the economy an estimated ₹1.5 lakh crore every year. The root cause? A fragmented, broker-mediated matching system where information asymmetry and manual coordination leave capacity stranded.",
      "Artificial intelligence is changing this landscape fundamentally. Modern AI-powered matching platforms analyze dozens of variables simultaneously — origin and destination cities, route optimization, vehicle type compatibility, price trends, historical reliability scores, and real-time availability — to connect shippers with the right truckers in seconds rather than days.",
      "LoadSaathi uses a multi-layered AI approach. Our deterministic scoring engine calculates a baseline match score based on seven weighted factors: route alignment, capacity fit, price compatibility, timeliness, historical performance, communication responsiveness, and tenure. On top of this, our AI models — running on Gemini, Groq, and OpenRouter — refine these scores with natural language understanding and market context.",
      "The results speak for themselves. Shippers using AI-matched loads report 34% higher capacity utilization and 28% faster load-to-truck matching times. Truckers find return loads 3x faster than traditional broker networks. As AI models continue to improve with more data, we expect these efficiency gains to compound significantly.",
    ],
  },
  "reduce-empty-kilometers": {
    category: "Trucker Tips",
    title: "5 Ways to Reduce Empty Truck Kilometers",
    date: "June 10, 2026",
    lastUpdated: "July 5, 2026",
    readTime: "4 min read",
    author: "Rajesh Kumar",
    authorBio: "Rajesh Kumar is a logistics operations specialist with 12 years of experience in Indian trucking corridors.",
    summary: "Empty truck kilometers cost ₹35-45 per km to operate. Indian truckers can reduce deadheading by using digital load boards proactively, building route clusters on high-demand corridors, leveraging credit scores for priority matching, joining networks early, and accepting partial loads when full returns aren't available.",
    content: [
      "Every kilometer you drive empty is money lost. Between fuel costs, tolls, driver wages, and vehicle depreciation, an empty truck costs roughly ₹35-45 per kilometer to operate. For a 500km empty return trip, that's ₹17,500-22,500 in pure waste.",
      "First, use digital load boards proactively. Instead of waiting at the destination for a return load, post your availability 24-48 hours before you reach your delivery point. LoadSaathi's AI will start matching you with shipments heading back toward your home base before you even arrive.",
      "Second, build route clusters. Run regular routes between cities with high two-way freight demand — Delhi-Mumbai, Bengaluru-Hyderabad, Chennai-Kolkata — and establish yourself as a reliable carrier on these corridors. Repeat business on established routes eliminates empty legs.",
      "Third, leverage your credit score. A strong LoadSaathi credit score (700+) signals reliability to shippers. Higher-rated truckers get priority matching and see more load offers. Maintain on-time completion rates and positive reviews to boost your score.",
      "Fourth, join the network early. The more shippers and truckers that use the platform, the denser the route coverage becomes. Early adopters in any corridor capture the best loads before competition intensifies.",
      "Fifth, stay flexible. If a full-load return isn't available, consider partial loads or multi-stop routes. Something is always better than empty. Our AI can suggest optimal partial-load combinations that still beat deadheading back empty.",
    ],
  },
  "freight-credit-score-guide": {
    category: "Product Updates",
    title: "Understanding the Digital Freight Credit Score",
    date: "June 5, 2026",
    lastUpdated: "July 8, 2026",
    readTime: "6 min read",
    author: "Priya Sharma",
    authorBio: "Priya Sharma is the Product Lead at LoadSaathi, specializing in trust and reputation systems for marketplace platforms.",
    summary: "The LoadSaathi Digital Freight Credit Score ranges from 300 to 900, calculated from five factors: completion rate (30%), reliability (25%), reviews (20%), communication (15%), and tenure (10%). A score above 750 unlocks priority matching, expanded load visibility, and faster dispute resolution.",
    content: [
      "Trust is the currency of freight. When a shipper hands over ₹5 lakh worth of goods to a trucker they've never met, they need confidence. When a trucker takes a load on credit to a shipper they don't know, they need the same. That's where the LoadSaathi Digital Freight Credit Score comes in.",
      "The credit score ranges from 300 to 900, modeled on familiar credit bureau scales but tailored specifically for freight behavior. A score above 750 is considered excellent and unlocks priority matching, expanded load visibility, and faster dispute resolution.",
      "Your score is calculated from five factors: Completion Rate (30%) tracks how many trips or shipments you complete vs cancel. Reliability (25%) measures on-time performance and communication responsiveness. Reviews (20%) aggregates your star ratings from both shippers and truckers. Communication (15%) evaluates how quickly you respond to inquiries and messages. Tenure (10%) rewards loyalty and consistent platform participation.",
      "The score updates automatically through database triggers whenever a trip, shipment, review, or request changes status. You can see your full score breakdown on your personal credit score page, complete with a trend chart showing how your score has evolved over time.",
      "AI-generated insights provide personalized recommendations for improving your score. For truckers, this might suggest completing more trips in a specific region. For shippers, it might recommend faster payment processing or more detailed shipment descriptions to attract better matches.",
    ],
  },
  "first-shipment-guide": {
    category: "Shipper Guide",
    title: "The Complete Guide to Posting Your First Shipment",
    date: "May 28, 2026",
    lastUpdated: "July 12, 2026",
    readTime: "7 min read",
    author: "Amit Verma",
    authorBio: "Amit Verma is a supply chain consultant who helps SMEs in East India digitize their freight operations.",
    summary: "Posting a shipment on LoadSaathi takes under 3 minutes. Provide accurate origin/destination, weight, and cargo details for best AI matching. Use the AI Price Predictor for market-aligned rates, review trucker credit scores and reviews before selecting, and communicate through the in-app chat for dispute protection.",
    content: [
      "Posting your first shipment on LoadSaathi is straightforward, but a few key decisions can dramatically improve your matching results. Here's a step-by-step guide to getting it right the first time.",
      "Start with accurate specifications. Your shipment's origin and destination cities, weight in tonnes, goods description, and preferred pickup/delivery dates are the core matching parameters. Be precise — a vague description like 'general cargo' gets fewer matches than 'packaged electronics, palletized, 2 tonnes.' Our AI uses these details to find trucks with the right capacity and route alignment.",
      "Use the AI Price Predictor. When you set your budget per tonne, the platform analyzes historical price data for similar routes, current market conditions, and vehicle availability to recommend a competitive rate. This isn't a fixed price — it's a intelligent suggestion based on real market data. Pricing too low scares off quality truckers; pricing too high eats your margins. The sweet spot is usually within 5-8% of the AI prediction.",
      "Review trucker profiles carefully. Each trucker who bids on your shipment has a credit score, trip history, and reviews from other shippers. Don't just pick the lowest price — pick the best value. A trucker with a 780 credit score and 50+ completed trips at ₹2,200/tonne is often a better choice than an unknown trucker at ₹1,800/tonne.",
      "Communicate clearly through the platform. Use the chat feature to confirm pickup times, loading requirements, and any special instructions. All communication is recorded on-platform, which helps with dispute resolution if issues arise. Once the shipment is delivered and you're satisfied, leave an honest review — it helps the next shipper make an informed decision.",
    ],
  },
  "digital-load-boards-india": {
    category: "Industry Insights",
    title: "Why Indian Truckers Are Switching to Digital Load Boards",
    date: "May 20, 2026",
    lastUpdated: "June 30, 2026",
    readTime: "5 min read",
    author: "LoadSaathi Team",
    authorBio: "The LoadSaathi engineering and product team builds AI-powered logistics tools for India's freight industry.",
    summary: "Digital load boards eliminate broker dependency by creating direct shipper-trucker marketplaces. In a LoadSaathi survey, 78% of truckers reported higher per-trip earnings after switching to digital matching, with an average increase of ₹4,500-6,000 per trip. Digital platforms also offer real-time tracking, faster payments, and portable reputation systems.",
    content: [
      "For decades, Indian truckers relied on brokers and transport agents to find loads. The broker model worked — but it came at a cost. Brokers typically take 10-15% commission per load, and the lack of transparency often means truckers never know the true market rate for their route.",
      "Digital load boards like LoadSaathi are changing this by creating a direct shipper-trucker marketplace. Truckers see exactly what shippers are offering, compare rates across multiple loads, and choose the trips that maximize their earnings. No middleman, no hidden margins.",
      "The shift has been dramatic. In a survey of LoadSaathi's trucker network, 78% reported higher per-trip earnings after switching from broker-dependent operations to digital matching. The average increase was ₹4,500-6,000 per trip — money that goes directly to the trucker's bottom line.",
      "Beyond earnings, digital platforms offer transparency that brokers never provided. Real-time tracking means truckers can share their location with shippers, building trust and reducing the constant 'kahan pahuncha?' calls. Digital payment integration means faster settlement without the traditional 30-45 day payment cycles. And the review system means a trucker's reputation follows them — a good track record on LoadSaathi becomes a portable asset.",
      "The technology barrier is also falling fast. With Hindi-language support in development, voice-based search options, and simple SMS-based notifications for basic-feature phones, digital load boarding is becoming accessible to truckers across India — not just the tech-savvy minority.",
    ],
  },
  "real-time-tracking-launch": {
    category: "Product Updates",
    title: "LoadSaathi Launches Real-Time GPS Tracking",
    date: "May 12, 2026",
    lastUpdated: "June 20, 2026",
    readTime: "3 min read",
    author: "Vikram Singh",
    authorBio: "Vikram Singh is the CTO at LoadSaathi, overseeing platform architecture and mapping infrastructure.",
    summary: "LoadSaathi's real-time GPS tracking shares live trucker location with shippers via interactive maps, providing ETAs, route visualization, and geofence alerts. The feature doubles as proof-of-delivery, feeding into the credit score system. Built on Leaflet and OSRM, location data stays within the platform for privacy.",
    content: [
      "One of the most requested features from both shippers and truckers is now live: real-time GPS tracking for all active shipments and trips on the LoadSaathi platform.",
      "When a trucker marks a trip as 'in transit,' their GPS location is shared with the shipper through an interactive map interface. Shippers can see exactly where their goods are, estimated arrival times based on current traffic conditions, and receive automatic notifications when the truck approaches the delivery location.",
      "For truckers, the tracking feature doubles as a proof-of-delivery system. Route history is automatically recorded, creating an auditable trail that can resolve disputes about delivery times and routes. This data also feeds into the credit score system — on-time deliveries with accurate tracking data boost your reliability score.",
      "The tracking is built on Leaflet maps integrated with OSRM for route calculation, the same open-source stack that powers the rest of the platform's mapping features. We chose this approach for reliability and data privacy — your location data stays within the platform and isn't sold to third parties.",
    ],
  },
  "ai-price-prediction": {
    category: "Product Updates",
    title: "How Our AI Price Predictions Work",
    date: "May 5, 2026",
    lastUpdated: "July 1, 2026",
    readTime: "6 min read",
    author: "Priya Sharma",
    authorBio: "Priya Sharma is the Product Lead at LoadSaathi, specializing in trust and reputation systems for marketplace platforms.",
    summary: "LoadSaathi's AI Price Predictor uses a multi-provider chain (Gemini, Groq, OpenRouter, local algorithms) to recommend fair freight rates. Each prediction includes price per tonne, confidence range, market trend, and reasoning. The system learns from every transaction, converging to within 8% of actual accepted rates after 100 transactions per route.",
    content: [
      "Pricing freight is one of the hardest problems in logistics. Too high, and your load sits. Too low, and you leave money on the table or attract unreliable carriers. LoadSaathi's AI Price Predictor solves this by analyzing multiple data sources to recommend fair, market-aligned rates.",
      "The prediction system uses a multi-provider AI chain for resilience. First, it queries Google's Gemini 2.0 Flash Lite model with the route details, weight, vehicle type, and historical pricing context. If Gemini is unavailable (API limits or downtime), it falls back to Groq's Llama 3.3 70B model, then to OpenRouter's free tier models, and finally to a local algorithmic calculation based on historical averages.",
      "Each prediction includes a recommended price per tonne, a confidence range (low-medium-high), a market trend indicator (rising/stable/falling), and a brief reasoning statement explaining why that price was suggested. All of this appears in a small card next to the price input when posting a trip or shipment.",
      "The system learns from every transaction. When a trip or shipment is completed at a certain price, that data point feeds back into the price_history table. Over time, the model becomes more accurate for specific routes, vehicle types, and weight ranges. Early data shows predictions converging to within 8% of actual accepted rates after just 100 transactions per route.",
      "The confidence level is key. 'High confidence' means we have extensive historical data for that route and the AI models are in strong agreement. 'Low confidence' means the route is unusual or data is sparse — in those cases, the prediction serves as a starting point that should be validated against market knowledge.",
    ],
  },
  "broker-to-direct-shipper": {
    category: "Case Study",
    title: "From Broker-Dependent to Direct: One Shipper's Journey",
    date: "April 28, 2026",
    lastUpdated: "June 15, 2026",
    readTime: "8 min read",
    author: "Amit Verma",
    authorBio: "Amit Verma is a supply chain consultant who helps SMEs in East India digitize their freight operations.",
    summary: "Sharma Fabrics in Delhi reduced logistics costs by 28% (₹4.2 lakh/month savings) after switching from brokers to LoadSaathi. On-time delivery improved from 62% to 94%, and freight arrangement time dropped from 8 hours/week to under 1 hour. Annual savings exceeded ₹50 lakh, funded through direct AI-matched shipping.",
    content: [
      "When Sharma Fabrics in Delhi needed to move 15 tonnes of textile rolls to Bengaluru every week, their process was painfully familiar: call three brokers, get quotes, negotiate, pick the cheapest, and pray the trucker showed up. 'We had no idea where our goods were once they left the factory,' says owner Rahul Sharma. 'The brokers controlled everything — pricing, timing, even which truckers we could work with.'",
      "Sharma Fabrics decided to try LoadSaathi after a particularly painful incident where a broker-substituted truck arrived 12 hours late, charged ₹3,000 extra for 'loading fees,' and the goods arrived in Bengaluru with water damage. The broker disclaimed all responsibility.",
      "The transition was not instant. Sharma started by posting one shipment per week on LoadSaathi while maintaining broker relationships for the rest. The first match — a trucker with a 740 credit score and 30 completed runs on the Delhi-Bengaluru route — arrived on time, handled the loading professionally, and delivered within 24 hours at ₹200/tonne less than the broker quote.",
      "Within three months, Sharma shifted 100% of his freight to the platform. The results: logistics costs dropped 28% (saving approximately ₹4.2 lakh per month), on-time delivery improved from 62% to 94%, and the time spent arranging freight dropped from 8 hours per week to under 1 hour. 'I just post my load, review the AI matches, pick the best trucker, and track everything from my phone. It's a completely different business now.'",
      "Sharma's story is common among shippers who make the switch. The direct matching model eliminates broker margins (10-15%), the AI price prediction prevents overpaying, and the review system means truckers are accountable for their service quality. For Sharma Fabrics, the annual savings of over ₹50 lakh have gone directly into expanding their production capacity.",
    ],
  },
};

function parseDate(dateStr: string): string {
  const months: Record<string, string> = {
    January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
    July: "07", August: "08", September: "09", October: "10", November: "11", December: "12",
  };
  const parts = dateStr.split(" ");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${months[parts[0]] || "01"}-${parts[1].replace(",", "").padStart(2, "0")}`;
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#050816] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-4xl font-black text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or may have been removed.</p>
          <Link to="/blog">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const isoDate = parseDate(article.date);
  const isoLastUpdated = article.lastUpdated ? parseDate(article.lastUpdated) : isoDate;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary.substring(0, 160),
    author: {
      "@type": "Person",
      name: article.author,
      description: article.authorBio,
    },
    datePublished: isoDate,
    dateModified: isoLastUpdated,
    publisher: {
      "@type": "Organization",
      name: "LoadSaathi",
      url: "https://loadsaathi.in",
      logo: {
        "@type": "ImageObject",
        url: "https://loadsaathi.in/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://loadsaathi.in/blog/${slug}`,
    },
    articleSection: article.category,
    wordCount: article.content.join(" ").split(/\s+/).length,
  };

  return (
    <>
    <SeoMeta
      title={article.title}
      description={article.summary.substring(0, 160)}
      canonical={`/blog/${slug}`}
      type="article"
      publishedTime={isoDate}
      author={article.author}
      jsonLd={articleSchema}
      breadcrumbs={[
        { name: "Blog", url: "/blog" },
        { name: article.title, url: `/blog/${slug}` },
      ]}
    />
    <div className="min-h-screen bg-background dark:bg-[#050816]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f97316 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="max-w-[800px] mx-auto px-6 sm:px-12 py-16 relative z-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <div className="mb-6">
            <span className="text-xs font-semibold px-2 py-1 rounded-full border bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30">
              {article.category}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6 text-foreground dark:text-white">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {article.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {article.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {article.readTime}</span>
            {article.lastUpdated && (
              <span className="flex items-center gap-1.5 text-orange-500 dark:text-orange-400">
                <BookOpen className="h-4 w-4" /> Last updated: {article.lastUpdated}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 sm:px-12 pb-24">
        {/* AI-Extractable Answer Block */}
        <div className="glass-card p-6 rounded-xl border border-orange-500/20 dark:border-orange-500/10 mb-10">
          <p className="text-sm sm:text-base text-foreground leading-relaxed font-medium">
            {article.summary}
          </p>
        </div>

        <div className="h-64 sm:h-80 rounded-xl bg-gradient-to-br from-orange-500/10 via-blue-500/5 to-transparent dark:from-orange-900/20 dark:via-blue-900/10 mb-12 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="text-8xl opacity-20">📦</div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {article.content.map((paragraph, i) => (
            <p key={i} className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Author Bio */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="glass-card p-6 rounded-xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">About the Author</p>
              <p className="font-bold text-foreground">{article.author}</p>
              <p className="text-sm text-muted-foreground mt-1">{article.authorBio}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="glass-card p-6 sm:p-8 rounded-xl text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Enjoyed this article?</h3>
            <p className="text-sm text-muted-foreground mb-6">Share it with your network and help spread the word about smarter freight.</p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleShare} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Share2 className="mr-2 h-4 w-4" /> Share Article
              </Button>
              <Link to="/blog">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> More Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
