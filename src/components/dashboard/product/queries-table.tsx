"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CheckCircle as CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Clock as ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";

import { paths } from "@/paths";
import type { ColumnDef } from "@/components/core/data-table";
import { DataTable } from "@/components/core/data-table";
import { RouterLink } from "@/components/core/link";

/** The new "Query" object, similar to Product but for questions */
export interface Query {
  id: string;
  question: string;     // e.g. "How many users signed up last week?"
  sql?: string;         // e.g. "SELECT COUNT(*) ...;"
  category: string;
  status: "published" | "draft";
  createdAt: Date;
}

/** Similar columns but referencing question, sql, category, status. */
const columns = [
  {
    /** The "Name" column is now "Question" */
    formatter: (row: Query): React.JSX.Element => (
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        {/* An icon or placeholder box (no changes here) */}
        <Box
          sx={{
            alignItems: "center",
            bgcolor: "var(--mui-palette-background-level2)",
            borderRadius: 1,
            display: "flex",
            height: "64px",
            justifyContent: "center",
            width: "64px",
          }}
        >
          <EyeIcon fontSize="var(--icon-fontSize-md)" />
        </Box>

        <div>
          <Link
            color="text.primary"
            component={RouterLink}
            href={paths.dashboard.products.preview(row.id)} 
            sx={{ whiteSpace: "nowrap" }}
            variant="subtitle2"
          >
            {row.question}
          </Link>
          <Typography color="text.secondary" variant="body2">
            in {row.category}
          </Typography>
        </div>
      </Stack>
    ),
    name: "Question",
    width: "300px",
  },
  {
    /** "SQL Query" column */
    field: "sql",
    name: "SQL Query",
    width: "300px",
  },
  {
    /** "Created" column */
    formatter: (row: Query) => new Date(row.createdAt).toLocaleString(),
    name: "Created",
    width: "180px",
  },
  {
    /** "Status" chip logic */
    formatter(row: Query): React.JSX.Element {
      const mapping = {
        draft: {
          label: "Draft",
          icon: <ClockIcon color="var(--mui-palette-secondary-main)" />,
        },
        published: {
          label: "Published",
          icon: <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" />,
        },
      } as const;
      const { label, icon } = mapping[row.status] ?? { label: "Unknown", icon: null };

      return <Chip icon={icon} label={label} size="small" variant="outlined" />;
    },
    name: "Status",
    width: "150px",
  },
  {
    /**
     * "Actions" => Eye icon => Now navigates to ?previewId=row.id
     * so that your page can detect `previewId` and open the modal
     */
    formatter: (row: Query): React.JSX.Element => (
      <IconButton
        component={RouterLink}
        href={`${paths.dashboard.products.list}?previewId=${row.id}`}
      >
        <EyeIcon />
      </IconButton>
    ),
    name: "Actions",
    hideName: true,
    width: "100px",
    align: "right",
  },
] satisfies ColumnDef<Query>[];

export interface QueriesTableProps {
  rows?: Query[];
}

/**
 * QueriesTable => Renders a DataTable of "Query" rows
 * with columns for question, sql, createdAt, status, etc.
 */
export function QueriesTable({ rows = [] }: QueriesTableProps): React.JSX.Element {
  return (
    <>
      <DataTable<Query> columns={columns} rows={rows} />
      {rows.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary" sx={{ textAlign: "center" }} variant="body2">
            No queries found
          </Typography>
        </Box>
      ) : null}
    </>
  );
}
