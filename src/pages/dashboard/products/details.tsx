// details.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { Helmet } from "react-helmet-async";

import type { Metadata } from "@/types/metadata";
import { appConfig } from "@/config/app";
import { paths } from "@/paths";
import { RouterLink } from "@/components/core/link";
import { QueryEditForm } from "@/components/dashboard/product/product-edit-form"; // <-- You might put your new form here

const metadata = { title: `Details | Queries | Dashboard | ${appConfig.name}` } satisfies Metadata;

export function Page(): React.JSX.Element {
  return (
    <React.Fragment>
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
          <Stack spacing={3}>
            <div>
              <Link
                color="text.primary"
                component={RouterLink}
                href={paths.dashboard.products.list} // or paths.dashboard.queries.list if you have it
                sx={{ alignItems: "center", display: "inline-flex", gap: 1 }}
                variant="subtitle2"
              >
                <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
                Queries
              </Link>
            </div>
            <div>
              <Typography variant="h4">Edit Query</Typography>
            </div>
          </Stack>

          {/* Pass a "query" object to QueryEditForm with the fields question, statementType, sql */}
          <QueryEditForm
            query={{
              id: "Q-001",
              question: "Which items sold the most last month?",
              statementType: "SELECT",
              sql: "SELECT product_id, SUM(quantity) AS total_sold FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 day' GROUP BY product_id ORDER BY total_sold DESC;",
            }}
          />
        </Stack>
      </Box>
    </React.Fragment>
  );
}
