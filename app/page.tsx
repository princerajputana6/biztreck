import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Process from "@/components/Process";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />
      <Hero />
      <Services />
      <Stats />
      <Process />
      <WhyUs />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
