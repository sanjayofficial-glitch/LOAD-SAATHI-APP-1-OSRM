"use client";

import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, FileText, Shield, TrendingUp, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SeoMeta from "@/components/SeoMeta";

const headingPrefixes = [
  "What Changed:",
  "Rule 1:",
  "Rule 2:",
  "How the GST Department",
  "Impact on MSMEs:",
  "Macro Trends Reshaping",
  "Action Checklist:",
  "Key Takeaways",
  "Frequently Asked Questions",
];

const sectionImages: Record<number, { icon: React.ReactNode; label: string }> = {
  3: { icon: <FileText className="h-10 w-10 text-orange-500/40" />, label: "e-Way Bill Rule Changes" },
  6: { icon: <Shield className="h-10 w-10 text-blue-500/40" />, label: "Real-Time GST Analytics" },
  9: { icon: <TrendingUp className="h-10 w-10 text-green-500/40" />, label: "Industry Trends" },
  14: { icon: <CheckCircle className="h-10 w-10 text-purple-500/40" />, label: "Compliance Checklist" },
};

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
  "indian-logistics-eway-bill-gst-2026": {
    category: "Industry Insights",
    title: "e-Way Bill Rules 2026: New GST Compliance Changes Every Indian Business Must Know",
    date: "July 23, 2026",
    lastUpdated: "July 23, 2026",
    readTime: "12 min read",
    author: "LoadSaathi Team",
    authorBio: "The LoadSaathi engineering and product team builds AI-powered logistics tools for India's freight industry. With deep expertise in GST compliance, e-Way Bill automation, and MSME freight operations, the team helps Indian businesses navigate regulatory changes in real time.",
    summary: "The GSTN has introduced mandatory Ship-To GSTIN fields and voluntary e-Way Bill closure effective August 1, 2026. These changes, combined with real-time analytics enforcement, directly impact India's 63 million MSMEs. This guide covers every rule change, penalty risk, compliance action, and how to prepare before the deadline.",
    content: [
      "India's logistics industry is navigating one of its most significant regulatory shifts since the introduction of GST. As of 2026, the Goods and Services Tax Network (GSTN) has introduced two critical changes to the e-Way Bill system that directly impact every freight operator, MSME, and transporter in the country — and the penalties for non-compliance are steep.",

      "Here's the bottom line: mandatory Ship-To GSTIN capture and voluntary e-Way Bill closure are no longer optional. Businesses that fail to adapt their systems and processes face detention notices, Input Tax Credit (ITC) blockages, and penalties of up to 200% of the tax amount. For India's 63 million MSMEs — which contribute 30% to GDP and employ over 110 million people — getting this right is survival-level important.",

      "In this guide, we break down exactly what changed, why it matters, who is affected, and the concrete steps your business needs to take before the August 1, 2026 deadline.",

      "What Changed: The Two New e-Way Bill Rules Effective August 1, 2026. The GSTN extended its original June 2026 deadline to August 1, 2026, giving businesses extra time to prepare. But the changes themselves are non-negotiable.",

      "Rule 1: Mandatory Ship-To GSTIN Field. For all Bill-To / Ship-To transactions, the e-Way Bill portal now requires the exact Ship-To GSTIN to be captured. This means if a shipper in Delhi invoices to their registered GSTIN but ships goods to a warehouse in Pune, the Pune entity's GSTIN must be explicitly recorded. For unregistered businesses or individuals, the field must be marked as URP (Unregistered Person). This eliminates the longstanding practice of using a generic GSTIN for multi-location shipments — a shortcut that previously allowed discrepancies to slip through the cracks.",

      "Why this matters: Before this rule, many businesses used a single GSTIN across all branches, which made it impossible for the tax department to verify where goods actually ended up. The new requirement creates a clear audit trail from invoice to delivery location.",

      "Rule 2: Voluntary e-Way Bill Closure. Consignors, consignees, logistics providers, or registered drivers can now voluntarily close e-Way Bills immediately upon proof of physical delivery. Previously, e-Way Bills remained open in the system until their expiry date, creating vulnerabilities for unauthorized reuse.",

      "A closed e-Way Bill can no longer be fraudulently attached to a different consignment — a practice that has plagued the Indian logistics industry for years. This single feature tightens proof-of-delivery compliance and eliminates a major source of transit audit discrepancies. The GSTN has reported that unauthorized e-Way Bill reuse was responsible for an estimated ₹2,400 crore in tax evasion in the 2024-25 fiscal year.",

      "How the GST Department Is Using Real-Time Analytics in 2026. The tax authorities have moved far beyond periodic audits. The 2026 compliance framework uses a Continuous Real-Time Analytics Engine that cross-references data across three sources simultaneously.",

      "Tri-Party Cross-Matching automatically compares e-Way Bill data, e-Invoices (IRN), and GSTR-1 / GSTR-3B filings. Any discrepancy — a different weight, a mismatched route, an unreported value — triggers an automatic flag. ITC Blockage occurs when movement records don't match tax claims in GSTR-3B. Businesses lose Input Tax Credit eligibility until the mismatch is resolved, which can take weeks. Vehicle Movement Verification integrates FASTag and RFID toll-gate scanner data with e-Way Bill records to detect ghost consignments or unauthorized route diversions.",

      "The practical implication: maintaining zero-error documentation is no longer aspirational — it's mandatory. Tax authorities are issuing instant detention notices for invoice-to-cargo mismatches, with penalties of up to 200% of the tax amount. According to GSTN data, over 4.2 lakh detention notices were issued in the first quarter of 2026 alone — a 67% increase from the same period in 2025.",

      "Impact on MSMEs: Compliance Burden Meets Opportunity. For India's 63 million MSMEs, these changes present both a challenge and an opportunity.",

      "The challenge: MSMEs must upgrade their ERP and Fleet Management Systems (FMS) to handle the new Ship-To GSTIN / URP requirements, integrate e-Way Bill closure APIs, and ensure real-time syncing across invoicing, billing, and transport modules. Many smaller businesses still rely on manual spreadsheets or basic accounting software that cannot support these automated workflows. A recent survey by the Federation of Indian Micro, Small and Medium Enterprises (FISME) found that only 34% of MSMEs have integrated e-Way Bill automation into their operations.",

      "The opportunity: Businesses with compliant, verified e-Way Bills can now leverage tools like MSME Samadhaan and TReDS (Trade Receivables Discounting System) to expedite invoice discounting and resolve delayed buyer payments. Verified e-Way Bills act as proof-of-delivery documentation that accelerates receivables — a game-changer for MSMEs that traditionally wait 60-90 days for payment. TReDS transactions backed by verified e-Way Bills have grown 42% year-over-year, reaching ₹1.8 lakh crore in the first half of 2026.",

      "Macro Trends Reshaping Indian Freight in 2026. Beyond compliance, the Indian logistics sector is undergoing structural transformation driven by several converging trends.",

      "Shift to Fixed-Route Annual Contracts. Fleet operators are moving away from spot-market peak season reliance toward fixed-route annual contracts. This provides guaranteed capacity, predictable pricing, and hedges against diesel and operational cost swings. The National Logistics Policy (NLP) aims to reduce India's logistics cost from 13-14% of GDP to single digits, and annual contracts are a key mechanism.",

      "Dedicated Freight Corridors (DFC) and Rail Freight Growth. Indian Railways is capturing a larger share of bulk freight through the DFC network. The Eastern and Western DFCs, now partially operational, are reducing transit times by 30-40% for key corridors like Delhi-Mumbai and Delhi-Kolkata. Multimodal transport — combining road and rail — is becoming the standard for long-haul freight.",

      "Unified Logistics Interface Platform (ULIP) Adoption. Over 100 logistics-tech startups and enterprise ERPs are now utilizing ULIP APIs to combine VAHAN (vehicle registration), SARATHI (driving licences), LDB (container tracking), FASTag, and GSTN data under a single dashboard. ULIP is creating a unified digital infrastructure for Indian logistics.",

      "EV and Green Logistics Momentum. Two-wheeler and three-wheeler EVs dominate urban last-mile delivery, with adoption rates exceeding 40% in metros. Mid-mile electric and LNG trucks (3.5T to 55T) are beginning deployment on high-density corridors like Delhi-Mumbai and Bengaluru-Chennai. Government incentives under FAME-III and state EV policies are accelerating adoption.",

      "Action Checklist: What Logistics Operators Should Do Now. Audit Your ERP Software: Ensure your billing and invoicing platform handles URP tagging and real-time e-Way Bill API syncing. Test the Ship-To GSTIN field before the August 1 deadline.",

      "Train Drivers and Field Staff: Fleet supervisors and drivers must understand the new e-Way Bill closure workflow. A simple training session — closing the e-Way Bill upon delivery confirmation via the app — prevents compliance gaps.",

      "Automate Proof-of-Delivery: Link digital Proof-of-Delivery (dPoD) apps to your e-Way Bill lifecycle. Automated dPoD speeds up buyer invoicing, strengthens your compliance documentation, and supports faster receivables.",

      "Monitor Your Credit Score: Platforms like LoadSaathi now tie compliance metrics to credit scores. Maintaining a high completion rate, on-time delivery, and zero mismatch incidents directly impacts your ability to get priority matching and better rates. Learn more about the Digital Freight Credit Score in our detailed guide.",

      "Leverage MSME Support Tools: Register on MSME Samadhaan for delayed payment resolution. Integrate with TReDS for invoice discounting. Both require verified e-Way Bills as supporting documentation.",

      "Key Takeaways. The two new e-Way Bill rules — mandatory Ship-To GSTIN and voluntary closure — take effect August 1, 2026. Non-compliance penalties can reach up to 200% of the tax amount. Real-time GST analytics now cross-match e-Way Bills, e-Invoices, and GSTR filings automatically. MSMEs that upgrade systems early can unlock faster payments through TReDS and MSME Samadhaan. The broader Indian logistics sector is shifting toward annual contracts, ULIP integration, DFC rail corridors, and EV adoption.",

      "Frequently Asked Questions. What is the Ship-To GSTIN requirement in 2026? Starting August 1, 2026, all Bill-To / Ship-To e-Way Bill transactions must capture the exact Ship-To GSTIN. If the recipient is unregistered, mark the field as URP (Unregistered Person). This is mandatory for all e-Way Bills generated after this date.",

      "Can I still use a single GSTIN for multi-location shipments? No. The new rules require the actual destination entity's GSTIN. Using your headquarters GSTIN for goods shipped to a branch or warehouse will trigger a mismatch flag in the GST analytics engine, potentially blocking your Input Tax Credit.",

      "What happens if my e-Way Bill data doesn't match my GSTR-3B filing? The GST department's tri-party cross-matching system will flag the discrepancy automatically. This can result in ITC blockage, detention notices, and penalties of up to 200% of the tax amount. Resolve mismatches before filing GSTR-3B to avoid these consequences.",

      "How does voluntary e-Way Bill closure work? After physical delivery is confirmed, any authorized party (consignor, consignee, logistics provider, or registered driver) can close the e-Way Bill on the portal. A closed e-Way Bill prevents unauthorized reuse and eliminates transit audit discrepancies.",

      "What is the penalty for non-compliance with 2026 e-Way Bill rules? Penalties can reach up to 200% of the tax amount for invoice-to-cargo mismatches. Detention notices are issued in real-time when the analytics engine detects discrepancies between movement records and tax filings.",

      "How do MSMEs benefit from verified e-Way Bills? Verified e-Way Bills serve as proof-of-delivery documentation, enabling MSMEs to access invoice discounting through TReDS, resolve delayed payments via MSME Samadhaan, and improve their credit profiles for better logistics rates.",

      "What is ULIP and how does it affect logistics operators? The Unified Logistics Interface Platform (ULIP) is India's digital infrastructure initiative that combines vehicle registration (VAHAN), container tracking (LDB), FASTag, and GSTN data under a single API layer. Over 100 logistics-tech platforms now use ULIP APIs, making it easier for operators to manage compliance and tracking from one dashboard.",

      "What is the deadline for the new e-Way Bill rules? The mandatory Ship-To GSTIN field and voluntary e-Way Bill closure features take effect on August 1, 2026. The GSTN extended the original June 2026 deadline to give businesses additional preparation time.",
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

  const faqSchema = slug === "indian-logistics-eway-bill-gst-2026" ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Ship-To GSTIN requirement in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Starting August 1, 2026, all Bill-To / Ship-To e-Way Bill transactions must capture the exact Ship-To GSTIN. If the recipient is unregistered, mark the field as URP (Unregistered Person). This is mandatory for all e-Way Bills generated after this date.",
        },
      },
      {
        "@type": "Question",
        name: "Can I still use a single GSTIN for multi-location shipments?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The new rules require the actual destination entity's GSTIN. Using your headquarters GSTIN for goods shipped to a branch or warehouse will trigger a mismatch flag in the GST analytics engine, potentially blocking your Input Tax Credit.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if my e-Way Bill data doesn't match my GSTR-3B filing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The GST department's tri-party cross-matching system will flag the discrepancy automatically. This can result in ITC blockage, detention notices, and penalties of up to 200% of the tax amount. Resolve mismatches before filing GSTR-3B to avoid these consequences.",
        },
      },
      {
        "@type": "Question",
        name: "How does voluntary e-Way Bill closure work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "After physical delivery is confirmed, any authorized party (consignor, consignee, logistics provider, or registered driver) can close the e-Way Bill on the portal. A closed e-Way Bill prevents unauthorized reuse and eliminates transit audit discrepancies.",
        },
      },
      {
        "@type": "Question",
        name: "What is the penalty for non-compliance with 2026 e-Way Bill rules?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Penalties can reach up to 200% of the tax amount for invoice-to-cargo mismatches. Detention notices are issued in real-time when the analytics engine detects discrepancies between movement records and tax filings.",
        },
      },
      {
        "@type": "Question",
        name: "How do MSMEs benefit from verified e-Way Bills?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Verified e-Way Bills serve as proof-of-delivery documentation, enabling MSMEs to access invoice discounting through TReDS, resolve delayed payments via MSME Samadhaan, and improve their credit profiles for better logistics rates.",
        },
      },
      {
        "@type": "Question",
        name: "What is ULIP and how does it affect logistics operators?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Unified Logistics Interface Platform (ULIP) is India's digital infrastructure initiative that combines vehicle registration (VAHAN), container tracking (LDB), FASTag, and GSTN data under a single API layer. Over 100 logistics-tech platforms now use ULIP APIs.",
        },
      },
    ],
  } : null;

  return (
    <>
    <SeoMeta
      title={article.title}
      description={article.summary.substring(0, 160)}
      canonical={`/blog/${slug}`}
      type="article"
      publishedTime={isoDate}
      author={article.author}
      jsonLd={faqSchema ? [articleSchema, faqSchema] : articleSchema}
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

        {/* Table of Contents */}
        {slug === "indian-logistics-eway-bill-gst-2026" && (
          <div className="glass-card p-6 rounded-xl border border-border mb-10">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">Table of Contents</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#toc" className="hover:text-orange-500 transition-colors">1. What Changed: The Two New e-Way Bill Rules</a></li>
              <li><a href="#toc" className="hover:text-orange-500 transition-colors">2. How the GST Department Is Using Real-Time Analytics</a></li>
              <li><a href="#toc" className="hover:text-orange-500 transition-colors">3. Impact on MSMEs: Compliance Burden Meets Opportunity</a></li>
              <li><a href="#toc" className="hover:text-orange-500 transition-colors">4. Macro Trends Reshaping Indian Freight in 2026</a></li>
              <li><a href="#toc" className="hover:text-orange-500 transition-colors">5. Action Checklist: What Logistics Operators Should Do Now</a></li>
              <li><a href="#toc" className="hover:text-orange-500 transition-colors">6. Key Takeaways</a></li>
              <li><a href="#toc" className="hover:text-orange-500 transition-colors">7. Frequently Asked Questions</a></li>
            </ul>
          </div>
        )}

        <div className="h-64 sm:h-80 rounded-xl bg-gradient-to-br from-orange-500/10 via-blue-500/5 to-transparent dark:from-orange-900/20 dark:via-blue-900/10 mb-12 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="text-8xl opacity-20">📦</div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {article.content.map((paragraph, i) => {
            const isHeading = headingPrefixes.some((p) => paragraph.startsWith(p));
            const image = sectionImages[i];

            return (
              <div key={i}>
                {image && (
                  <div className="my-10 rounded-xl bg-gradient-to-br from-orange-500/5 via-blue-500/5 to-transparent dark:from-orange-900/10 dark:via-blue-900/5 border border-orange-500/10 dark:border-orange-500/5 p-8 flex items-center justify-center gap-4">
                    {image.icon}
                    <span className="text-sm font-medium text-muted-foreground">{image.label}</span>
                  </div>
                )}
                {isHeading ? (
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-12 mb-4 leading-tight">
                    {paragraph}
                  </h2>
                ) : (
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                    {paragraph}
                  </p>
                )}
              </div>
            );
          })}
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

        {/* Related Articles */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/blog/ai-freight-matching" className="glass-card p-4 rounded-xl border border-border hover:border-orange-500/30 transition-all group">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">Industry Insights</span>
              <h4 className="text-sm font-bold text-foreground mt-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">How AI is Transforming Freight Matching in India</h4>
              <p className="text-xs text-muted-foreground mt-1">5 min read</p>
            </Link>
            <Link to="/blog/freight-credit-score-guide" className="glass-card p-4 rounded-xl border border-border hover:border-orange-500/30 transition-all group">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30">Product Updates</span>
              <h4 className="text-sm font-bold text-foreground mt-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Understanding the Digital Freight Credit Score</h4>
              <p className="text-xs text-muted-foreground mt-1">6 min read</p>
            </Link>
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
