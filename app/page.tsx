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

export default function Home() {
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
      <Projects />
      <Process />
      <WhyUs />
      <Testimonials />
      <Contact />
      <FinalCTA />
      <Footer />
    </main>
  );
}
