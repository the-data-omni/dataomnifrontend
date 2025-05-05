

// "use client";

// import React from "react";
// import { Box, Typography, Grid } from "@mui/material";
// import ReactECharts from "echarts-for-react";

// // Single-profile chart generators
// import {
//   getOverallNullCountOption,
//   getOverallUniquenessOption,
//   getNumericalBoxplotOption,
//   getCategoricalBarChartOption,
//   getCategoricalPieChartOption,
// } from "./chartOptions";

// // Side-by-side chart generators
// import {
//   getOverallNullCountOptionSideBySide,
//   getOverallUniquenessOptionSideBySide,
//   getTwoBoxplotOption,
//   getTwoCategoricalBarChartOption,
//   getTwoCategoricalPieChartOption,
// } from "./chartOptions";

// import { DataStats } from "./profileTypes";

// interface Profile {
//   data_stats: DataStats[];
//   // add other properties if needed
// }

// interface ProfileChartTabProps {
//   profile: Profile;            // Required: original profile
//   profileSynth?: Profile;      // Optional: synthetic profile
// }

// export function ProfileChartTab({ profile, profileSynth }: ProfileChartTabProps) {
//   // Common chart style
//   const chartStyle = { height: 200, width: "100%" };

//   if (!profileSynth) {
//     /****************************************************************
//      * CASE 1: NO SYNTHETIC PROFILE
//      * We simply show the original charts for "profile".
//      ****************************************************************/
//     const dataStats = profile.data_stats;

//     // Overall charts
//     const overallNullCountOption = getOverallNullCountOption(dataStats);
//     const overallUniquenessOption = getOverallUniquenessOption(dataStats);

//     // Numeric columns
//     const numericOptions = dataStats
//       .filter((col) => !col.categorical && (col.data_type === "int" || col.data_type === "float"))
//       .map((col) => ({
//         column: col.column_name,
//         option: getNumericalBoxplotOption(col),
//       }))
//       .filter((item) => item.option !== null);

//     // Categorical columns
//     const categoricalOptions = dataStats
//       .filter((col) => col.categorical)
//       .map((col) => {
//         const barOption = getCategoricalBarChartOption(col);
//         const pieOption = getCategoricalPieChartOption(col);
//         return { column: col.column_name, barOption, pieOption };
//       })
//       .filter((item) => item.barOption !== null || item.pieOption !== null);

//     return (
//       <Box>
//         <Typography variant="h6" gutterBottom>
//           Dataset Profile (Original Only)
//         </Typography>

//         {/* Overall Charts */}
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={6}>
//             <ReactECharts option={overallNullCountOption} style={chartStyle} />
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <ReactECharts option={overallUniquenessOption} style={chartStyle} />
//           </Grid>
//         </Grid>

//         {/* Numerical Boxplots */}
//         {numericOptions.length > 0 && (
//           <Box mt={2}>
//             <Typography variant="h6" gutterBottom>
//               Numerical Columns Distributions
//             </Typography>
//             <Grid container spacing={2}>
//               {numericOptions.map((item) => (
//                 <Grid item xs={12} sm={6} md={4} key={item.column}>
//                   <ReactECharts option={item.option!} style={chartStyle} />
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}

//         {/* Categorical Bar Charts */}
//         {categoricalOptions.length > 0 && (
//           <Box mt={2}>
//             <Typography variant="h6" gutterBottom>
//               Categorical Columns (Bar Chart)
//             </Typography>
//             <Grid container spacing={2}>
//               {categoricalOptions.map((item) => (
//                 <Grid item xs={12} sm={6} md={4} key={item.column}>
//                   {item.barOption && (
//                     <ReactECharts option={item.barOption} style={chartStyle} />
//                   )}
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}

