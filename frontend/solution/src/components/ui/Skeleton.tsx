// Define properties for the placeholder block.
interface SkeletonProps {
  readonly className?: string;
}

// Render a pulsing placeholder shown while data loads.
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-line ${className}`} />;
}
