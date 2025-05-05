// import type * as React from "react";
// import Box from "@mui/material/Box";
// import Card from "@mui/material/Card";
// import Chip from "@mui/material/Chip";
// import Stack from "@mui/material/Stack";
// import Typography from "@mui/material/Typography";

// export function QuickStats4(): React.JSX.Element {
// 	return (
// 		<Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
// 			<Card>
// 				<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
// 					<Stack
// 						spacing={1}
// 						sx={{
// 							alignItems: "center",
// 							borderRight: { xs: "none", md: "1px solid var(--mui-palette-divider)" },
// 							borderBottom: { xs: "1px solid var(--mui-palette-divider)", md: "none" },
// 							display: "flex",
// 							justifyContent: "center",
// 							p: 3,
// 						}}
// 					>
// 						<Typography color="text.secondary" variant="overline">
// 							Total Income
// 						</Typography>
// 						<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
// 							<Typography variant="h6">
// 								{new Intl.NumberFormat("en-US", {
// 									style: "currency",
// 									currency: "USD",
// 									maximumFractionDigits: 0,
// 								}).format(54_355)}
// 							</Typography>
// 							<Chip color="success" label="+25%" size="small" variant="soft" />
// 						</Stack>
// 					</Stack>
// 					<Stack
// 						spacing={1}
// 						sx={{
// 							alignItems: "center",
// 							borderRight: { xs: "none", md: "1px solid var(--mui-palette-divider)" },
// 							borderBottom: { xs: "1px solid var(--mui-palette-divider)", md: "none" },
// 							display: "flex",
// 							justifyContent: "center",
// 							p: 3,
// 						}}
// 					>
// 						<Typography color="text.secondary" variant="overline">
// 							Total Expanses
// 						</Typography>
// 						<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
// 							<Typography variant="h6">
// 								{new Intl.NumberFormat("en-US", {
// 									style: "currency",
// 									currency: "USD",
// 									maximumFractionDigits: 0,
// 								}).format(13_250)}
// 							</Typography>
// 							<Chip color="success" label="+12%" size="small" variant="soft" />
// 						</Stack>
// 					</Stack>
// 					<Stack spacing={1} sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 3 }}>
// 						<Typography color="text.secondary" variant="overline">
// 							Net Profit
// 						</Typography>
// 						<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
// 							<Typography variant="h6">
// 								{new Intl.NumberFormat("en-US", {
// 									style: "currency",
// 									currency: "USD",
// 									maximumFractionDigits: 0,
// 								}).format(41_105)}
// 							</Typography>
// 							<Chip color="error" label="-20%" size="small" variant="soft" />
// 						</Stack>
// 					</Stack>
// 				</Box>
// 			</Card>
// 		</Box>
// 	);
// }
// "use client";

// import React from "react";
// import {
//   Box,
//   Card,
//   Chip,
//   Stack,
//   Typography,
// } from "@mui/material";

// export interface GlobalStats {
//   samples_used: number;
//   column_count: number;
//   row_count: number;
//   row_has_null_ratio: number;      // 0‒1
//   duplicate_row_count: number;
// }

// interface QuickStatsProps {
//   globalStats: GlobalStats;
//   synthGlobalStats?: GlobalStats;
// }

// type MetricKey = keyof Pick<
//   GlobalStats,
//   | "row_count"
//   | "column_count"
//   | "row_has_null_ratio"
//   | "duplicate_row_count"
// >;

// const METRICS: { key: MetricKey; label: string; fmt: (v: number) => string }[] = [
//   { key: "row_count", label: "Rows", fmt: (v) => v.toLocaleString() },
//   { key: "column_count", label: "Columns", fmt: (v) => v.toLocaleString() },
//   {
//     key: "row_has_null_ratio",
//     label: "Rows w/ Null (%)",
//     fmt: (v) => `${(v * 100).toFixed(1)}%`,
//   },
//   {
//     key: "duplicate_row_count",
//     label: "Duplicate Rows",
//     fmt: (v) => v.toLocaleString(),
//   },
// ];

// export function QuickStats({ globalStats, synthGlobalStats }: QuickStatsProps) {
//   return (
//     <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 2, mb: 3 }}>
//       <Card>
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: { xs: "1fr", md: `repeat(${METRICS.length}, 1fr)` },
//           }}
//         >
//           {METRICS.map(({ key, label, fmt }) => {
//             const val = globalStats[key];
//             const synthVal = synthGlobalStats?.[key];
//             let chip: React.ReactNode = null;

