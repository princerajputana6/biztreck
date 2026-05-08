import Image from "next/image";
import Link from "next/link";

type Props = {
  href?: string;
  /** Height in pixels — width auto-scales to preserve the logo's natural aspect ratio */
  size?: number;
  showWordmark?: boolean;
  className?: string;
  /** Render the logo on a subtle light panel so it pops on dark backgrounds */
  panel?: boolean;
};

export default function Logo({
  href = "/",
  size = 48,
  showWordmark = true,
  className = "",
  panel = false,
}: Props) {
  const inner = (
    <div className={`group flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
          panel
            ? "rounded-xl bg-white/95 px-2.5 py-1.5 shadow-glow ring-1 ring-white/10"
            : ""
        }`}
        style={{ height: size }}
      >
        <Image
          src="/logo.png"
          alt="Biztreck Solutions"
          width={size * 4}
          height={size}
          priority
          quality={75}
          sizes={`${size * 4}px`}
          style={{ height: size, width: "auto" }}
          className="block object-contain drop-shadow-[0_0_18px_rgba(127,162,255,0.35)]"
        />
      </div>
      {showWordmark && (
        <div className="leading-tight">
          <div className="font-display text-base font-bold text-white sm:text-lg">
            Biztreck
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-navy-300">
            Solutions
          </div>
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
