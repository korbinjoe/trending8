"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface FeedLoadingContextValue {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FeedLoadingContext = createContext<FeedLoadingContextValue | null>(null);

export function FeedLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const value = useMemo(
    () => ({ isLoading, setIsLoading }),
    [isLoading],
  );
  return (
    <FeedLoadingContext.Provider value={value}>
      {children}
    </FeedLoadingContext.Provider>
  );
}

export function useFeedLoading(): FeedLoadingContextValue {
  const ctx = useContext(FeedLoadingContext);
  if (!ctx) {
    throw new Error("useFeedLoading must be used within FeedLoadingProvider");
  }
  return ctx;
}
