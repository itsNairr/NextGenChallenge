"use client";

// Describe one choice in the control.
export interface SegmentOption<T extends string> {
  readonly id: T;
  readonly label: string;
}

// Choose how the selected segment is filled.
type SegmentTone = "brand" | "neutral";

// Style the selected segment for each tone.
const ACTIVE_CLASSES: Record<SegmentTone, string> = {
  brand: "bg-em-blue text-white",
  neutral: "bg-heading text-surface",
};

// Define properties for the control.
interface SegmentedControlProps<T extends string> {
  readonly label: string;
  readonly options: readonly SegmentOption<T>[];
  readonly value: T;
  readonly onSelect: (value: T) => void;
  readonly tone?: SegmentTone;
}

// Render a row of mutually exclusive choices.
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onSelect,
  tone = "brand",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-0.5 rounded-control border border-line p-0.5"
    >
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(option.id)}
            className={`eyebrow cursor-pointer rounded-[7px] px-3 py-2 font-medium transition-colors ${
              isActive ? ACTIVE_CLASSES[tone] : "text-subtle hover:text-heading"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
