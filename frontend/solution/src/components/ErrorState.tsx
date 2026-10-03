"use client";

import { describeApiError } from "@/api";
import type { ApiError } from "@/api";
import { Button, Card } from "./ui";

// Define properties for the error panel.
interface ErrorStateProps {
  readonly error: ApiError;
  readonly onRetry: () => void;
  readonly title?: string;
}

// Render a failed request with the reason and a way to try again.
export function ErrorState({ error, onRetry, title = "Could not load the portfolio" }: ErrorStateProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="eyebrow text-loss">
            {error.status ? `Error ${error.status}` : error.kind}
          </p>
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-heading">{title}</h2>
          <p className="mt-1 text-sm text-body">{describeApiError(error)}</p>
        </div>
        <Button variant="ghost" onClick={onRetry} className="shrink-0">
          Try again
        </Button>
      </div>
    </Card>
  );
}
