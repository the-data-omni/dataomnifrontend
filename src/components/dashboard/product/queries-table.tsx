"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";

import { paths } from "@/paths";
import type { ColumnDef } from "@/components/core/data-table";
import { DataTable } from "@/components/core/data-table";
import { RouterLink } from "@/components/core/link";

export interface Query {
  id: string;
  question: string;
  sql?: string;
  statementType: string;
  count: number;
  createdAt: Date; // replaced with new "creation_time" from the API
  avgExecutionTime?: number | null;
  avgTotalBytesProcessed?: number | null;
}

export interface QueriesTableProps {
  rows?: Query[];
  loading?: boolean;
}

const columns: ColumnDef<Query>[] = [
  {
    name: "Question",
    width: "40%",
    formatter: (row: Query): React.JSX.Element => (
      <Box sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
        <Link
          color="text.primary"
          component={RouterLink}
          href={paths.dashboard.products.preview(row.id)}
          variant="subtitle2"
        >
          {row.question}
        </Link>
        <Typography color="text.secondary" variant="body2">
          {row.statementType || "N/A"}
        </Typography>
      </Box>
    ),
  },
  {
    name: "SQL Query",
    width: "300px",
    formatter: (row: Query) => {
      if (!row.sql) return "";
      const shortSql = row.sql.length > 20 ? row.sql.slice(0, 20) + "..." : row.sql;
      return shortSql;
    },
  },
  {
    name: "Created",
    width: "180px",
    formatter: (row: Query) => row.createdAt.toLocaleString(),
  },
  {
    name: "Count",
    width: "150px",
    formatter(row: Query): React.JSX.Element {
      return <Chip label={row.count} size="small" variant="outlined" />;
    },
  },
  {
    name: "Actions",
    width: "100px",
    hideName: true,
    align: "right",
    formatter: (row: Query): React.JSX.Element => (
      <IconButton
        component={RouterLink}
        href={`${paths.dashboard.products.list}?previewId=${row.id}`}
      >
        <EyeIcon />
      </IconButton>
    ),
  },
];

export function QueriesTable({ rows = [], loading = false }: QueriesTableProps): React.JSX.Element {
  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DataTable<Query> columns={columns} rows={rows} />
      {rows.length === 0 && (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary" sx={{ textAlign: "center" }} variant="body2">
            No queries found
          </Typography>
        </Box>
      )}
    </>
  );
}
