import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us — Senior product studio in Greater Noida",
  description:
    "Meet the Biztreck Solutions team — senior engineers, designers, growth and DevOps specialists building, revamping, ranking and scaling digital products from Greater Noida, Delhi NCR.",
  keywords: [
    "about biztreck",
    "biztreck team",
    "software agency Greater Noida",
    "product studio Delhi NCR",
    "Indian dev agency",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About Biztreck Solutions",
    description:
      "Senior product studio building digital products that move businesses forward.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Biztreck Solutions",
    description: "Senior product studio building, revamping, ranking and scaling digital products.",
  },
};

export default function Page() {
  return <AboutClient />;
}