//         {/* Categorical Pie Charts */}
//         {categoricalOptions.length > 0 && (
//           <Box mt={2}>
//             <Typography variant="h6" gutterBottom>
//               Categorical Columns (Pie Chart)
//             </Typography>
//             <Grid container spacing={2}>
//               {categoricalOptions.map((item) => (
//                 <Grid item xs={12} sm={6} md={4} key={item.column}>
//                   {item.pieOption && (
//                     <ReactECharts option={item.pieOption} style={chartStyle} />
//                   )}
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}
//       </Box>
//     );
//   } else {
//     /****************************************************************
//      * CASE 2: SYNTHETIC PROFILE PROVIDED
//      * Show side-by-side comparison
//      ****************************************************************/
//     // Overall side-by-side
//     const overallNullCountOption = getOverallNullCountOptionSideBySide(
//       profile.data_stats,
//       profileSynth.data_stats
//     );
//     const overallUniquenessOption = getOverallUniquenessOptionSideBySide(
//       profile.data_stats,
//       profileSynth.data_stats
//     );

//     // Numeric columns: we only show charts for columns in the original
//     // (assuming same column names exist in the synthetic).
//     const numericColumns = profile.data_stats.filter(
//       (col) => !col.categorical && (col.data_type === "int" || col.data_type === "float")
//     );
//     const numericCharts = numericColumns.map((origCol) => {
//       const synthCol = profileSynth.data_stats.find(
//         (s) => s.column_name === origCol.column_name
//       );
//       if (!synthCol) return null;
//       const option = getTwoBoxplotOption(origCol.column_name, origCol.statistics, synthCol.statistics);
//       return option ? { column: origCol.column_name, option } : null;
//     }).filter((item) => item !== null);

//     // Categorical columns: likewise
//     const categoricalColumns = profile.data_stats.filter((col) => col.categorical);

//     const categoricalChartsBar = categoricalColumns.map((origCol) => {
//       const synthCol = profileSynth.data_stats.find(
//         (s) => s.column_name === origCol.column_name
//       );
//       if (!synthCol) return null;
//       const option = getTwoCategoricalBarChartOption(
//         origCol.column_name,
//         origCol.statistics.categorical_count || {},
//         synthCol.statistics.categorical_count || {}
//       );
//       return option ? { column: origCol.column_name, option } : null;
//     }).filter((item) => item !== null);

//     const categoricalChartsPie = categoricalColumns.map((origCol) => {
//       const synthCol = profileSynth.data_stats.find(
//         (s) => s.column_name === origCol.column_name
//       );
//       if (!synthCol) return null;
//       const option = getTwoCategoricalPieChartOption(
//         origCol.column_name,
//         origCol.statistics.categorical_count || {},
//         synthCol.statistics.categorical_count || {}
//       );
//       return option ? { column: origCol.column_name, option } : null;
//     }).filter((item) => item !== null);

//     return (
//       <Box>
//         <Typography variant="h6" gutterBottom>
//           Dataset Profile Comparison Charts
//         </Typography>

//         {/* Overall Charts */}
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={6}>
//             <ReactECharts option={overallNullCountOption} style={chartStyle} />
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <ReactECharts option={overallUniquenessOption} style={chartStyle} />
//           </Grid>
//         </Grid>

//         {/* Numerical Boxplot Charts */}
//         {numericCharts.length > 0 && (
//           <Box mt={2}>
//             <Typography variant="h6" gutterBottom>
//               Numerical Columns Distributions
//             </Typography>
//             <Grid container spacing={2}>
//               {numericCharts.map((item: any) => (
//                 <Grid item xs={12} sm={6} md={4} key={item.column}>
//                   <ReactECharts option={item.option} style={chartStyle} />
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}

//         {/* Categorical Bar Charts */}
//         {categoricalChartsBar.length > 0 && (
//           <Box mt={2}>
//             <Typography variant="h6" gutterBottom>
//               Categorical Columns (Bar Chart)
//             </Typography>
//             <Grid container spacing={2}>
//               {categoricalChartsBar.map((item: any) => (
//                 <Grid item xs={12} sm={6} md={4} key={item.column}>
//                   <ReactECharts option={item.option} style={chartStyle} />
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}

//         {/* Categorical Pie Charts */}
//         {categoricalChartsPie.length > 0 && (
//           <Box mt={2}>
//             <Typography variant="h6" gutterBottom>
//               Categorical Columns (Pie Chart)
//             </Typography>
//             <Grid container spacing={2}>
//               {categoricalChartsPie.map((item: any) => (
//                 <Grid item xs={12} sm={6} md={4} key={item.column}>
//                   <ReactECharts option={item.option} style={chartStyle} />
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}
//       </Box>
//     );
//   }
// }
// profilechartTab.tsx
// profilechartTab.tsx
// "use client";

