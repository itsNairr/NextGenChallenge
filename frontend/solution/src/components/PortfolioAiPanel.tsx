"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { describeApiError } from "@/api";
import type { ApiError } from "@/api";
import type { AsyncStatus, ChatMessage } from "@/types";
import { Button, Card } from "./ui";

// List the steps shown before the first question.
const STEPS: readonly string[] = [
  "Click a start point on the portfolio value line.",
  "Click an end point. The period is shaded and summarised.",
  "Press Ask Portfolio AI. The dates, values, change and your holdings are sent as context.",
];

// Define properties for the panel.
interface PortfolioAiPanelProps {
  readonly messages: readonly ChatMessage[];
  readonly status: AsyncStatus;
  readonly error: ApiError | null;
  readonly model: string | null;
  readonly canAsk: boolean;
  readonly hasSelection: boolean;
  readonly onAsk: (question: string) => void;
  readonly onReset: () => void;
}

// Render the Portfolio AI conversation.
export function PortfolioAiPanel({
  messages,
  status,
  error,
  model,
  canAsk,
  hasSelection,
  onAsk,
  onReset,
}: PortfolioAiPanelProps) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages, status]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canAsk || input.trim().length === 0) {
      return;
    }
    onAsk(input);
    setInput("");
  };

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="eyebrow mt-0.5 rounded-[6px] bg-em-blue px-1.5 py-1 text-white">AI</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-heading">Portfolio AI</h2>
          <p className="mt-1 text-sm text-body">
            Explains trends and dips you select on the chart.
          </p>
        </div>
        {messages.length > 0 ? (
          <Button variant="ghost" onClick={onReset} className="shrink-0 px-3 py-2">
            New chat
          </Button>
        ) : null}
      </div>

      <div
        ref={listRef}
        className="mt-4 flex max-h-96 min-h-40 flex-col gap-4 overflow-auto"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <ol className="flex flex-col gap-3">
            {STEPS.map((step, index) => (
              <li key={step} className="grid grid-cols-[20px_1fr] gap-3 text-sm text-body">
                <span className="eyebrow text-selection">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex flex-col items-end gap-1.5">
              {message.chip ? (
                <span className="eyebrow border border-selection px-2 py-1 text-selection">
                  Chart selection &middot; {message.chip}
                </span>
              ) : null}
              <p className="max-w-[88%] rounded-control bg-flat-soft px-3 py-2 text-sm text-heading">
                {message.content}
              </p>
            </div>
          ) : (
            <p
              key={message.id}
              className="max-w-[92%] text-sm leading-relaxed whitespace-pre-wrap text-body"
            >
              {message.content}
            </p>
          )
        )}

        {status === "loading" ? (
          <p className="text-sm text-subtle">Analysing the selected period...</p>
        ) : null}

        {error ? (
          <p className="text-sm text-loss">{describeApiError(error)}</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 border-t border-line pt-4">
        <label className="sr-only" htmlFor="portfolio-ai-input">
          Ask Portfolio AI a question
        </label>
        <input
          id="portfolio-ai-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={!hasSelection}
          placeholder={hasSelection ? "Ask a follow-up..." : "Select a period on the chart first"}
          className="min-w-0 flex-1 rounded-control border border-line bg-surface px-3 py-2 text-sm text-heading placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button type="submit" disabled={!canAsk || input.trim().length === 0}>
          Send
        </Button>
      </form>

      <p className="mt-3 text-xs text-subtle">
        Generated from fictional sample data. Not investment advice.
        {model ? ` Model: ${model}.` : ""}
      </p>
    </Card>
  );
}
