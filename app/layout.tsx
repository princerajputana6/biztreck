import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="bg-navy-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
