import type { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";

export const metadata: Metadata = {
  title: "Company Portfolio 2025 — Biztreck Solutions",
  description:
    "Biztreck Solutions portfolio — 120+ projects shipped, 9 live in-house products, and a senior team delivering web, mobile, DevOps, and SEO for founders worldwide.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    type: "website",
    title: "Biztreck Solutions · Company Portfolio 2025",
    description:
      "Senior product studio from Greater Noida — designing, engineering, and scaling digital products for startups and growth teams worldwide.",
  },
};

export default function PortfolioPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />
      <PortfolioClient />
      <Footer />
    </main>
  );
}