// import React, { useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import ReactECharts from "echarts-for-react";

// import {
//   getNumericalBoxplotOption,
//   getCategoricalBarChartOption,
//   getCategoricalPieChartOption,
//   getTwoBoxplotOption,
//   getTwoCategoricalBarChartOption,
//   getTwoCategoricalPieChartOption,
// } from "./chartOptions";

// import { DataStats } from "./profileTypes";

// interface Profile {
//   data_stats: DataStats[];
// }

// interface ProfileChartTabProps {
//   profile: Profile;
//   profileSynth?: Profile;
// }

// export function ProfileChartTab({ profile, profileSynth }: ProfileChartTabProps) {
//   /* ------------------------------------------------------------------ */
//   /* column list + state                                                */
//   /* ------------------------------------------------------------------ */
//   const allColumns = useMemo(() => profile.data_stats.map((c) => c.column_name), [profile]);
//   const [selectedColumn, setSelectedColumn] = useState(allColumns[0] || "");

//   const chartStyle = { height: 320, width: "100%" };

//   /* ------------------------------------------------------------------ */
//   /* helpers to find column meta in profiles                            */
//   /* ------------------------------------------------------------------ */
//   const findCol = (cols: DataStats[], name: string) =>
//     cols.find((c) => c.column_name === name);

//   const origCol = findCol(profile.data_stats, selectedColumn);
//   const synthCol = profileSynth ? findCol(profileSynth.data_stats, selectedColumn) : undefined;

//   const isNumeric =
//     origCol && !origCol.categorical && (origCol.data_type === "int" || origCol.data_type === "float");
//   const isCategorical = origCol && origCol.categorical;

//   /* ------------------------------------------------------------------ */
//   /* chart builders                                                     */
//   /* ------------------------------------------------------------------ */
//   const renderCharts = () => {
//     if (!origCol) return null;

//     /* ------ numeric -------------------------------------------------- */
//     if (isNumeric) {
//       if (profileSynth && synthCol) {
//         const opt = getTwoBoxplotOption(
//           selectedColumn,
//           origCol.statistics,
//           synthCol.statistics
//         );
//         return opt && <ReactECharts option={opt} style={chartStyle} />;
//       }
//       const opt = getNumericalBoxplotOption(origCol);
//       return opt && <ReactECharts option={opt} style={chartStyle} />;
//     }

//     /* ------ categorical --------------------------------------------- */
//     if (isCategorical) {
//       if (profileSynth && synthCol) {
//         const barOpt = getTwoCategoricalBarChartOption(
//           selectedColumn,
//           origCol.statistics.categorical_count || {},
//           synthCol.statistics.categorical_count || {}
//         );
//         const pieOpt = getTwoCategoricalPieChartOption(
//           selectedColumn,
//           origCol.statistics.categorical_count || {},
//           synthCol.statistics.categorical_count || {}
//         );
//         return (
//           <>
//             {barOpt && <ReactECharts option={barOpt} style={chartStyle} />}
//             {pieOpt && <ReactECharts option={pieOpt} style={chartStyle} />}
//           </>
//         );
//       }
//       const barOpt = getCategoricalBarChartOption(origCol);
//       const pieOpt = getCategoricalPieChartOption(origCol);
//       return (
//         <>
//           {barOpt && <ReactECharts option={barOpt} style={chartStyle} />}
//           {pieOpt && <ReactECharts option={pieOpt} style={chartStyle} />}
//         </>
//       );
//     }

//     return null; // unsupported column type
//   };

//   /* ------------------------------------------------------------------ */
//   /* UI                                                                 */
//   /* ------------------------------------------------------------------ */
//   return (
//     <Box>
//       <Typography variant="h6" gutterBottom>
//         Dataset Profile Charts
//       </Typography>

