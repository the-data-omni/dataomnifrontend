// // src/app/(...) or wherever you place this file
// // We'll still name this file "products/page.tsx" for demonstration,
// // but effectively it's now "queries/page.tsx"

// import * as React from "react";
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import Card from "@mui/material/Card";
// import Divider from "@mui/material/Divider";
// import Stack from "@mui/material/Stack";
// import Typography from "@mui/material/Typography";
// import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
// import { Helmet } from "react-helmet-async";
// import { useSearchParams } from "react-router-dom";

// import type { Metadata } from "@/types/metadata";
// import { appConfig } from "@/config/app";
// import { paths } from "@/paths";
// import { dayjs } from "@/lib/dayjs";
// import { RouterLink } from "@/components/core/link";
// import { QueryModal } from "@/components/dashboard/product/query-modal";
// import { QueriesFilters } from "@/components/dashboard/product/products-filters";
// import { QueriesPagination } from "@/components/dashboard/product/products-pagination";
// import { QueriesTable } from "@/components/dashboard/product/queries-table";
// import type { Filters } from "@/components/dashboard/product/products-filters";

// /** 
//  * Our "Query" type, replacing Product. 
//  */
// export interface Query {
//   id: string;
//   question: string;
//   sql?: string;
//   image?: string | null;
//   category: string;
//   status: "published" | "draft";
//   createdAt: Date;
//   sku?: string;
// }

// /** 
//  * Page metadata 
//  */
// const metadata: Metadata = {
//   title: `List | Queries | Dashboard | ${appConfig.name}`,
// };

// /** 
//  * Example data matching the Query shape
//  */
// const queries: Query[] = [
//   {
//     id: "Q-005",
//     question: "How many signups occurred this month?",
//     sql: "SELECT COUNT(*) FROM signups WHERE ...;",
//     image: "/assets/product-5.png",
//     category: "Skincare",
//     status: "draft",
//     createdAt: dayjs().subtract(23, "minute").toDate(),
//     sku: "592_LDKDI",
//   },
//   {
//     id: "Q-004",
//     question: "Which products are top sellers?",
//     sql: "SELECT COUNT(*) FROM signups WHERE ...;",
//     image: "/assets/product-4.png",
//     category: "Skincare",
//     status: "published",
//     createdAt: dayjs().subtract(5, "minute").subtract(1, "hour").toDate(),
//     sku: "321_UWEAJT",
//   },
//   {
//     id: "Q-003",
//     question: "What is the total revenue by region?",
//     sql: "SELECT COUNT(*) FROM signups WHERE ...;",
//     image: "/assets/product-3.png",
//     category: "Skincare",
//     status: "draft",
//     createdAt: dayjs().subtract(43, "minute").subtract(3, "hour").toDate(),
//     sku: "211_QFEXJO",
//   },
//   {
//     id: "Q-002",
//     question: "Which categories are low in stock?",
//     sql: "SELECT COUNT(*) FROM signups WHERE ...;",
//     image: "/assets/product-2.png",
//     category: "Makeup",
//     status: "published",
//     createdAt: dayjs().subtract(15, "minute").subtract(4, "hour").toDate(),
//     sku: "978_UBFGJC",
//   },
//   {
//     id: "Q-001",
//     question: "What is the monthly churn rate?",
//     sql: "SELECT COUNT(*) FROM signups WHERE ...;",
//     image: "/assets/product-1.png",
//     category: "Healthcare",
//     status: "published",
//     createdAt: dayjs().subtract(39, "minute").subtract(7, "hour").toDate(),
//     sku: "401_1BBXBK",
//   },
// ];

// export function Page(): React.JSX.Element {
//   // Extract search params: category, status, sku, question, previewId, sortDir
//   const { category, status, sku, question, previewId, sortDir } = useExtractSearchParams();

//   // 1) Sort
//   const orderedQueries = applySort(queries, sortDir);

//   // 2) Filter
//   const filteredQueries = applyFilters(orderedQueries, { category, status, sku, question });

