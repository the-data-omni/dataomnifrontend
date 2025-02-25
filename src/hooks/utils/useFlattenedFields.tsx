// useFlattenedFields.tsx
'use client';

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { FlattenedField } from './types';

async function fetchSchemaFromLocal(filename: string): Promise<FlattenedField[]> {
  if (typeof window === 'undefined') return [];
  
  const dataStr = localStorage.getItem(filename);
  if (!dataStr) {
    throw new Error(`No data found for schema: ${filename}`);
  }
  const result = JSON.parse(dataStr);
  return result.schema as FlattenedField[];
}

async function fetchFlattenedFieldsFromAPI(): Promise<FlattenedField[]> {
  const response = await fetch(
    'https://schema-scoring-api-242009193450.us-central1.run.app/bigquery_info',
    {
      method: 'GET',
      credentials: 'include', // <= to send session cookies
      headers: { 'Content-Type': 'application/json' },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.schema as FlattenedField[];
}

/**
 * useFlattenedFields
 * @param selectedSchemaName - "api" => fetch from `/bigquery_info`
 *                            otherwise => treat it as a filename in localStorage
 * @param queryOptions - optional React Query config (e.g., { enabled: boolean })
 */
export function useFlattenedFields(
  selectedSchemaName?: string,
  queryOptions?: UseQueryOptions<FlattenedField[], Error>
): UseQueryResult<FlattenedField[], Error> {
  return useQuery<FlattenedField[], Error>({
    queryKey: ['flattenedFields', selectedSchemaName],
    queryFn: async () => {
      if (!selectedSchemaName) {
        return [];
      }
      if (selectedSchemaName === 'api') {
        return await fetchFlattenedFieldsFromAPI();
      } else {
        return await fetchSchemaFromLocal(selectedSchemaName);
      }
    },
    // Merge 'enabled' with fallback to just checking if selectedSchemaName is truthy
    enabled: queryOptions?.enabled ?? !!selectedSchemaName,
    staleTime: 1000 * 60 * 5,  // 5 minutes
    ...queryOptions,
  });
}
