import type { ReactNode } from "react";

// List the available button looks.
type ButtonVariant = "primary" | "ghost";

// Define properties for the button.
interface ButtonProps {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly onClick?: () => void;
  readonly className?: string;
}

// Style each variant. Electric Mind buttons are uppercase mono.
// Electric blue keeps enough contrast with white text in both themes.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border-em-blue bg-em-blue text-white hover:border-em-blue-dark hover:bg-em-blue-dark",
  ghost: "border-line bg-transparent text-heading hover:border-heading",
};

// Render an Electric Mind style button.
export function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`eyebrow inline-flex cursor-pointer items-center gap-2 rounded-control border px-5 py-3 font-medium transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
