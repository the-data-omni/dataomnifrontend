
"use client";

import React, { useMemo, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
// Import the DataTable and ColumnDef from your local path
import { DataTable, ColumnDef } from "@/components/core/profileDataTable/data-table";
import {FINANCIAL_DATA, FINANCIAL_DATA_, DATA_PROFILE,DATA_PROFILE_SYNTH,FINANCIAL_DATA_SYNTH } from "./chat/data/financial_data"

// Recharts for mini histograms
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/** Helper to bin numeric data into a simple histogram. */
function computeHistogramData(values: number[], binCount = 10) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);

  // If all numbers are the same, just show 1 bin
  if (min === max) {
    return [{ name: `${min}`, count: values.length }];
  }

  const binSize = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    name: `${Math.round(min + i * binSize)} - ${Math.round(
      min + (i + 1) * binSize
    )}`,
    count: 0,
  }));

  values.forEach((val) => {
    const idx = Math.floor((val - min) / binSize);
    const binIndex = Math.min(idx, binCount - 1); // edge case for max
    bins[binIndex].count += 1;
  });

  return bins;
}

/** A small Recharts-based histogram component. */
function MiniHistogram({ data }: { data: number[] }) {
  const histogramData = useMemo(() => computeHistogramData(data), [data]);

  return (
    <Box sx={{ width: 100, height: 60 }}>
      <ResponsiveContainer width="100%" height="100%">
      <BarChart
  data={histogramData}
  barCategoryGap="0%"  // remove category gap
  barGap={0}           // remove gap between adjacent bars
  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" hide />
  <YAxis hide />
  <Tooltip />
  <Bar dataKey="count" fill="#8884d8" />
</BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export function ProfileDataTab() {
  // If there's no data, just show a message.
  if (!FINANCIAL_DATA || FINANCIAL_DATA.length === 0) {
    return <Typography>No data available.</Typography>;
  }

  // Keep track of the user's filter input for each column
  const [filters, setFilters] = useState<Record<string, string>>({});

  // We get all possible column keys from the first row
  const columnKeys = Object.keys(FINANCIAL_DATA[0]);

  // Build DataTable columns from those keys
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    return columnKeys.map((key) => {
      // Are *all* the values for this property numeric? If yes, we can do a histogram.
      const allValues = FINANCIAL_DATA.map((row) => row[key]);
      const numericValues = allValues.filter(
        (val) => typeof val === "number" && !isNaN(val)
      ) as number[];
      const isNumeric = numericValues.length === allValues.length;

      const filterValue = filters[key] || "";

      return {
        name: key, // what appears if we don't have a headerRenderer
        field: key, // which property we display in the row cells
        headerRenderer: () => {
          return (
            <Box display="flex" flexDirection="column" alignItems="center">
              {/* If numeric, show histogram */}
              {isNumeric && numericValues.length > 0 && (
                <MiniHistogram data={numericValues} />
              )}
              {/* Column label */}
              <Typography variant="subtitle2">{key}</Typography>
              {/* Text-based filter field */}
              <TextField
                variant="standard"
                value={filterValue}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }));
                }}
                placeholder="Filter..."
                size="small"
                sx={{ marginTop: 1, width: 80 }}
              />
            </Box>
          );
        },
      };
    });
  }, [columnKeys, filters]);

  // Filter the data by checking whether each row's cell includes the filter text.
  const filteredData = useMemo(() => {
    return FINANCIAL_DATA.filter((row) => {
      // For each column:
      return columnKeys.every((key) => {
        const filterVal = filters[key];
        if (!filterVal) return true; // no filter => pass
        const cellVal = String(row[key] ?? "");
        return cellVal.toLowerCase().includes(filterVal.toLowerCase());
      });
    });
  }, [FINANCIAL_DATA, filters, columnKeys]);

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Dataset
      </Typography>
      <DataTable
        rows={filteredData}
        columns={columns}
        hover
        // If you want row selection, pass `selectable` and `selected` here.
      />
    </Box>
  );
}
