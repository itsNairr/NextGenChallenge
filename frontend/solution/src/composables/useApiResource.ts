// Summary: Composable hook providing async status, data caching, abort signals, and refetching.
"use client";

import { useCallback, useEffect, useState } from "react";
import { toApiError } from "@/api";
import type { ApiError } from "@/api";
import type { AsyncStatus } from "@/types";

// Describe the state of one fetched resource.
export interface ApiResource<T> {
  readonly data: T | null;
  readonly status: AsyncStatus;
  readonly error: ApiError | null;
  // Run the request again, for example after an error.
  readonly refetch: () => void;
}

// Hold the part of the state the effect writes.
interface ResourceState<T> {
  readonly data: T | null;
  readonly status: AsyncStatus;
  readonly error: ApiError | null;
}

// Start every resource in the loading state, because the effect fetches on mount.
const INITIAL_STATE: ResourceState<never> = { data: null, status: "loading", error: null };

// Fetch a resource and track its loading and error states.
// Pass a `load` function wrapped in useCallback, so the request reruns only when its inputs change.
export function useApiResource<T>(
  load: (signal: AbortSignal) => Promise<T>
): ApiResource<T> {
  const [state, setState] = useState<ResourceState<T>>(INITIAL_STATE);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setState({ data: null, status: "loading", error: null });
      try {
        const data = await load(controller.signal);
        setState({ data, status: "success", error: null });
      } catch (error) {
        // Ignore the abort this effect caused when unmounting or refetching.
        if (controller.signal.aborted) {
          return;
        }
        setState({ data: null, status: "error", error: toApiError(error) });
      }
    };

    void run();

    return () => controller.abort();
  }, [load, attempt]);

  const refetch = useCallback(() => setAttempt((previous) => previous + 1), []);

  return { ...state, refetch };
}
