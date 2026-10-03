"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { askPortfolioAi, toApiError } from "@/api";
import type { ApiError } from "@/api";
import type {
  AsyncStatus,
  ChatMessage,
  HoldingContext,
  SelectionSummary,
} from "@/types";

// Describe what the composable needs to ask a question.
export interface UsePortfolioAiOptions {
  // Hold null until the user selects a period on the chart.
  readonly selection: SelectionSummary | null;
  readonly holdings: readonly HoldingContext[];
  // Label the selected period for the message chip.
  readonly selectionLabel: string;
}

// Describe the composable result.
export interface UsePortfolioAiResult {
  readonly messages: readonly ChatMessage[];
  readonly status: AsyncStatus;
  readonly error: ApiError | null;
  readonly model: string | null;
  readonly canAsk: boolean;
  readonly ask: (question: string) => void;
  readonly reset: () => void;
}

// Run the Portfolio AI conversation for the selected period.
export function usePortfolioAi({
  selection,
  holdings,
  selectionLabel,
}: UsePortfolioAiOptions): UsePortfolioAiResult {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [error, setError] = useState<ApiError | null>(null);
  const [model, setModel] = useState<string | null>(null);

  // Count messages to give each one a stable key.
  const nextId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  // Drop any request still running when the panel unmounts.
  useEffect(() => () => controller.current?.abort(), []);

  const ask = useCallback(
    (question: string) => {
      const text = question.trim();
      if (!selection || text.length === 0 || status === "loading") {
        return;
      }

      nextId.current += 1;
      const userMessage: ChatMessage = {
        id: `m${nextId.current}`,
        role: "user",
        content: text,
        chip: messages.length === 0 ? selectionLabel : undefined,
      };

      const history = [...messages, userMessage];
      setMessages(history);
      setStatus("loading");
      setError(null);

      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;

      const run = async () => {
        try {
          const result = await askPortfolioAi(
            {
              selection,
              holdings,
              messages: history.map(({ role, content }) => ({ role, content })),
            },
            { signal: current.signal }
          );
          if (current.signal.aborted) {
            return;
          }
          nextId.current += 1;
          setMessages((previous) => [
            ...previous,
            { id: `m${nextId.current}`, role: "assistant", content: result.reply },
          ]);
          setModel(result.model);
          setStatus("success");
        } catch (caught) {
          if (current.signal.aborted) {
            return;
          }
          setError(toApiError(caught));
          setStatus("error");
        }
      };

      void run();
    },
    [selection, holdings, selectionLabel, messages, status]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setMessages([]);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    messages,
    status,
    error,
    model,
    canAsk: selection !== null && status !== "loading",
    ask,
    reset,
  };
}
