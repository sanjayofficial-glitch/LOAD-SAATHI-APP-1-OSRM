/**
 * LogoMark - Reusable Load Saathi logo image component.
 * Replaces the old orange-box + Truck-icon pattern everywhere.
 *
 * Props:
 *   size   – Tailwind size class applied to width/height (default "h-8 w-8")
 *   className – extra classes on the <img> wrapper
 */
import React from "react";

interface LogoMarkProps {
  size?: string;
  className?: string;
}

export default React.memo(function LogoMark({ size = "h-8 w-8", className = "" }: LogoMarkProps) {
  return (
    <img
      src="/logo-64.webp"
      srcSet="/logo-32.webp 32w, /logo-64.webp 64w, /logo-128.webp 128w"
      sizes="(min-width: 768px) 44px, 32px"
      alt="LoadSaathi logo"
      className={`${size} object-contain select-none ${className}`}
      draggable={false}
      width={128}
      height={128}
    />
  );
});