//       {/* column selector */}
//       <FormControl fullWidth size="small" sx={{ mb: 3 }}>
//         <InputLabel id="column-select-label">Column</InputLabel>
//         <Select
//           labelId="column-select-label"
//           value={selectedColumn}
//           label="Column"
//           onChange={(e) => setSelectedColumn(e.target.value as string)}
//         >
//           {allColumns.map((col) => (
//             <MenuItem key={col} value={col}>
//               {col}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       {/* chart(s) for the selected column */}
//       {renderCharts()}
//     </Box>
//   );
// }

"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import ReactECharts from "echarts-for-react";

import {
  getNumericalBoxplotOption,
  getCategoricalBarChartOption,
  getCategoricalPieChartOption,
  getTwoBoxplotOption,
  getTwoCategoricalBarChartOption,
  getTwoCategoricalPieChartOption,
} from "./chartOptions";

import { QuickStats, GlobalStats } from "@/components/widgets/quick-stats/quick-stats-4";
import { DataStats } from "./profileTypes";

/* ---------- interfaces -------------------------------------------------- */
interface Profile {
  global_stats: GlobalStats;
  data_stats: DataStats[];
}

interface ProfileChartTabProps {
  profile: Profile;
  profileSynth?: Profile;
}

/* ---------- component --------------------------------------------------- */
export function ProfileChartTab({
  profile,
  profileSynth,
}: ProfileChartTabProps) {
  const allColumns = useMemo(
    () => profile.data_stats.map((c) => c.column_name),
    [profile]
  );
  const [selectedColumn, setSelectedColumn] = useState(allColumns[0] || "");
  const chartStyle = { height: 320, width: "100%" };

  /* ----- helpers -------------------------------------------------------- */
  const findCol = (cols: DataStats[], name: string) =>
    cols.find((c) => c.column_name === name);

  const origCol = findCol(profile.data_stats, selectedColumn);
  const synthCol = profileSynth ? findCol(profileSynth.data_stats, selectedColumn) : undefined;

  const isNumeric =
    origCol && !origCol.categorical && (origCol.data_type === "int" || origCol.data_type === "float");
  const isCategorical = origCol && origCol.categorical;

  /* ----- chart builder -------------------------------------------------- */
  const buildCharts = () => {
    if (!origCol) return null;

    /* numeric ----------------------------------------------------------- */
    if (isNumeric) {
      if (profileSynth && synthCol) {
        const opt = getTwoBoxplotOption(
          selectedColumn,
          origCol.statistics,
          synthCol.statistics
        );
        return opt && <ReactECharts option={opt} style={chartStyle} />;
      }
      const opt = getNumericalBoxplotOption(origCol);
      return opt && <ReactECharts option={opt} style={chartStyle} />;
    }

    /* categorical ------------------------------------------------------- */
    if (isCategorical) {
      if (profileSynth && synthCol) {
        const barOpt = getTwoCategoricalBarChartOption(
          selectedColumn,
          origCol.statistics.categorical_count || {},
          synthCol.statistics.categorical_count || {}
        );
        const pieOpt = getTwoCategoricalPieChartOption(
          selectedColumn,
          origCol.statistics.categorical_count || {},
          synthCol.statistics.categorical_count || {}
        );
        return (
          <>
            {barOpt && <ReactECharts option={barOpt} style={chartStyle} />}
            {pieOpt && <ReactECharts option={pieOpt} style={chartStyle} />}
          </>
        );
      }

      const barOpt = getCategoricalBarChartOption(origCol);
      const pieOpt = getCategoricalPieChartOption(origCol);
      return (
        <>
          {barOpt && <ReactECharts option={barOpt} style={chartStyle} />}
          {pieOpt && <ReactECharts option={pieOpt} style={chartStyle} />}
        </>
      );
    }
    return null;
  };

  /* ---------- render ---------------------------------------------------- */
  return (
    <Box>
      {/* quick stats always visible */}
      <QuickStats
        globalStats={profile.global_stats}
        synthGlobalStats={profileSynth?.global_stats}
      />

      <Typography variant="h6" gutterBottom>
        Column Charts
      </Typography>

      {/* column selector */}
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel id="column-select-label">Column</InputLabel>
        <Select
          labelId="column-select-label"
          value={selectedColumn}
          label="Column"
          onChange={(e) => setSelectedColumn(e.target.value as string)}
        >
          {allColumns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* chart(s) */}
      {buildCharts()}
    </Box>
  );
}
