"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import type { Metadata } from "@/types/metadata";
import { appConfig } from "@/config/app";
import { paths } from "@/paths";
import { RouterLink } from "@/components/core/link";

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

export function Page(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const statementType = searchParams.get("statementType") || undefined;
  const question = searchParams.get("question") || undefined;
  const sku = searchParams.get("sku") || undefined;
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || undefined;
  const previewId = searchParams.get("previewId") || undefined;

  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "5", 10);

  /**
   * 1) useReactQuery to fetch existing queries
   */
  const { data: queriesData, isLoading, refetch } = useQuery({
    queryKey: ["queriesAndQuestions"],
    queryFn: async (): Promise<Query[]> => {
      const res = await fetch("http://127.0.0.1:5000/queries_and_questions", {
        method: 'GET',
        credentials: 'include', // <= This is where you include credentials
        headers: {
          'Content-Type': 'application/json',
        }});
      
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data: Array<{
        avg_execution_time: number | null;
        avg_total_bytes_processed: number | null;
        count: number;
        creation_time: string;
        query: string;
        question: string;
        statement_type: string;
      }> = await res.json();

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
    },
    staleTime: Infinity,
  });

  // 2) Keep local state to show/hide the "Add Query" modal
  const [showAddModal, setShowAddModal] = React.useState(false);

  // If user clicks "Add Query" button, we open the modal in "add" mode
  const handleAddQuery = React.useCallback(() => {
    setShowAddModal(true);
  }, []);

  // We'll close the add-modal on "save" or "cancel"
  const handleCloseAddModal = React.useCallback(() => {
    setShowAddModal(false);
  }, []);

  // Filter + sort
  const filtered = React.useMemo(() => {
    if (!queriesData) return [];
    const f = applyFilters(queriesData, { statementType, question, sku });
    return applySort(f, sortDir);
  }, [queriesData, statementType, question, sku, sortDir]);

  const paginated = React.useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, page, rowsPerPage]);

  const clickedQuery: Query | undefined = React.useMemo(() => {
    if (!previewId || !queriesData) return undefined;
    return queriesData.find((q) => q.id === previewId);
  }, [previewId, queriesData]);

  // Refresh
  const handleRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  // For pagination
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
              {/* Instead of navigating to a new page, we show the same modal in "add" mode */}
              <Button
                onClick={handleAddQuery}
                startIcon={<PlusIcon />}
                variant="contained"
              >
                Add Query
              </Button>

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
              <QueriesTable rows={paginated} loading={isLoading} />
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

      {/* 3) We use the SAME modal for Add (showAddModal) or Edit (previewId). */}
      <QueryModal
        open={Boolean(previewId) || showAddModal}
        // if previewId => it's an "edit" of that query
        // else if showAddModal => it's a "new" query (undefined => we handle in modal)
        query={clickedQuery}
        onClose={() => {
          // if we were in "edit" mode, remove previewId from URL
          if (previewId) {
            setSearchParams((prev) => {
              const newParams = new URLSearchParams(prev);
              newParams.delete("previewId");
              return newParams;
            });
          }
          // if we were in "add" mode, close local state
          if (showAddModal) {
            handleCloseAddModal();
          }
        }}
      />
    </>
  );
}

/** Sort ascending/descending by createdAt */
function applySort(rows: Query[], sortDir: "asc" | "desc" | undefined): Query[] {
  return [...rows].sort((a, b) => {
    if (sortDir === "asc") {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function applyFilters(rows: Query[], { statementType, question, sku }: Filters): Query[] {
  return rows.filter((r) => {
    if (statementType && r.statementType !== statementType) return false;
    if (question && !r.question.toLowerCase().includes(question.toLowerCase())) return false;
    if (sku) {
      return false; // we don't store sku in the new data
    }
    return true;
  });
}
