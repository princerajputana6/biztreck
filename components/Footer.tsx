"use client";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Facebook,
  ArrowUpRight,
  Send,
} from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import { SITE } from "@/lib/site";

const columns = [
  {
    title: "Services",
    links: [
      { label: "Website Revamp", href: "/#services" },
      { label: "Web Development", href: "/#services" },
      { label: "App Development", href: "/#services" },
      { label: "DevOps Solutions", href: "/#services" },
      { label: "SEO & Ranking", href: "/#services" },
      { label: "Startup Launch (0 → 1)", href: "/#services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Process", href: "/#process" },
      { label: "Why Biztreck", href: "/#why-us" },
      { label: "Blog & Insights", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Legal & Policies",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      { label: "Refund Policy", href: "/legal/refund" },
      { label: "Acceptable Use", href: "/legal/aup" },
      { label: "GDPR Compliance", href: "/legal/gdpr" },
      { label: "Data Processing Addendum", href: "/legal/dpa" },
      { label: "Security & Compliance", href: "/legal/security" },
    ],
  },
];

const socials = [
  { Icon: Linkedin, href: SITE.socials.linkedin, label: "LinkedIn" },
  { Icon: Twitter, href: SITE.socials.twitter, label: "Twitter" },
  { Icon: Github, href: SITE.socials.github, label: "GitHub" },
  { Icon: Instagram, href: SITE.socials.instagram, label: "Instagram" },
  { Icon: Facebook, href: SITE.socials.facebook, label: "Facebook" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="relative z-10 mt-20 border-t border-navy-700/40 bg-gradient-to-b from-navy-950 to-[#020510] pt-20">
      <div className="container-px">
        <div className="grid gap-12 pb-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo size={72} showWordmark={false} />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
              We are a senior product studio building modern websites and apps,
              revamping legacy platforms, automating infrastructure, growing
              search rankings, and helping startups launch from zero. One team,
              every stage of your digital journey.
            </p>

            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 text-slate-300 hover:text-white"
              >
                <Mail size={16} className="text-accent-glow" /> {SITE.email}
              </a>
              <a
                href={`tel:${SITE.phoneRaw}`}
                className="flex items-center gap-3 text-slate-300 hover:text-white"
              >
                <Phone size={16} className="text-accent-glow" /> {SITE.phone}
              </a>
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin size={16} className="text-accent-glow" /> {SITE.address}
              </div>
            </div>

            <div className="mt-7">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-navy-300">
                Newsletter
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) setSubscribed(true);
                }}
                className="mt-3 flex max-w-md overflow-hidden rounded-full border border-navy-700/60 bg-navy-900/60 backdrop-blur"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-slate-500 outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-navy-500 to-accent-cyan px-5 text-sm font-semibold text-white"
                >
                  {subscribed ? "Subscribed" : "Subscribe"} <Send size={14} />
                </motion.button>
              </form>
              <p className="mt-2 text-xs text-slate-500">
                Monthly digest. No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                  {col.title}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {l.label}
                        <ArrowUpRight
                          size={12}
                          className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Locations strip */}
        <div className="grid gap-4 border-t border-navy-700/40 py-8 sm:grid-cols-3">
          {[
            { city: "Greater Noida, IN", role: "HQ · Engineering & Design" },
            { city: "Delhi NCR", role: "Client partnerships · 201306" },
            { city: "Remote-first", role: "Async global delivery" },
          ].map((l) => (
            <div key={l.city} className="text-sm">
              <div className="font-semibold text-white">{l.city}</div>
              <div className="text-slate-400">{l.role}</div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-navy-700/40 py-7 sm:flex-row sm:items-center">
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Biztreck Solutions. All rights
            reserved. Built with care in Greater Noida, India.
          </div>
          <div className="flex items-center gap-3">
            {socials.map(({ Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -3 }}
                className="grid h-9 w-9 place-items-center rounded-full border border-navy-700/60 bg-navy-800/40 text-slate-300 transition-colors hover:border-accent-electric hover:text-white"
              >
                <Icon size={15} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
