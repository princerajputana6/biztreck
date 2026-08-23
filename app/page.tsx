import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import Problems from "@/components/Problems";
import Solutions from "@/components/Solutions";
import IndustriesGrid from "@/components/IndustriesGrid";
import Stats from "@/components/Stats";
import Process from "@/components/Process";
import Projects from "@/components/Projects";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { getShowcaseProjects } from "@/lib/showcase";

// Companies come from the admin `clients` collection. Regenerate periodically so
// clients added in admin appear on the site without a redeploy.
export const revalidate = 300;

export default async function Home() {
  const projects = await getShowcaseProjects();
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />
      <Hero />
      <TrustStrip />
      <Problems />
      <Solutions />
      <IndustriesGrid />
      <Stats />
      <Projects projects={projects} />
      <Process />
      <WhyUs />
      <Testimonials />
      <Contact />
      <FinalCTA />
      <Footer />
    </main>
  );
}
