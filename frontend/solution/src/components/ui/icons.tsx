// Summary: Inline SVG iconography and official Electric Mind brand vector components.
// Define the shared shape for every inline icon.
interface IconProps {
  readonly className?: string;
}

// Apply the stroke style used by all icons.
const STROKE_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Render a wallet icon for total value.
export function WalletIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <path d="M3 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" />
      <path d="M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z" />
      <path d="M16.5 14h.01" />
    </svg>
  );
}

// Render a dollar icon for money change.
export function DollarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

// Render a percent icon for percent change.
export function PercentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <path d="M19 5 5 19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

// Render a chart icon for total return.
export function TrendIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 3 3 5-6" />
    </svg>
  );
}

// Render an upward arrow for a gain.
export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

// Render a downward arrow for a loss.
export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

// Render a dash for no change.
export function DashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <path d="M5 12h14" />
    </svg>
  );
}

// Render a right arrow, used on call to action buttons.
export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

// Render the official Electric Mind symbol from electricmind.com.
export function ElectricMindSymbol({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 108" className={className} aria-hidden="true" fill="currentColor">
      <path d="M117.352 52.7762L104.818 59.1481V15.4748L120.02 23.1819V48.4473C120.02 50.2881 118.989 51.9468 117.352 52.7762Z" />
      <path d="M28.8479 15.4748L13.6457 23.1819V43.7745C13.6457 45.6153 12.6148 47.274 10.9773 48.1034L2.64844 52.3311C1.01098 53.1605 -0.0200195 54.8395 -0.0200195 56.66V71.6696L15.1821 79.3767V48.9327C15.1821 47.092 16.2131 45.4332 17.8506 44.6038L26.1794 40.3761C27.8169 39.5467 28.8479 37.8678 28.8479 36.0472V15.4748Z" />
      <path d="M59.2318 0.039978L44.0297 7.74704V43.774C44.0297 45.6148 42.9987 47.2735 41.3612 48.1029L33.0324 52.3307C31.3949 53.16 30.3639 54.839 30.3639 56.6596V100.272L45.566 107.979V48.9525C45.566 47.1117 46.597 45.453 48.2345 44.6236L56.5634 40.3958C58.2008 39.5665 59.2318 37.8875 59.2318 36.0669V0.039978Z" />
      <path d="M89.6159 7.70706L74.4137 0V43.7745C74.4137 45.6153 73.3827 47.274 71.7452 48.1034L63.4164 52.3312C61.7789 53.1605 60.7479 54.8395 60.7479 56.66V81.4804L75.9501 73.7734V48.953C75.9501 47.1122 76.9811 45.4535 78.6185 44.6241L86.9474 40.3963C88.5849 39.567 89.6159 37.888 89.6159 36.0674V7.70706Z" />
    </svg>
  );
}