//   return (
//     <React.Fragment>
//       <Helmet>
//         <title>{metadata.title}</title>
//       </Helmet>
//       <Box
//         sx={{
//           maxWidth: "var(--Content-maxWidth)",
//           m: "var(--Content-margin)",
//           p: "var(--Content-padding)",
//           width: "var(--Content-width)",
//         }}
//       >
//         <Stack spacing={4}>
//           <Stack
//             direction={{ xs: "column", sm: "row" }}
//             spacing={3}
//             sx={{ alignItems: "flex-start" }}
//           >
//             <Box sx={{ flex: "1 1 auto" }}>
//               <Typography variant="h4">Queries</Typography>
//             </Box>
//             <div>
//               <Button
//                 component={RouterLink}
//                 href={paths.dashboard.products.create}
//                 startIcon={<PlusIcon />}
//                 variant="contained"
//               >
//                 Add Query
//               </Button>
//             </div>
//           </Stack>

//           <Card>
//             {/* Pass existing filters => category, status, sku, question */}
//             <QueriesFilters filters={{ category, status, sku, question }} sortDir={sortDir} />
//             <Divider />
//             <Box sx={{ overflowX: "auto" }}>
//               {/* The QueriesTable => eye icon sets ?previewId=... in the URL */}
//               <QueriesTable rows={filteredQueries} />
//             </Box>
//             <Divider />
//             {/* For demonstration, page=0 => you can wire real pagination if needed */}
//             <QueriesPagination count={filteredQueries.length} page={0} />
//           </Card>
//         </Stack>
//       </Box>

//       {/* If previewId is present => open the QueryModal */}
//       <QueryModal 
//         open={Boolean(previewId)} 
//         // We pass the `previewId` so the modal knows which item to show
//         productId={previewId}
//       />
//     </React.Fragment>
//   );
// }

// /** 
//  * Pulling search params => question, category, status, sku, etc.
//  */
// function useExtractSearchParams(): {
//   category?: string;
//   status?: string;
//   sku?: string;
//   question?: string;
//   previewId?: string;
//   sortDir?: "asc" | "desc";
// } {
//   const [searchParams] = useSearchParams();

//   return {
//     category: searchParams.get("category") || undefined,
//     status: searchParams.get("status") || undefined,
//     sku: searchParams.get("sku") || undefined,
//     question: searchParams.get("question") || undefined,
//     previewId: searchParams.get("previewId") || undefined,
//     sortDir: (searchParams.get("sortDir") as "asc" | "desc") || undefined,
//   };
// }

// /** 
//  * Sorting by createdAt
//  */
// function applySort(rows: Query[], sortDir: "asc" | "desc" | undefined): Query[] {
//   return [...rows].sort((a, b) => {
//     if (sortDir === "asc") {
//       return a.createdAt.getTime() - b.createdAt.getTime();
//     }
//     return b.createdAt.getTime() - a.createdAt.getTime();
//   });
// }

// /** 
//  * If question is provided => partial match on row.question, 
//  * plus your existing category/status/sku checks 
//  */
// function applyFilters(rows: Query[], { category, status, sku, question }: Filters): Query[] {
//   return rows.filter((row) => {
//     if (category && row.category !== category) {
//       return false;
//     }
//     if (status && row.status !== status) {
//       return false;
//     }
//     if (sku && row.sku && !row.sku.toLowerCase().includes(sku.toLowerCase())) {
//       return false;
//     }
//     if (question && !row.question.toLowerCase().includes(question.toLowerCase())) {
//       return false;
//     }
//     return true;
//   });
// }
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
import { dayjs } from "@/lib/dayjs";
import { RouterLink } from "@/components/core/link";

// The same modal, but we’ll update it to accept a `query?: Query`
import { QueryModal } from "@/components/dashboard/product/query-modal";

// Our existing filters + pagination
import { QueriesFilters } from "@/components/dashboard/product/products-filters";
import { QueriesPagination } from "@/components/dashboard/product/products-pagination";
import { QueriesTable } from "@/components/dashboard/product/queries-table";
// import type { Filters } from "@/components/dashboard/product/products-filters";

// The "Query" interface: now let's define it here or in a shared file
export interface Query {
  id: string;
  question: string;
  sql?: string;
  image?: string | null;
  category: string;
  status: "published" | "draft";
  createdAt: Date;
  sku?: string;
}

/** Example metadata */
const metadata: Metadata = {
  title: `List | Queries | Dashboard | ${appConfig.name}`,
};

/** 
 * Example data that includes a distinct `sql` for each row
 */
