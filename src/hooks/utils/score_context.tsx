"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useFlattenedFields } from "./useFlattenedFields";
import { SchemaContext } from "@/components/dashboard/layout/SchemaContext";


// --------------------
// Types
// --------------------
interface ScoreParams {
  similarity_threshold?: number;
  doc_similarity_meaningful_min?: number;
  doc_similarity_placeholder_max?: number;
  weights_override?: Record<string, number>;
}

interface ScoreContextType {
  // Overall total score
  score: number;

  // Metric-specific scores
  field_name_score: number;
  field_sim_score: number;
  field_type_score: number;
  field_key_score: number;
  field_desc_score: number;

  // Combined loading state (fields + score fetch)
  loading: boolean;

  // If there's an error from flattened fields
  error: boolean;

  // The current scoring parameters in use
  scoreParams: ScoreParams;

  // Let the UI update scoring params and fetch new score
  updateScoreParams: (newParams: ScoreParams) => Promise<void>;
}

type NumericScoreKeys =
  | "field_name_score"
  | "field_sim_score"
  | "field_type_score"
  | "field_key_score"
  | "field_desc_score";

// --------------------
// Create Context
// --------------------
const ScoreContext = createContext<ScoreContextType>({
  score: 0,
  field_name_score: 0,
  field_sim_score: 0,
  field_type_score: 0,
  field_key_score: 0,
  field_desc_score: 0,
  loading: true,
  error: false,
  scoreParams: {},
  updateScoreParams: async () => {},
});

// --------------------
// Provider
// --------------------
export function ScoreProvider({ children }: { children: React.ReactNode }) {
  const { selectedSchemaName } = useContext(SchemaContext);

  // Flattened fields
  const { data: flattenedFields, isLoading: fieldsLoading, isError } = useFlattenedFields(selectedSchemaName);

  // Local metric states
  const [score, setScore] = useState<number>(0);
  const [field_name_score, setFieldNameScore] = useState<number>(0);
  const [field_sim_score, setFieldSimScore] = useState<number>(0);
  const [field_type_score, setFieldTypeScore] = useState<number>(0);
  const [field_key_score, setFieldKeyScore] = useState<number>(0);
  const [field_desc_score, setFieldDescScore] = useState<number>(0);

  // Track loading for scoring fetch
  const [scoreLoading, setScoreLoading] = useState<boolean>(true);

  // Current scoring parameters
  const [scoreParams, setScoreParams] = useState<ScoreParams>({});

  // --------------------
  // updateScoreParams
  // --------------------
  // Called by UI whenever scoring parameters change or user wants to recalc
  async function updateScoreParams(newParams: ScoreParams): Promise<void> {
    // Update the local score params
    setScoreParams((prev) => ({ ...prev, ...newParams }));

    // If we don't have a valid schema or flattened fields, do nothing
    if (!selectedSchemaName || !flattenedFields || flattenedFields.length === 0 || fieldsLoading || isError) {
      return Promise.resolve();
    }

    // Otherwise, fetch the updated score
    return fetchScore(newParams);
  }

  // --------------------
  // fetchScore
  // --------------------
  // Internal helper that does the actual scoring API call
  async function fetchScore(paramsOverride?: ScoreParams) {
    setScoreLoading(true);
    try {
      const schemaData = {
        schema: flattenedFields ?? [].map((field: any) => ({
          table_catalog: field.table_catalog,
          table_schema: field.table_schema,
          table_name: field.table_name,
          column_name: field.column_name,
          field_path: field.column_name,
          data_type: field.data_type,
          description: field.description,
          collation_name: "NULL",
          rounding_mode: null,
          primary_key: field.is_primary_key,
          foreign_key: field.is_foreign_key,
        })),
      };

      const requestBody = {
        ...schemaData,
        similarity_threshold:
          paramsOverride?.similarity_threshold ?? scoreParams.similarity_threshold,
        doc_similarity_meaningful_min:
          paramsOverride?.doc_similarity_meaningful_min ?? scoreParams.doc_similarity_meaningful_min,
        doc_similarity_placeholder_max:
          paramsOverride?.doc_similarity_placeholder_max ?? scoreParams.doc_similarity_placeholder_max,
        weights_override:
          paramsOverride?.weights_override ?? scoreParams.weights_override,
      };

      const apiUrl = import.meta.env.VITE_API_URL;

      const res = await fetch("https://schema-scoring-api-242009193450.us-central1.run.app/score_schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const data = await res.json();

      // Update local metric states
      setScore(data["Total Score"] || 0);
      setFieldNameScore(data["Field Names Score (%)"] || 0);
      setFieldSimScore(data["Field Name Similarity Score (%)"] || 0);
      setFieldTypeScore(data["Field Types Score (%)"] || 0);
      setFieldKeyScore(data["Keys Presence Score (%)"] || 0);
      setFieldDescScore(data["Field Descriptions Score (%)"] || 0);
    } catch (err) {
      console.error("Failed to fetch Gen AI score:", err);
    } finally {
      setScoreLoading(false);
    }
  }

  // --------------------
  // Re-fetch whenever selectedSchemaName or flattenedFields change
  // --------------------
  useEffect(() => {
    if (!selectedSchemaName || fieldsLoading || !flattenedFields || flattenedFields.length === 0) {
      // If we have no schema or fields are still loading, set ourselves to loading mode
      setScoreLoading(true);
      return;
    }

    // If we do have a new schema, reset old scores and fetch anew
    setScore(0);
    setFieldNameScore(0);
    setFieldSimScore(0);
    setFieldTypeScore(0);
    setFieldKeyScore(0);
    setFieldDescScore(0);

    // Trigger a fetch with current (existing) scoreParams
    fetchScore().catch((err) => {
      console.error(err);
    });
  }, [selectedSchemaName, flattenedFields, fieldsLoading]);

  // Combine fieldsLoading + scoreLoading
  const combinedLoading = fieldsLoading || scoreLoading;

  // Provide all values to context
  return (
    <ScoreContext.Provider
      value={{
        score,
        field_name_score,
        field_sim_score,
        field_type_score,
        field_key_score,
        field_desc_score,
        loading: combinedLoading,
        error: isError,
        scoreParams,
        updateScoreParams,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
}

// --------------------
// Hook to use ScoreContext
// --------------------
export function useScore() {
  return useContext(ScoreContext);
}
