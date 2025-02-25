"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import type { Metadata } from "@/types/metadata";
import { appConfig } from "@/config/app";
import { QueriesTable, Query } from "@/components/dashboard/product/queries-table";
import { QueryModal } from "@/components/dashboard/product/query-modal";
import { QueriesFilters } from "@/components/dashboard/product/products-filters";
import { QueriesPagination } from "@/components/dashboard/product/products-pagination";

interface Filters {
  statementType?: string;
  question?: string;
  sku?: string;
  sortDir?: "asc" | "desc";
}

const metadata: Metadata = {
  title: `Queries | ${appConfig.name}`,
};

// Helper to parse raw JSON into your Query objects
function parseQueries(data: Array<{
  avg_execution_time: number | null;
  avg_total_bytes_processed: number | null;
  count: number;
  creation_time: string;
  query: string;
  question: string;
  statement_type: string;
}>): Query[] {
  return data.map((item, index) => ({
    id: `Q-${index + 1}`,
    question: item.question,
    sql: item.query,
    count: item.count,
    statementType: item.statement_type,
    createdAt: new Date(item.creation_time),
    avgExecutionTime: item.avg_execution_time,
    avgTotalBytesProcessed: item.avg_total_bytes_processed,
  }));
}

export function Page(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-based filters
  const statementType = searchParams.get("statementType") || undefined;
  const question = searchParams.get("question") || undefined;
  const sku = searchParams.get("sku") || undefined;
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || undefined;
  const previewId = searchParams.get("previewId") || undefined;
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "5", 10);

  // Source states: "api", "demo queries", or "saved"
  const [source, setSource] = React.useState<"api" | "demo queries" | "saved">("demo queries");
  // We'll store queries that came from the API so we can show them when "saved" is selected
  const [savedQueries, setSavedQueries] = React.useState<Query[]>([]);

  // Menu anchor
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleSourceMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSourceMenuClose = () => {
    setAnchorEl(null);
  };

  // Switch source
  const handleSelectSource = (newSource: "api" | "demo queries" | "saved") => {
    setSource(newSource);
    setAnchorEl(null);
  };

  // "Add Query" modal
  const [showAddModal, setShowAddModal] = React.useState(false);
  const handleAddQuery = React.useCallback(() => setShowAddModal(true), []);
  const handleCloseAddModal = React.useCallback(() => setShowAddModal(false), []);

  // ============ React Query Integration ============
  /**
   * We rely on a single useQuery, keyed by ["queries", source].
   * If the user picks "saved", we return the local `savedQueries` array (no fetch).
   * If "api" or "demo queries", we fetch from the server or local JSON file.
   */
  const {
    data: fetchedQueries,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["queries", source],
    // The function that fetches queries or returns saved ones
    queryFn: async (): Promise<Query[]> => {
      if (source === "saved") {
        // Return previously saved queries from the API
        return savedQueries;
      }
      if (source === "api") {
        const res = await fetch("https://schema-scoring-api-242009193450.us-central1.run.app/queries_and_questions", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        const data = await res.json();
        const parsed = parseQueries(data);
        // Save them for "saved" mode
        setSavedQueries(parsed);
        return parsed;
      }
      // Otherwise, "demo queries" => fetch local JSON
      const res = await fetch("/sample-queries.json");
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }
      const data = await res.json();
      return parseQueries(data);
    },
    // If "saved" is selected but we have none saved, that might be empty array.
    // By default, we still run the queryFn for "saved", but it just returns savedQueries.
    // If you want to skip fetch entirely for "saved", do:
    enabled: source !== "saved" || savedQueries.length === 0,
    // Cache data forever (or as long as app is open)
    staleTime: Infinity,
    // keepPreviousData: true,
  });

  /**
   * "queriesData" is the final array we'll display:
   * - If "saved" but there's no data, you'll see an empty table
   * - Otherwise we use the "fetchedQueries"
   */
  const queriesData = React.useMemo(() => {
    if (source === "saved") {
      return savedQueries;
    }
    return fetchedQueries || [];
  }, [source, savedQueries, fetchedQueries]);

  // If user clicks "Preview" a query (previewId in URL), find that query:
  const clickedQuery = React.useMemo(() => {
    if (!previewId) return undefined;
    return queriesData.find((q) => q.id === previewId);
  }, [previewId, queriesData]);

  // The refresh button simply re-calls `refetch()` from React Query
  const handleRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  // Filtering + sorting
  const filtered = React.useMemo(() => {
    if (!queriesData) return [];
    const f = applyFilters(queriesData, { statementType, question, sku });
    return applySort(f, sortDir);
  }, [queriesData, statementType, question, sku, sortDir]);

  // Paginate
  const paginated = React.useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, page, rowsPerPage]);

  // Pagination Handlers
  const handlePageChange = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("page", String(newPage));
        return newParams;
      });
    },
    [setSearchParams]
  );

  const handleRowsPerPageChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRows = parseInt(event.target.value, 10);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("rowsPerPage", String(newRows));
        newParams.set("page", "0");
        return newParams;
      });
    },
    [setSearchParams]
  );

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box
        sx={{
          maxWidth: "var(--Content-maxWidth)",
          m: "var(--Content-margin)",
          p: "var(--Content-padding)",
          width: "var(--Content-width)",
        }}
      >
        <Stack spacing={4}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ alignItems: "flex-start" }}
          >
            <Box sx={{ flex: "1 1 auto" }}>
              <Typography variant="h4">Queries</Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              {/* Source Selector Button (Contained) */}
              <Button variant="contained" onClick={handleSourceMenuOpen}>
                {source.toUpperCase()}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleSourceMenuClose}
              >
                <MenuItem onClick={() => handleSelectSource("demo queries")}>
                  DEMO QUERIES
                </MenuItem>
                <MenuItem onClick={() => handleSelectSource("api")}>API</MenuItem>
                <MenuItem onClick={() => handleSelectSource("saved")}>SAVED</MenuItem>
              </Menu>

              {/* Add Query Button (Contained) */}
              <Button onClick={handleAddQuery} startIcon={<PlusIcon />} variant="contained">
                Add Query
              </Button>

              {/* Refresh Button (Outlined) */}
              <Button onClick={handleRefresh} variant="outlined">
                Refresh
              </Button>
            </Stack>
          </Stack>

          <Card>
            <QueriesFilters
              filters={{ statementType, question, sku }}
              sortDir={sortDir}
              statementTypes={
                queriesData
                  ? Array.from(new Set(queriesData.map((q) => q.statementType).filter(Boolean))).sort()
                  : []
              }
            />
            <Divider />
            <Box sx={{ overflowX: "auto" }}>
              <QueriesTable
                rows={paginated}
                loading={isFetching} // or isLoading
              />
            </Box>
            <Divider />
            <QueriesPagination
              count={filtered.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handleRowsPerPageChange}
            />
          </Card>
        </Stack>
      </Box>

      {/* QueryModal: shown if previewId (edit mode) or showAddModal (new mode) */}
      <QueryModal
        open={Boolean(previewId) || showAddModal}
        query={clickedQuery}
        onClose={() => {
          // If we were editing a specific query, remove previewId from URL
          if (previewId) {
            setSearchParams((prev) => {
              const newParams = new URLSearchParams(prev);
              newParams.delete("previewId");
              return newParams;
            });
          }
          // If we were adding, close the local state
          if (showAddModal) {
            handleCloseAddModal();
          }
        }}
      />
    </>
  );
}

/** Sort ascending/descending by createdAt. */
function applySort(rows: Query[], sortDir: "asc" | "desc" | undefined): Query[] {
  return [...rows].sort((a, b) => {
    if (sortDir === "asc") {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

/** Apply optional filters by statementType, question, etc. */
function applyFilters(rows: Query[], { statementType, question, sku }: Filters): Query[] {
  return rows.filter((r) => {
    if (statementType && r.statementType !== statementType) return false;
    if (question && !r.question.toLowerCase().includes(question.toLowerCase())) return false;
    if (sku) {
      // We don't store SKU in these queries, so skip them if SKU is set
      return false;
    }
    return true;
  });
}
