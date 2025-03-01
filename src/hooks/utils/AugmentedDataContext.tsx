// /context/AugmentedDataContext.tsx
"use client"; // if you're on Next.js App Router

import React, { createContext, useContext, useEffect, useState } from "react";
import type { FlattenedField } from "@/hooks/utils/types";
// import { useFlattenedFields } from "@/hooks/utils/useFlattenedFields";

/** 
 *  1) The shape of our context value.
 *  You can store loading, error, etc. as well if you want.
 */
interface AugmentedDataContextValue {
  augmentedData: FlattenedField[];
  setAugmentedData: React.Dispatch<React.SetStateAction<FlattenedField[]>>;
  isLoading: boolean;
  error: any;
}

/**
 * 2) Create the actual context.
 *    We'll default to something that helps TS but is never actually used un-provided.
 */
const AugmentedDataContext = createContext<AugmentedDataContextValue>({
  augmentedData: [],
  setAugmentedData: () => {},
  isLoading: false,
  error: null,
});

/** 
 * 3) A hook to easily consume the context
 */
export function useAugmentedData(): AugmentedDataContextValue {
  return useContext(AugmentedDataContext);
}

/**
 * 4) The Provider component that wraps your app or pages.
 *    This is where you can load data from your useFlattenedFields
 *    or wherever you get your schema from. 
 */
export function AugmentedDataProvider({ children }: { children: React.ReactNode }) {
  // If you already have a custom hook:
  //   const { data, isLoading, error } = useFlattenedFields("mySelectedSchema");
  // For demonstration, let's do a simple example:

  const [augmentedData, setAugmentedData] = useState<FlattenedField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Example: Pretend we're fetching from an API
  useEffect(() => {
    setIsLoading(true);
    fetch("http://127.0.0.1:8080/get_base_schema")
      .then((res) => res.json())
      .then((fields: FlattenedField[]) => {
        setAugmentedData(fields);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  const value: AugmentedDataContextValue = {
    augmentedData,
    setAugmentedData,
    isLoading,
    error,
  };

  return (
    <AugmentedDataContext.Provider value={value}>
      {children}
    </AugmentedDataContext.Provider>
  );
}
