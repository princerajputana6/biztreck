import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import WebMCP from "@/components/WebMCP";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Biztreck Solutions — Build, Revamp, Rank, Scale",
    template: "%s · Biztreck Solutions",
  },
  description:
    "Biztreck Solutions builds high-performance websites and apps, revamps existing platforms, delivers DevOps, boosts SEO rankings and helps startups launch from zero to one — from Greater Noida, Delhi NCR.",
  applicationName: SITE.name,
  authors: [{ name: "Biztreck Solutions", url: SITE.url }],
  generator: "Next.js",
  keywords: [
    "website development",
    "website revamp",
    "app development india",
    "react native development",
    "next.js agency",
    "devops services",
    "kubernetes consulting",
    "seo agency india",
    "technical seo",
    "startup launch",
    "MVP development",
    "biztreck",
    "biztreck solutions",
    "Greater Noida web development",
    "Delhi NCR software agency",
  ],
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_IN",
    url: SITE.url,
    title: "Biztreck Solutions — Build, Revamp, Rank, Scale",
    description:
      "We design, build, deploy and scale digital products for modern businesses.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Biztreck Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitterHandle,
    creator: SITE.twitterHandle,
    title: "Biztreck Solutions",
    description: "Build · Revamp · Rank · Scale",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/logo.png`,
  image: `${SITE.url}/logo.png`,
  email: SITE.email,
  telephone: SITE.phoneRaw,
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Greater Noida",
    addressLocality: "Greater Noida",
    addressRegion: "Delhi NCR",
    postalCode: SITE.pin,
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 28.4744,
    longitude: 77.504,
  },
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "AdministrativeArea", name: "Delhi NCR" },
    "Worldwide (remote)",
  ],
  knowsAbout: [
    "Website development",
    "Mobile app development",
    "Custom software development",
    "IT services",
    "DevOps and cloud infrastructure",
    "Search engine optimization",
    "Startup MVP development",
  ],
  sameAs: Object.values(SITE.socials),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Software & IT services",
    itemListElement: SERVICES.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.name,
        serviceType: s.serviceType,
        url: `${SITE.url}/services/${s.slug}`,
      },
    })),
  },
  description:
    "Biztreck Solutions builds high-performance websites and apps, revamps platforms, delivers DevOps, boosts SEO and helps startups launch.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE.url}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-navy-950 text-slate-100 antialiased">
        {children}
        <WebMCP />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
