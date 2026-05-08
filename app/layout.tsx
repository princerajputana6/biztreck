import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
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
  title: "Biztreck Solutions — Build, Revamp, Rank, Scale",
  description:
    "Biztreck Solutions builds high-performance websites and apps, revamps existing platforms, delivers DevOps, boosts SEO rankings and helps startups launch from zero.",
  keywords: [
    "website development",
    "website revamp",
    "app development",
    "devops services",
    "seo ranking",
    "startup launch",
    "biztreck",
    "biztreck solutions",
  ],
  openGraph: {
    title: "Biztreck Solutions",
    description:
      "We design, build, deploy and scale digital products for modern businesses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-navy-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
