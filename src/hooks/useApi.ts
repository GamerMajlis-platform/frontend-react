import { useState, useCallback, useRef } from "react";

export interface ApiState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
  retries?: number;
  retryDelay?: number;
}

/**
 * Custom hook for API request management
 * @param initialData - Initial data state
 * @returns API state and request functions
 */
export function useApi<T = unknown>(initialData: T | null = null) {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  // Cancel ongoing request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      loading: false,
    }));
  }, []);

  // Execute API request with retry logic
  const execute = useCallback(
    async <TResult = T>(
      request: (signal?: AbortSignal) => Promise<TResult>,
      options: ApiOptions = {}
    ): Promise<TResult | null> => {
      const { onSuccess, onError, retries = 0, retryDelay = 1000 } = options;

      // Cancel any existing request
      cancel();

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setState({
        data: null,
        loading: true,
        error: null,
      });

      let attempt = 0;
      const maxAttempts = retries + 1;

      while (attempt < maxAttempts) {
        try {
          const result = await request(signal);

          if (signal.aborted) {
            return null;
          }

          setState({
            data: result as T,
            loading: false,
            error: null,
          });

          onSuccess?.(result);
          return result;
        } catch (error) {
          attempt++;

          if (signal.aborted) {
            return null;
          }

          const errorMessage =
            error instanceof Error ? error.message : "An error occurred";

          // If this was the last attempt, log error and set error state
          if (attempt >= maxAttempts) {
            console.error(
              `API request failed after ${attempt} attempt(s): ${errorMessage}`
            );
            setState({
              data: null,
              loading: false,
              error: errorMessage,
            });
            onError?.(errorMessage);
            return null;
          }

          // Log a concise warning before retrying
          console.warn(
            `API request attempt ${attempt}/${maxAttempts} failed: ${errorMessage}. Retrying in ${retryDelay}ms...`
          );

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }

      return null;
    },
    [cancel]
  );

  // Execute request without updating state (for fire-and-forget operations)
  const executeWithoutState = useCallback(
    async <TResult = unknown>(
      request: (signal?: AbortSignal) => Promise<TResult>,
      options: Omit<ApiOptions, "onSuccess" | "onError"> & {
        onSuccess?: (data: TResult) => void;
        onError?: (error: string) => void;
      } = {}
    ): Promise<TResult | null> => {
      const { onSuccess, onError, retries = 0, retryDelay = 1000 } = options;

      const abortController = new AbortController();
      const signal = abortController.signal;

      let attempt = 0;
      const maxAttempts = retries + 1;

      while (attempt < maxAttempts) {
        try {
          const result = await request(signal);

          if (signal.aborted) {
            return null;
          }

          onSuccess?.(result);
          return result;
        } catch (error) {
          attempt++;

          if (signal.aborted) {
            return null;
          }

          const errorMessage =
            error instanceof Error ? error.message : "An error occurred";

          // If this was the last attempt, log error and call error handler
          if (attempt >= maxAttempts) {
            console.error(
              `API fire-and-forget request failed after ${attempt} attempt(s): ${errorMessage}`
            );
            onError?.(errorMessage);
            return null;
          }

          // Log a concise warning before retrying
          console.warn(
            `API fire-and-forget request attempt ${attempt}/${maxAttempts} failed: ${errorMessage}. Retrying in ${retryDelay}ms...`
          );

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }

      return null;
    },
    []
  );

  // Set data manually
  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  // Set error manually
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
      loading: false,
    }));
  }, []);

  // Set loading manually
  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading,
    }));
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    cancel();
  }, [cancel]);

  return {
    // State
    ...state,

    // Actions
    execute,
    executeWithoutState,
    reset,
    cancel,
    setData,
    setError,
    setLoading,
    cleanup,
  };
}

/**
 * Hook for managing multiple API requests
 */
export function useMultipleApi() {
  const [requests, setRequests] = useState<Map<string, ApiState>>(new Map());

  const getState = useCallback(
    (key: string): ApiState => {
      return requests.get(key) || { data: null, loading: false, error: null };
    },
    [requests]
  );

  const setState = useCallback((key: string, state: Partial<ApiState>) => {
    setRequests((prev) => {
      const newMap = new Map(prev);
      const currentState = newMap.get(key) || {
        data: null,
        loading: false,
        error: null,
      };
      newMap.set(key, { ...currentState, ...state });
      return newMap;
    });
  }, []);

  const execute = useCallback(
    async <T = unknown>(
      key: string,
      request: (signal?: AbortSignal) => Promise<T>,
      options: ApiOptions = {}
    ): Promise<T | null> => {
      const { onSuccess, onError, retries = 0, retryDelay = 1000 } = options;

      setState(key, { loading: true, error: null });

      let attempt = 0;
      const maxAttempts = retries + 1;

      while (attempt < maxAttempts) {
        try {
          const result = await request();
          setState(key, { data: result, loading: false, error: null });
          onSuccess?.(result);
          return result;
        } catch (error) {
          attempt++;
          const errorMessage =
            error instanceof Error ? error.message : "An error occurred";
          // If this was the last attempt, log error and set state
          if (attempt >= maxAttempts) {
            console.error(
              `API request [${key}] failed after ${attempt} attempt(s): ${errorMessage}`
            );
            setState(key, { data: null, loading: false, error: errorMessage });
            onError?.(errorMessage);
            return null;
          }

          // Warn before retry
          console.warn(
            `API request [${key}] attempt ${attempt}/${maxAttempts} failed: ${errorMessage}. Retrying in ${retryDelay}ms...`
          );

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }

      return null;
    },
    [setState]
  );

  const reset = useCallback((key?: string) => {
    if (key) {
      setRequests((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    } else {
      setRequests(new Map());
    }
  }, []);

  return {
    getState,
    execute,
    reset,
    requests: Object.fromEntries(requests),
  };
}
