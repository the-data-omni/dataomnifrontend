'use client';

import { useQuery } from '@tanstack/react-query';
import type { FlattenedField } from './types';

async function fetchSchemaFromLocal(filename: string): Promise<FlattenedField[]> {
  if (typeof window === 'undefined') return [];
  
  const dataStr = localStorage.getItem(filename);
  if (!dataStr) {
    throw new Error(`No data found for schema: ${filename}`);
  }
  
  // We expect the local JSON to have a flat "schema" array now
  // e.g. { "schema": [ { ...FlattenedField }, ... ] }
  const result = JSON.parse(dataStr);
  // If you prefer storing the array directly, adjust accordingly
  // e.g. return result as FlattenedField[];
  return result.schema as FlattenedField[];
}

async function fetchFlattenedFieldsFromAPI(): Promise<FlattenedField[]> {
  const response = await fetch(`${import.meta.env.VITE_APP_URL}/bigquery_info`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // The new Flask code returns { "schema": [ { ... FlattenedField }, ... ] }
  const data = await response.json();
  // Just return that schema array
  return data.schema as FlattenedField[];
}

interface UseFlattenedFieldsOptions {
  selectedSchemaName?: string;
}

/**
 * useFlattenedFields
 * - If `selectedSchemaName` is "api", we load from the Flask endpoint (already flattened).
 * - Otherwise, we treat `selectedSchemaName` as a local filename in localStorage.
 */
export function useFlattenedFields(selectedSchemaName?: string) {
  return useQuery<FlattenedField[]>({
    queryKey: ['flattenedFields', selectedSchemaName],
    queryFn: async () => {
      // If no schema is selected, return an empty array
      if (!selectedSchemaName) {
        return [];
      }
      if (selectedSchemaName === 'api') {
        // If user chooses 'api', load direct from API (already flattened)
        return await fetchFlattenedFieldsFromAPI();
      } else {
        // Otherwise, read from local storage (already flattened or a "schema" object)
        return await fetchSchemaFromLocal(selectedSchemaName);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    // any other react-query configs
  });
}
