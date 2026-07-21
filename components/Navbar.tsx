"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "./Logo";

type Child = { label: string; href: string };
type NavLink = { label: string; href: string; children?: Child[] };

const links: NavLink[] = [
  { label: "Home", href: "/" },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      { label: "Custom Software", href: "/solutions/custom-software" },
      { label: "CRM Development", href: "/solutions/crm-development" },
      { label: "ERP Development", href: "/solutions/erp-development" },
      { label: "AI Automation", href: "/solutions/ai-automation" },
      { label: "Business Automation", href: "/solutions/business-automation" },
      { label: "Customer Portals", href: "/solutions/customer-portals" },
      { label: "Vendor Portals", href: "/solutions/vendor-portals" },
      { label: "Business Dashboards", href: "/solutions/dashboard-development" },
      { label: "Website Development", href: "/solutions/website-development" },
    ],
  },
  {
    label: "Industries",
    href: "/industries",
    children: [
      { label: "Healthcare", href: "/industries/healthcare" },
      { label: "Construction", href: "/industries/construction" },
      { label: "Manufacturing", href: "/industries/manufacturing" },
      { label: "Finance", href: "/industries/finance" },
      { label: "Logistics", href: "/industries/logistics" },
      { label: "Education", href: "/industries/education" },
      { label: "Real Estate", href: "/industries/real-estate" },
      { label: "Professional Services", href: "/industries/professional-services" },
    ],
  },
  { label: "Case Studies", href: "/case-studies" },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Free Business Audit", href: "/resources/business-audit" },
      { label: "Blog", href: "/blog" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Our Work", href: "/portfolio" },
      { label: "FAQ", href: "/faq" },
      { label: "Careers", href: "/careers" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpenMenu, setMobileOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-navy-700/40 bg-navy-950/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container-px flex h-20 items-center justify-between sm:h-24">
        <Logo size={56} showWordmark={false} />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.children ? (
              <div
                key={l.href}
                className="relative"
                onMouseEnter={() => setOpenMenu(l.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <a
                  href={l.href}
                  className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-navy-700/40 hover:text-white"
                >
                  {l.label}
                  <ChevronDown size={14} className="opacity-70" />
                </a>
                <AnimatePresence>
                  {openMenu === l.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full w-64 overflow-hidden rounded-2xl border border-navy-700/50 bg-navy-950/95 p-2 backdrop-blur-xl"
                    >
                      {l.children.map((c) => (
                        <a
                          key={c.href}
                          href={c.href}
                          className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-navy-800/70 hover:text-white"
                        >
                          {c.label}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-navy-700/40 hover:text-white"
              >
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden lg:block">
          <a href="/book-strategy-call" className="btn-primary shine">
            Book Strategy Call
          </a>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-navy-700/50 bg-navy-800/60 text-white lg:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-navy-700/40 bg-navy-950/90 backdrop-blur-xl lg:hidden"
          >
            <div className="container-px flex flex-col gap-1 py-4">
              {links.map((l) =>
                l.children ? (
                  <div key={l.href}>
                    <button
                      onClick={() =>
                        setMobileOpenMenu((v) => (v === l.label ? null : l.label))
                      }
                      className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-slate-200 hover:bg-navy-800/60"
                    >
                      {l.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          mobileOpenMenu === l.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {mobileOpenMenu === l.label && (
                      <div className="ml-3 border-l border-navy-700/40 pl-3">
                        {l.children.map((c) => (
                          <a
                            key={c.href}
                            href={c.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-lg px-4 py-2.5 text-sm text-slate-300 hover:bg-navy-800/60 hover:text-white"
                          >
                            {c.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-slate-200 hover:bg-navy-800/60"
                  >
                    {l.label}
                  </a>
                )
              )}
              <a
                href="/book-strategy-call"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2"
              >
                Book Strategy Call
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