// Render the official Electric Mind wordmark from electricmind.com.
export function ElectricMindWordmark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 143 20" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12.2469 0V2.11218H2.57101V8.64586H11.7861V10.758H2.57101V17.6015H12.2469V19.7137H0V0H12.2469Z" />
      <path d="M16.7392 0V19.7137H14.1682V0H16.7392Z" />
      <path d="M18.6606 12.3914C18.6606 7.57568 21.8399 4.7876 25.572 4.7876C30.1611 4.7876 32.511 8.19525 32.4557 13.011H21.287V13.2926C21.4252 16.3342 23.388 17.9394 25.5996 17.9394C27.5348 17.9394 29 16.9819 29.5805 15.264H32.2069C31.3498 18.3619 28.7235 19.9953 25.5996 19.9953C21.9228 19.9953 18.6606 17.2917 18.6606 12.3914ZM29.8017 11.0397C29.5253 8.3079 27.8389 6.84345 25.5443 6.84345C23.388 6.84345 21.591 8.3079 21.287 11.0397H29.8017Z" />
      <path d="M40.8321 4.7876C44.0666 4.7876 46.5547 6.53367 47.3288 9.80051H44.7577C44.1495 7.88546 42.7673 6.84345 40.8321 6.84345C38.4546 6.84345 36.4918 8.73033 36.4918 12.3914C36.4918 16.0526 38.4546 17.9394 40.8321 17.9394C42.7949 17.9394 44.1772 16.8974 44.7577 14.9542H47.3288C46.5823 18.2492 44.0666 19.9953 40.8321 19.9953C37.1276 19.9953 33.9208 17.4044 33.9208 12.3914C33.9208 7.37854 37.1276 4.7876 40.8321 4.7876Z" />
      <path d="M49.969 15.912V7.18161H47.8679V5.06943H49.969V1.68994H52.4478V5.06943H55.1294V7.18161H52.4478V15.6867C52.4478 17.5735 53.5536 17.9396 55.1294 17.7143V19.7139C51.8396 20.1363 49.969 19.2351 49.969 15.912Z" />
      <path d="M57.0553 5.06937H59.6263V8.36437C60.5386 5.74527 62.4185 4.73142 64.8513 4.95672V7.26604C62.0038 6.87177 59.6263 7.82929 59.6263 12.8422V19.7138H57.0553V5.06937Z" />
      <path d="M66.7727 0.00488281H69.3437V2.71786H66.7727V0.00488281ZM69.3437 5.06942V19.7139H66.7727V5.06942H69.3437Z" />
      <path d="M78.1763 4.7876C81.4108 4.7876 83.8989 6.53367 84.673 9.80051H82.102C81.4938 7.88546 80.1115 6.84345 78.1763 6.84345C75.7988 6.84345 73.836 8.73033 73.836 12.3914C73.836 16.0526 75.7988 17.9394 78.1763 17.9394C80.1392 17.9394 81.5214 16.8974 82.102 14.9542H84.673C83.9266 18.2492 81.4108 19.9953 78.1763 19.9953C74.4719 19.9953 71.265 17.4044 71.265 12.3914C71.265 7.37854 74.4719 4.7876 78.1763 4.7876Z" />
      <path d="M89.1654 2.79296V19.7186H86.5944V0.00488281H90.4923L96.6573 17.7754L102.795 0.00488281H106.693V19.7186H104.121V2.79296L98.2607 19.7186H95.0262L89.1654 2.79296Z" />
      <path d="M109.535 0.00927734H112.106V2.72226H109.535V0.00927734ZM112.106 5.07382V19.7183H109.535V5.07382H112.106Z" />
      <path d="M121.363 6.84834C119.041 6.84834 117.52 8.50992 117.52 11.6359V19.7186H114.949V5.0741H117.52V7.60872C118.46 5.75 120.119 4.79248 122.248 4.79248C125.178 4.79248 127.168 6.62304 127.168 10.7066V19.7186H124.597V11.1009C124.597 8.17197 123.409 6.84834 121.363 6.84834Z" />
      <path d="M143 19.7186H140.429V17.0995C139.295 18.9863 137.471 20.0002 135.397 20.0002C132.052 20.0002 129.094 17.2684 129.094 12.3963C129.094 7.52424 132.08 4.79249 135.397 4.79249C137.471 4.79249 139.295 5.80634 140.429 7.69322V0.00488281H143V19.7186ZM136.061 17.9443C138.466 17.9443 140.429 15.8885 140.429 12.3963C140.429 8.9042 138.466 6.84835 136.061 6.84835C133.656 6.84835 131.665 8.9042 131.665 12.3963C131.665 15.8885 133.628 17.9443 136.061 17.9443Z" />
    </svg>
  );
}

// Retain LogoMark as alias to ElectricMindSymbol for backwards compatibility.
export const LogoMark = ElectricMindSymbol;

// Render full Electric Mind brand combination with symbol and wordmark.
export function ElectricMindLogo({ className }: IconProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`} aria-label="Electric Mind">
      <ElectricMindSymbol className="h-full w-auto shrink-0" />
      <ElectricMindWordmark className="h-[60%] w-auto shrink-0" />
    </span>
  );
}

// Render a sun, shown when the dark theme is active.
export function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

// Render a moon, shown when the light theme is active.
export function MoonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE_PROPS}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