const queries: Query[] = [
  {
    id: "Q-005",
    question: "How many signups occurred this month?",
    sql: "SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 day';",
    image: "/assets/product-5.png",
    category: "Skincare",
    status: "draft",
    createdAt: dayjs().subtract(23, "minute").toDate(),
    sku: "592_LDKDI",
  },
  {
    id: "Q-004",
    question: "Which products are top sellers?",
    sql: "SELECT product_id, SUM(quantity) FROM orders GROUP BY product_id ORDER BY SUM(quantity) DESC;",
    image: "/assets/product-4.png",
    category: "Skincare",
    status: "published",
    createdAt: dayjs().subtract(5, "minute").subtract(1, "hour").toDate(),
    sku: "321_UWEAJT",
  },
  {
    id: "Q-003",
    question: "What is the total revenue by region?",
    sql: "SELECT region, SUM(amount) FROM orders GROUP BY region ORDER BY region;",
    image: "/assets/product-3.png",
    category: "Skincare",
    status: "draft",
    createdAt: dayjs().subtract(43, "minute").subtract(3, "hour").toDate(),
    sku: "211_QFEXJO",
  },
  {
    id: "Q-002",
    question: "Which categories are low in stock?",
    sql: "SELECT category, SUM(stock) FROM inventory GROUP BY category HAVING SUM(stock) < 50;",
    image: "/assets/product-2.png",
    category: "Makeup",
    status: "published",
    createdAt: dayjs().subtract(15, "minute").subtract(4, "hour").toDate(),
    sku: "978_UBFGJC",
  },
  {
    id: "Q-001",
    question: "What is the monthly churn rate?",
    sql: "SELECT (COUNT(*) FILTER (WHERE unsubscribed))::decimal / COUNT(*) * 100 AS churn_pct FROM users;",
    image: "/assets/product-1.png",
    category: "Healthcare",
    status: "published",
    createdAt: dayjs().subtract(39, "minute").subtract(7, "hour").toDate(),
    sku: "401_1BBXBK",
  },
];

export function Page(): React.JSX.Element {
  // Pull out search params => category, status, sku, question, previewId, sortDir
  const { category, status, sku, question, previewId, sortDir } = useExtractSearchParams();

  // 1) Sort & 2) Filter
  const ordered = applySort(queries, sortDir);
  const filtered = applyFilters(ordered, { category, status, sku, question });

  // **Find** the row the user clicked, if any
  const clickedQuery = React.useMemo(() => {
    if (!previewId) return undefined;
    return queries.find((q) => q.id === previewId);
  }, [previewId]);

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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ alignItems: "flex-start" }}
          >
            <Box sx={{ flex: "1 1 auto" }}>
              <Typography variant="h4">Queries</Typography>
            </Box>
            <div>
              <Button
                component={RouterLink}
                href={paths.dashboard.products.create}
                startIcon={<PlusIcon />}
                variant="contained"
              >
                Add Query
              </Button>
            </div>
          </Stack>

          <Card>
            <QueriesFilters filters={{ category, status, sku, question }} sortDir={sortDir} />
            <Divider />
            <Box sx={{ overflowX: "auto" }}>
              <QueriesTable rows={filtered} />
            </Box>
            <Divider />
            <QueriesPagination count={filtered.length} page={0} />
          </Card>
        </Stack>
      </Box>

      {/* Pass the found "Query" object => the modal can show its question/sql, etc. */}
      <QueryModal open={Boolean(previewId)} query={clickedQuery} />
    </React.Fragment>
  );
}

/** 
 * Reads search params => question, category, status, sku, previewId, sortDir
 */
function useExtractSearchParams(): {
  category?: string;
  status?: string;
  sku?: string;
  question?: string;
  previewId?: string;
  sortDir?: "asc" | "desc";
} {
  const [searchParams] = useSearchParams();

  return {
    category: searchParams.get("category") || undefined,
    status: searchParams.get("status") || undefined,
    sku: searchParams.get("sku") || undefined,
    question: searchParams.get("question") || undefined,
    previewId: searchParams.get("previewId") || undefined,
    sortDir: (searchParams.get("sortDir") as "asc" | "desc") || undefined,
  };
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

interface Filters {
  category?: string;
  status?: string;
  sku?: string;
  question?: string;
}

/** Check category, status, SKU, question partial match */
function applyFilters(rows: Query[], { category, status, sku, question }: Filters): Query[] {
  return rows.filter((r) => {
    if (category && r.category !== category) return false;
    if (status && r.status !== status) return false;
    if (sku && r.sku && !r.sku.toLowerCase().includes(sku.toLowerCase())) return false;
    if (question && !r.question.toLowerCase().includes(question.toLowerCase())) return false;
    return true;
  });
}
