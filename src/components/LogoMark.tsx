/**
 * LogoMark - Reusable Load Saathi logo image component.
 * Replaces the old orange-box + Truck-icon pattern everywhere.
 *
 * Props:
 *   size   – Tailwind size class applied to width/height (default "h-8 w-8")
 *   className – extra classes on the <img> wrapper
 */
interface LogoMarkProps {
  size?: string;
  className?: string;
}

export default function LogoMark({ size = "h-8 w-8", className = "" }: LogoMarkProps) {
  return (
    <img
      src="/icons/icon.svg"
      alt="LoadSaathi logo"
      className={`${size} object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
