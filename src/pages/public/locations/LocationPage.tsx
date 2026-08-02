import { useParams, Link } from "react-router-dom";
import { MapPin, ArrowRight, Truck, Clock } from "lucide-react";
import SeoMeta from "@/components/SeoMeta";
import { routes } from "@/data/routes";

const cityData: Record<string, {
  name: string;
  state: string;
  description: string;
  industries: string[];
  heroGradient: string;
}> = {
  rourkela: {
    name: "Rourkela",
    state: "Odisha",
    description: "Rourkela is a major industrial hub in western Odisha, anchored by the Rourkela Steel Plant. It serves as a key transit point for steel, cement, and forest products moving across East India.",
    industries: ["Steel & Metals", "Cement", "Forest Products", "Engineering Goods"],
    heroGradient: "from-orange-600 to-red-600",
  },
  ranchi: {
    name: "Ranchi",
    state: "Jharkhand",
    description: "Ranchi, the capital of Jharkhand, is a growing logistics hub at the crossroads of multiple state highways. It handles coal, heavy machinery, and consumer goods distribution.",
    industries: ["Coal & Mining", "Heavy Machinery", "Consumer Goods", "Agriculture"],
    heroGradient: "from-blue-600 to-indigo-600",
  },
  kolkata: {
    name: "Kolkata",
    state: "West Bengal",
    description: "Kolkata is the commercial capital of East India and a major port city. It serves as the primary distribution hub for goods moving between East India and the rest of the country.",
    industries: ["Jute & Textiles", "Steel Trading", "Electronics", "FMCG Distribution"],
    heroGradient: "from-emerald-600 to-teal-600",
  },
  bhubaneswar: {
    name: "Bhubaneswar",
    state: "Odisha",
    description: "Bhubaneswar, the capital of Odisha, is a rapidly growing IT and industrial hub. It connects coastal Odisha with inland markets and serves as a gateway to Paradip and Gopalpur ports.",
    industries: ["IT & Technology", "Ports & Logistics", "Food Processing", "Textiles"],
    heroGradient: "from-violet-600 to-purple-600",
  },
  jamshedpur: {
    name: "Jamshedpur",
    state: "Jharkhand",
    description: "Jamshedpur is India's first planned industrial city, home to Tata Steel. It is a critical node in the East India freight network for steel, automotive, and manufactured goods.",
    industries: ["Steel Manufacturing", "Automotive Parts", "Heavy Engineering", "Cement"],
    heroGradient: "from-amber-600 to-orange-600",
  },
};

export default function LocationPage() {
  const { city } = useParams<{ city: string }>();
  const data = city ? cityData[city] : null;

  if (!data) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#050816] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-4xl font-black text-foreground mb-4">City Not Found</h1>
          <p className="text-muted-foreground mb-8">We don't have a page for this city yet. Check back soon!</p>
          <Link to="/routes">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold">
              Browse All Routes
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const cityRoutes = routes.filter(
    (r) =>
      r.from.toLowerCase() === data.name.toLowerCase() ||
      r.to.toLowerCase() === data.name.toLowerCase()
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Freight Transport in ${data.name}, ${data.state} — LoadSaathi`,
    description: data.description,
    url: `https://loadsaathi.in/location/${city}`,
    isPartOf: { "@type": "WebSite", name: "LoadSaathi", url: "https://loadsaathi.in" },
    about: {
      "@type": "Place",
      name: data.name,
      address: { "@type": "PostalAddress", addressRegion: data.state, addressCountry: "IN" },
    },
  };

  return (
    <>
      <SeoMeta
        title={`Freight Transport in ${data.name}, ${data.state} — LoadSaathi`}
        description={data.description.substring(0, 160)}
        keywords={`freight ${data.name.toLowerCase()}, truck booking ${data.name.toLowerCase()}, PTL ${data.name.toLowerCase()}, logistics ${data.name.toLowerCase()} ${data.state.toLowerCase()}`}
        canonical={`/location/${city}`}
        jsonLd={schema}
        breadcrumbs={[
          { name: "Routes", url: "/routes" },
          { name: data.name, url: `/location/${city}` },
        ]}
      />
      <div className="min-h-screen bg-background dark:bg-[#050816]">
        {/* Hero */}
        <section className={`bg-gradient-to-br ${data.heroGradient} text-white py-20 px-6`}>
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <MapPin className="h-4 w-4" />
              <span>{data.state}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
              Freight Transport in {data.name}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-[700px] mb-8">
              {data.description}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors"
            >
              Start Shipping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Industries */}
        <section className="py-16 px-6">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">Industries Served in {data.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.industries.map((industry) => (
                <div key={industry} className="glass-card p-4 rounded-xl border border-border text-center">
                  <span className="text-sm font-semibold text-foreground">{industry}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Routes from this city */}
        <section className="py-16 px-6 bg-muted/50 dark:bg-white/[0.02]">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Freight Routes from {data.name}
            </h2>
            <p className="text-muted-foreground mb-8">
              {cityRoutes.length} active corridors connecting {data.name} to major cities across East India.
            </p>
            {cityRoutes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cityRoutes.map((route) => (
                  <Link
                    key={route.slug}
                    to={`/routes/${route.slug}`}
                    className="glass-card p-5 rounded-xl border border-border hover:border-orange-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {route.from} → {route.to}
                      </span>
                      <ArrowRight className="h-4 w-4 text-orange-400 shrink-0" />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" /> {route.distanceKm} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> ~{route.transitTime} hrs
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Routes coming soon. Check back later!</p>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ship from {data.name} with LoadSaathi
            </h2>
            <p className="text-muted-foreground mb-8">
              Join hundreds of shippers and truckers in {data.name} using AI-powered freight matching to save time and money.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                Get Started Free
              </Link>
              <Link to="/routes" className="border border-border hover:border-orange-500/30 text-foreground px-8 py-3 rounded-lg font-semibold transition-colors">
                Browse All Routes
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
