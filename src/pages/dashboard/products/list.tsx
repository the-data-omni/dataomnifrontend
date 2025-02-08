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

import type { Metadata } from "@/types/metadata";
import { appConfig } from "@/config/app";
import { paths } from "@/paths";
import { RouterLink } from "@/components/core/link";

// Table & modal
import { QueriesTable, Query } from "@/components/dashboard/product/queries-table";
import { QueryModal } from "@/components/dashboard/product/query-modal";

// Filters & pagination
import { QueriesFilters } from "@/components/dashboard/product/products-filters";
import { QueriesPagination } from "@/components/dashboard/product/products-pagination";

interface Filters {
  category?: string;
  question?: string;
  sku?: string;
  sortDir?: "asc" | "desc";
}

const metadata: Metadata = {
  title: `List | Queries | Dashboard | ${appConfig.name}`,
};

export function Page(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1) Extract standard filter props
  const category = searchParams.get("category") || undefined;
  const question = searchParams.get("question") || undefined;
  const sku = searchParams.get("sku") || undefined;
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || undefined;

  // For the modal
  const previewId = searchParams.get("previewId") || undefined;

  // 2) Extract pagination from searchParams
  const page = parseInt(searchParams.get("page") || "0", 10);  // default 0
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "5", 10); // default 5

  // 3) Queries + loading
  const [queries, setQueries] = React.useState<Query[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:5000/queries_and_questions")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then((data: Array<{ count: number; query: string; question: string }>) => {
        const transformed = data.map((item, index) => ({
          id: `Q-${index + 1}`,
          question: item.question,
          sql: item.query,
          count: item.count,
          category: "N/A",
          createdAt: new Date(),
        }));
        setQueries(transformed);
      })
      .catch((err) => {
        console.error("Error fetching queries:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 4) Filter & sort
  const filtered = React.useMemo(() => {
    const f = applyFilters(queries, { category, question, sku });
    return applySort(f, sortDir);
  }, [queries, category, question, sku, sortDir]);

  // 5) Slice the rows according to (page, rowsPerPage)
  const paginated = React.useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, page, rowsPerPage]);

  // 6) Identify row for preview modal
  const clickedQuery: Query | undefined = React.useMemo(() => {
    if (!previewId) return undefined;
    return queries.find((q) => q.id === previewId);
  }, [previewId, queries]);

  // 7) Handlers for pagination changes
  const handlePageChange = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      // Update the search params
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
        // Also reset page to 0, so you don’t end up with an out-of-range page
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
            <Box>
              <Button
                component={RouterLink}
                href={paths.dashboard.products.create}
                startIcon={<PlusIcon />}
                variant="contained"
              >
                Add Query
              </Button>
            </Box>
          </Stack>

          <Card>
            <QueriesFilters filters={{ category, question, sku }} sortDir={sortDir} />
            <Divider />
            <Box sx={{ overflowX: "auto" }}>
              {/* Show table */}
              <QueriesTable rows={paginated} loading={loading} />
            </Box>
            <Divider />

            {/* 
              The total # of items is filtered.length
              The current page is "page"
              The current rows-per-page is "rowsPerPage"
              We have real callbacks
            */}
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

      <QueryModal open={Boolean(previewId)} query={clickedQuery} />
    </>
  );
}

/** Sort by createdAt ascending/descending */
function applySort(rows: Query[], sortDir: "asc" | "desc" | undefined): Query[] {
  return [...rows].sort((a, b) => {
    if (sortDir === "asc") {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function applyFilters(
  rows: Query[],
  { category, question, sku }: Filters
): Query[] {
  return rows.filter((r) => {
    if (category && r.category !== category) return false;
    if (question && !r.question.toLowerCase().includes(question.toLowerCase())) return false;
    if (sku) {
      // We have no 'sku' in the new data, but keep or remove as needed
      return false;
    }
    return true;
  });
}
