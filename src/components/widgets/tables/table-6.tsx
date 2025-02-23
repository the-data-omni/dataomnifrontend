"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { MagnifyingGlass as MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";

import type { ColumnDef } from "@/components/core/data-table";
import { DataTable } from "@/components/core/data-table";

// 1. Define the interface for columns within the table schema
interface SchemaColumn {
  column_name: string;
  description: string;
}

// 2. Define the interface for each table in the scraped schema
interface TableSchema {
  table_name: string;
  table_link: string;
  description: string;
  relation: string;
  table_description: string;
  columns: SchemaColumn[];
}

// 3. Create DataTable columns describing how TableSchema should appear
const columns: ColumnDef<TableSchema>[] = [
  { field: "table_name", name: "Table Name", width: "200px" },
  {
    // Render a clickable link for table_link
    name: "Table Link",
    width: "300px",
    formatter: (row) => (
      <a href={row.table_link} target="_blank" rel="noreferrer">
        {row.table_link}
      </a>
    ),
  },
  { field: "description", name: "Description", width: "300px" },
  { field: "relation", name: "Relation", width: "280px" },
  { field: "table_description", name: "Table Description", width: "300px" },
  {
    // Example: Show column names & descriptions stacked inside a cell
    name: "Columns",
    width: "300px",
    formatter: (row) => (
      <div>
        {row.columns.map((col, index) => (
          <div key={index} style={{ marginBottom: "0.5rem" }}>
            <strong>{col.column_name}</strong>: {col.description}
          </div>
        ))}
      </div>
    ),
  },
];

export function Table6(): React.JSX.Element {
  // 4. State for the user-entered URL
  const [scrapeUrl, setScrapeUrl] = useState("");
  // 5. State for the scraped schema data
  const [tables, setTables] = useState<TableSchema[]>([]);
  // 6. Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 7. Function to handle the scrape call
  const handleScrape = async () => {
    if (!scrapeUrl) return;
    setLoading(true);
    setError("");
    setTables([]);

    try {
      // POST the URL to your backend to scrape
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl }),
      });

      if (!response.ok) {
        const msg = await response.json();
        setError(msg.error || "An error occurred while scraping.");
      } else {
        const json = await response.json();
        setTables(json.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Card>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", p: 3 }}>
          <OutlinedInput
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="Enter URL to scrape"
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
            sx={{ flex: "1 1 auto" }}
          />
          <Button variant="contained" onClick={handleScrape} disabled={loading}>
            {loading ? "Scraping..." : "Scrape"}
          </Button>
        </Stack>
        <Divider />

        {error && (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ overflowX: "auto" }}>
          {/* 8. Render the DataTable with the scraped data */}
          <DataTable<TableSchema> columns={columns} rows={tables} selectable />
        </Box>
      </Card>
    </Box>
  );
}