//             if (synthVal !== undefined) {
//               const diffRaw = synthVal - val;
//               const isPercent = key === "row_has_null_ratio";
//               const diffDisplay = isPercent
//                 ? `${((diffRaw) * 100).toFixed(1)}%`
//                 : diffRaw.toLocaleString();
//               const color = diffRaw >= 0 ? "error" : "success";
//               chip = (
//                 <Chip
//                   label={`${diffRaw >= 0 ? "+" : ""}${diffDisplay}`}
//                   size="small"
//                   color={color as any}
//                   variant="soft"
//                 />
//               );
//             }

//             return (
//               <Stack
//                 key={key}
//                 spacing={1}
//                 sx={{
//                   alignItems: "center",
//                   justifyContent: "center",
//                   p: 2,
//                   borderRight: {
//                     xs: "none",
//                     md: key !== METRICS[METRICS.length - 1].key
//                       ? "1px solid var(--mui-palette-divider)"
//                       : "none",
//                   },
//                   borderBottom: {
//                     xs: key !== METRICS[METRICS.length - 1].key
//                       ? "1px solid var(--mui-palette-divider)"
//                       : "none",
//                     md: "none",
//                   },
//                 }}
//               >
//                 <Typography color="text.secondary" variant="overline">
//                   {label}
//                 </Typography>
//                 <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
//                   <Typography variant="h6">{fmt(val)}</Typography>
//                   {chip}
//                 </Stack>
//               </Stack>
//             );
//           })}
//         </Box>
//       </Card>
//     </Box>
//   );
"use client";

import React from "react";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";

/* ---------- interfaces (unchanged) ---------------------------------- */
export interface GlobalStats {
  samples_used: number;
  column_count: number;
  row_count: number;
  row_has_null_ratio: number;
  unique_row_ratio: number;
  duplicate_row_count: number;
}

interface QuickStatsProps {
  globalStats: GlobalStats;
  synthGlobalStats?: GlobalStats;
}

/* ---------- metric config (unchanged) ------------------------------- */
type MetricKey =
  | "row_count"
  | "column_count"
  | "row_has_null_ratio"
  | "unique_row_ratio"
  | "duplicate_row_count"
  | "samples_used";

const METRICS: {
  key: MetricKey;
  label: string;
  fmt: (v: number) => string;
  higherIsBetter?: boolean;
}[] = [
  { key: "row_count", label: "Rows", fmt: (v) => v.toLocaleString() },
  { key: "column_count", label: "Columns", fmt: (v) => v.toLocaleString() },
  {
    key: "row_has_null_ratio",
    label: "Rows w/ Null (%)",
    fmt: (v) => `${(v * 100).toFixed(1)}%`,
    higherIsBetter: false,
  },
  {
    key: "unique_row_ratio",
    label: "Unique Row (%)",
    fmt: (v) => `${(v * 100).toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    key: "duplicate_row_count",
    label: "Duplicate Rows",
    fmt: (v) => v.toLocaleString(),
    higherIsBetter: false,
  },
  { key: "samples_used", label: "Samples Used", fmt: (v) => v.toLocaleString() },
];

/* ---------- component ------------------------------------------------ */
export function QuickStats({ globalStats, synthGlobalStats }: QuickStatsProps) {
  return (
    /* 🚫  removed bgcolor so no gray background */
    <Box sx={{ p: 2, mb: 3 }}>
      <Card>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: `repeat(${METRICS.length}, 1fr)`,
            },
          }}
        >
          {METRICS.map(({ key, label, fmt, higherIsBetter }) => {
            const baseVal = globalStats[key];
            const synthVal = synthGlobalStats?.[key];
            let chip: React.ReactNode = null;

            if (synthVal !== undefined) {
              const diff = synthVal - baseVal;
              if (diff !== 0) {
                const nice =
                  key === "row_has_null_ratio" || key === "unique_row_ratio"
                    ? `${(diff * 100).toFixed(1)}%`
                    : diff.toLocaleString();
                const good =
                  higherIsBetter ? diff > 0 : diff < 0; // green if “better”
                chip = (
                  <Chip
                    label={`${diff > 0 ? "+" : ""}${nice}`}
                    size="small"
                    color={good ? "success" : "error"}
                    variant="soft"
                  />
                );
              }
            }

            return (
              <Stack
                key={key}
                spacing={1}
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                  borderRight: {
                    xs: "none",
                    md:
                      key !== METRICS[METRICS.length - 1].key
                        ? "1px solid var(--mui-palette-divider)"
                        : "none",
                  },
                  borderBottom: {
                    xs:
                      key !== METRICS[METRICS.length - 1].key
                        ? "1px solid var(--mui-palette-divider)"
                        : "none",
                    md: "none",
                  },
                }}
              >
                <Typography color="text.secondary" variant="overline">
                  {label}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography variant="h6">{fmt(baseVal)}</Typography>
                  {chip}
                </Stack>
              </Stack>
            );
          })}
        </Box>
      </Card>
    </Box>
  );
}

