import { Helmet } from 'react-helmet-async';

const defaultSiteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

const toAbsolute = (path) => {
  try {
    return new URL(path, defaultSiteUrl).toString();
  } catch (e) {
    return defaultSiteUrl;
  }
};

const SEO = ({
  title = 'Saint Seiya EX Companion',
  description = 'Build optimized teams, browse character stats, and stay updated with the latest Saint Seiya EX news.',
  path = '/',
  image = '/logo.png',
  type = 'website',
  structuredData
}) => {
  const canonical = toAbsolute(path);
  const imageUrl = toAbsolute(image);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
