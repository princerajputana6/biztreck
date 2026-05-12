"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { label: "Services", href: "/#services" },
  { label: "Products", href: "/#products" },
  { label: "Process", href: "/#process" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-navy-700/40 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a href="/#contact" className="btn-primary shine">
            Start a Project
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
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-200 hover:bg-navy-800/60"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/#contact"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2"
              >
                Start a Project
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
