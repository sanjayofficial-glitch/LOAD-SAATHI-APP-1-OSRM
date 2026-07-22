import { Helmet } from "react-helmet-async";

interface SeoMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  author?: string;
  jsonLd?: Record<string, unknown>;
}

const BASE_URL = "https://loadsaathi.in";
const DEFAULT_IMAGE = "https://loadsaathi.in/logo.png";

export default function SeoMeta({
  title,
  description,
  keywords,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  publishedTime,
  author,
  jsonLd,
}: SeoMetaProps) {
  const fullTitle = `${title} | LoadSaathi`;
  const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="LoadSaathi" />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta name="author" content={author} />}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
