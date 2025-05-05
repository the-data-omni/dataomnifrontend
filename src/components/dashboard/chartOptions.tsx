// import { EChartsOption } from 'echarts';
// import { DataStats, Statistics } from './profileTypes';

// // Helper function to safely get statistics
// const getStats = (col: DataStats | undefined): Statistics | null => {
//   return col?.statistics ?? null;
// };

// export function getOverallNullCountOption(dataStatsArray: DataStats[]): EChartsOption {
//   const columnNames = dataStatsArray.map(col => col.column_name);
//   const nullCounts = dataStatsArray.map(col => col.statistics.null_count);
//   return {
//     title: { text: 'Null Values per Column', left: 'center' },
//     tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>Null Count: {c}' },
//     grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
//     xAxis: { type: 'category', data: columnNames, axisLabel: { interval: 0, rotate: columnNames.length > 8 ? 30 : 0 } },
//     yAxis: { type: 'value', name: 'Null Count' },
//     series: [{ name: 'Null Count', type: 'bar', data: nullCounts, itemStyle: { color: '#fac858' } }]
//   };
// }

// export function getOverallUniquenessOption(dataStatsArray: DataStats[]): EChartsOption {
//   const columnNames = dataStatsArray.map(col => col.column_name);
//   const uniqueRatios = dataStatsArray.map(col => (col.statistics.unique_ratio * 100));
//   return {
//     title: { text: 'Unique Value Ratio per Column (%)', left: 'center' },
//     tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (params: any) => `${params[0].name}<br/>Unique Ratio: ${params[0].value.toFixed(2)}%` },
//     grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
//     xAxis: { type: 'category', data: columnNames, axisLabel: { interval: 0, rotate: columnNames.length > 8 ? 30 : 0 } },
//     yAxis: { type: 'value', name: 'Unique Ratio (%)', max: 100, axisLabel: { formatter: '{value}%' } },
//     series: [{ name: 'Unique Ratio', type: 'bar', data: uniqueRatios, itemStyle: { color: '#ee6666' } }]
//   };
// }

// export function getNumericalBoxplotOption(columnStats: DataStats): EChartsOption | null {
//   const stats = getStats(columnStats);
//   if (!stats || stats.min === null || stats.max === null || stats.median === null || !stats.quantiles) {
//     console.warn(`Insufficient data for boxplot: ${columnStats.column_name}`);
//     return null;
//   }
//   const columnName = columnStats.column_name;
//   const q1 = stats.quantiles['0'];
//   const q3 = stats.quantiles['2'];
//   if (typeof q1 !== 'number' || typeof q3 !== 'number') {
//     console.warn(`Missing Q1 or Q3 for boxplot: ${columnName}`);
//     return null;
//   }
//   const boxplotData = [[stats.min, q1, stats.median, q3, stats.max]];
//   return {
//     title: { text: `Distribution of ${columnName}`, left: 'center', textStyle: { fontSize: 16 } },
//     tooltip: {
//       trigger: 'item',
//       axisPointer: { type: 'shadow' },
//       formatter: (params: any) => {
//         const data = params.data as number[];
//         return [
//           `Column: ${columnName}`,
//           `Max: ${data[4]?.toFixed(2) ?? 'N/A'}`,
//           `Q3: ${data[3]?.toFixed(2) ?? 'N/A'}`,
//           `Median: ${data[2]?.toFixed(2) ?? 'N/A'}`,
//           `Q1: ${data[1]?.toFixed(2) ?? 'N/A'}`,
//           `Min: ${data[0]?.toFixed(2) ?? 'N/A'}`
//         ].join('<br/>');
//       }
//     },
//     grid: { left: '10%', right: '10%', bottom: '15%' },
//     xAxis: { type: 'category', data: [columnName], boundaryGap: true, nameGap: 30 },
//     yAxis: { type: 'value', name: 'Value', splitArea: { show: false } },
//     series: [{ name: 'BoxPlot', type: 'boxplot', data: boxplotData }]
//   };
// }

// export function getCategoricalBarChartOption(columnStats: DataStats): EChartsOption | null {
//   const stats = getStats(columnStats);
//   const counts = stats?.categorical_count;
//   if (!counts) {
//     console.warn(`Missing categorical_count for bar chart: ${columnStats.column_name}`);
//     return null;
//   }
//   const columnName = columnStats.column_name;
//   const categories = Object.keys(counts);
//   const data = Object.values(counts);
//   return {
//     title: { text: `Counts per ${columnName}`, left: 'center', textStyle: { fontSize: 16 } },
//     tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>Count: {c}' },
//     grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
//     xAxis: { type: 'category', data: categories, axisLabel: { interval: 0, rotate: categories.length > 5 ? 30 : 0 } },
//     yAxis: { type: 'value', name: 'Count' },
//     series: [{ name: 'Count', type: 'bar', data: data, itemStyle: { color: '#91cc75' } }]
//   };
// }

// export function getCategoricalPieChartOption(columnStats: DataStats): EChartsOption | null {
//   const stats = getStats(columnStats);
//   const counts = stats?.categorical_count;
//   if (!counts) {
//     console.warn(`Missing categorical_count for pie chart: ${columnStats.column_name}`);
//     return null;
//   }
//   const columnName = columnStats.column_name;
//   const data = Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
//   return {
//     title: { text: `Distribution of ${columnName}`, left: 'center', textStyle: { fontSize: 16 } },
//     tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
//     legend: { orient: 'vertical', left: 'left', top: 'middle' },
//     series: [{
//       name: columnName,
//       type: 'pie',
//       radius: '60%',
//       center: ['60%', '60%'],
//       data: data,
//       emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
//       label: { show: true, formatter: '{b}: {d}%' }
//     }]
//   };
// }

// chartOptions.ts
// chartOptions.ts
import { EChartsOption } from "echarts";
import { DataStats, Statistics } from "./profileTypes";

/** Overall Null Count: Display orig and synth values side by side */
export function getOverallNullCountOptionSideBySide(
  origStats: DataStats[],
  synthStats: DataStats[]
): EChartsOption {
  // Gather all unique column names from both profiles
  const allCols = new Set([
    ...origStats.map((c) => c.column_name),
    ...synthStats.map((c) => c.column_name),
  ]);
  const columns = Array.from(allCols);

  // For each column, get null count from orig and synth (defaulting to 0 if missing)
  const origCounts = columns.map((col) => {
    const c = origStats.find((x) => x.column_name === col);
    return c ? c.statistics.null_count : 0;
  });
  const synthCounts = columns.map((col) => {
    const c = synthStats.find((x) => x.column_name === col);
    return c ? c.statistics.null_count : 0;
  });

  return {
    title: { text: "Null Values per Column", left: "center" },
    tooltip: { trigger: "axis" },
    legend: { data: ["orig", "synth"], top: 20 },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: columns },
    yAxis: { type: "value", name: "Null Count" },
    series: [
      { name: "orig", type: "bar", data: origCounts, itemStyle: { color: "#fac858" } },
      { name: "synth", type: "bar", data: synthCounts, itemStyle: { color: "#5470c6" } },
    ],
  };
}

/** Overall Unique Ratio: Display orig and synth percentages side by side */
export function getOverallUniquenessOptionSideBySide(
  origStats: DataStats[],
  synthStats: DataStats[]
): EChartsOption {
  const allCols = new Set([
    ...origStats.map((c) => c.column_name),
    ...synthStats.map((c) => c.column_name),
  ]);
  const columns = Array.from(allCols);

  const origRatios = columns.map((col) => {
    const c = origStats.find((x) => x.column_name === col);
    return c ? c.statistics.unique_ratio * 100 : 0;
  });
  const synthRatios = columns.map((col) => {
    const c = synthStats.find((x) => x.column_name === col);
    return c ? c.statistics.unique_ratio * 100 : 0;
  });

  return {
    title: { text: "Unique Value Ratio per Column (%)", left: "center" },
    tooltip: { trigger: "axis" },
    legend: { data: ["orig", "synth"], top: 20 },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: columns },
    yAxis: { type: "value", name: "Unique Ratio (%)", max: 100 },
    series: [
      { name: "orig", type: "bar", data: origRatios, itemStyle: { color: "#ee6666" } },
      { name: "synth", type: "bar", data: synthRatios, itemStyle: { color: "#73c0de" } },
    ],
  };
}

/** Two Boxplot Option: For a given column, show orig and synth boxplots side by side */
export function getTwoBoxplotOption(
  columnName: string,
  origStats: Statistics,
  synthStats: Statistics
): EChartsOption | null {
  // Validate that both profiles provide sufficient data
  if (!origStats || !synthStats) return null;
  if (!origStats.quantiles || !synthStats.quantiles) return null;

  const origQ1 = origStats.quantiles["0"];
  const origQ3 = origStats.quantiles["2"];
  const synthQ1 = synthStats.quantiles["0"];
  const synthQ3 = synthStats.quantiles["2"];
  if (
    [origStats.min, origQ1, origStats.median, origQ3, origStats.max].some((v) => v == null) ||
    [synthStats.min, synthQ1, synthStats.median, synthQ3, synthStats.max].some((v) => v == null)
  ) {
    console.warn(`Insufficient data for boxplot: ${columnName}`);
    return null;
  }

  // Use non-null assertions to ensure values are numbers
  const boxplotData = [
    [
      origStats.min!,
      origQ1!,
      origStats.median!,
      origQ3!,
      origStats.max!
    ],
    [
      synthStats.min!,
      synthQ1!,
      synthStats.median!,
      synthQ3!,
      synthStats.max!
    ],
  ];

  return {
    title: { text: `Distribution of ${columnName}`, left: "center" },
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const data = params.data as number[];
        const label = params.name; // "orig" or "synth"
        return [
          `${columnName} (${label})`,
          `Max: ${data[4]?.toFixed(2)}`,
          `Q3: ${data[3]?.toFixed(2)}`,
          `Median: ${data[2]?.toFixed(2)}`,
          `Q1: ${data[1]?.toFixed(2)}`,
          `Min: ${data[0]?.toFixed(2)}`,
        ].join("<br/>");
      },
    },
    xAxis: { type: "category", data: ["orig", "synth"], boundaryGap: true },
    yAxis: { type: "value", name: "Value" },
    series: [
      {
        name: "BoxPlot",
        type: "boxplot",
        data: boxplotData,
      },
    ],
  };
}

/** Two Categorical Bar Chart Option: For a given categorical column, show orig and synth counts */
export function getTwoCategoricalBarChartOption(
  columnName: string,
  origCounts: { [key: string]: number },
  synthCounts: { [key: string]: number }
): EChartsOption {
  // Get the union of all categories
  const allCats = new Set([...Object.keys(origCounts), ...Object.keys(synthCounts)]);
  const categories = Array.from(allCats);
  const origData = categories.map((cat) => origCounts[cat] ?? 0);
  const synthData = categories.map((cat) => synthCounts[cat] ?? 0);

  return {
    title: { text: `Counts per ${columnName}`, left: "center" },
    tooltip: { trigger: "axis" },
    legend: { data: ["orig", "synth"], top: 20 },
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value", name: "Count" },
    series: [
      { name: "orig", type: "bar", data: origData, itemStyle: { color: "#91cc75" } },
      { name: "synth", type: "bar", data: synthData, itemStyle: { color: "#fac858" } },
    ],
  };
}

/** Two Categorical Pie Chart Option: For a given categorical column, display two pie charts side by side */
export function getTwoCategoricalPieChartOption(
  columnName: string,
  origCounts: { [key: string]: number },
  synthCounts: { [key: string]: number }
): EChartsOption {
  const origData = Object.keys(origCounts).map((cat) => ({ name: cat, value: origCounts[cat] }));
  const synthData = Object.keys(synthCounts).map((cat) => ({ name: cat, value: synthCounts[cat] }));

  return {
    title: { text: `Distribution of ${columnName}`, left: "center" },
    tooltip: { trigger: "item" },
    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
    },
    series: [
      {
        name: "orig",
        type: "pie",
        center: ["30%", "50%"],
        radius: "50%",
        data: origData,
        label: { formatter: "{b}: {d}%" },
      },
      {
        name: "synth",
        type: "pie",
        center: ["75%", "50%"],
        radius: "50%",
        data: synthData,
        label: { formatter: "{b}: {d}%" },
      },
    ],
  };
}

// single chart functions
const getStats = (col: DataStats | undefined): Statistics | null => {
  return col?.statistics ?? null;
};

export function getOverallNullCountOption(dataStatsArray: DataStats[]): EChartsOption {
  const columnNames = dataStatsArray.map(col => col.column_name);
  const nullCounts = dataStatsArray.map(col => col.statistics.null_count);
  return {
    title: { text: 'Null Values per Column', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>Null Count: {c}' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: columnNames, axisLabel: { interval: 0, rotate: columnNames.length > 8 ? 30 : 0 } },
    yAxis: { type: 'value', name: 'Null Count' },
    series: [{ name: 'Null Count', type: 'bar', data: nullCounts, itemStyle: { color: '#fac858' } }]
  };
}

export function getOverallUniquenessOption(dataStatsArray: DataStats[]): EChartsOption {
  const columnNames = dataStatsArray.map(col => col.column_name);
  const uniqueRatios = dataStatsArray.map(col => (col.statistics.unique_ratio * 100));
  return {
    title: { text: 'Unique Value Ratio per Column (%)', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (params: any) => `${params[0].name}<br/>Unique Ratio: ${params[0].value.toFixed(2)}%` },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: columnNames, axisLabel: { interval: 0, rotate: columnNames.length > 8 ? 30 : 0 } },
    yAxis: { type: 'value', name: 'Unique Ratio (%)', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{ name: 'Unique Ratio', type: 'bar', data: uniqueRatios, itemStyle: { color: '#ee6666' } }]
  };
}

export function getNumericalBoxplotOption(columnStats: DataStats): EChartsOption | null {
  const stats = getStats(columnStats);
  if (!stats || stats.min === null || stats.max === null || stats.median === null || !stats.quantiles) {
    console.warn(`Insufficient data for boxplot: ${columnStats.column_name}`);
    return null;
  }
  const columnName = columnStats.column_name;
  const q1 = stats.quantiles['0'];
  const q3 = stats.quantiles['2'];
  if (typeof q1 !== 'number' || typeof q3 !== 'number') {
    console.warn(`Missing Q1 or Q3 for boxplot: ${columnName}`);
    return null;
  }
  const boxplotData = [[stats.min, q1, stats.median, q3, stats.max]];
  return {
    title: { text: `Distribution of ${columnName}`, left: 'center', textStyle: { fontSize: 16 } },
    tooltip: {
      trigger: 'item',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = params.data as number[];
        return [
          `Column: ${columnName}`,
          `Max: ${data[4]?.toFixed(2) ?? 'N/A'}`,
          `Q3: ${data[3]?.toFixed(2) ?? 'N/A'}`,
          `Median: ${data[2]?.toFixed(2) ?? 'N/A'}`,
          `Q1: ${data[1]?.toFixed(2) ?? 'N/A'}`,
          `Min: ${data[0]?.toFixed(2) ?? 'N/A'}`
        ].join('<br/>');
      }
    },
    grid: { left: '10%', right: '10%', bottom: '15%' },
    xAxis: { type: 'category', data: [columnName], boundaryGap: true, nameGap: 30 },
    yAxis: { type: 'value', name: 'Value', splitArea: { show: false } },
    series: [{ name: 'BoxPlot', type: 'boxplot', data: boxplotData }]
  };
}

export function getCategoricalBarChartOption(columnStats: DataStats): EChartsOption | null {
  const stats = getStats(columnStats);
  const counts = stats?.categorical_count;
  if (!counts) {
    console.warn(`Missing categorical_count for bar chart: ${columnStats.column_name}`);
    return null;
  }
  const columnName = columnStats.column_name;
  const categories = Object.keys(counts);
  const data = Object.values(counts);
  return {
    title: { text: `Counts per ${columnName}`, left: 'center', textStyle: { fontSize: 16 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>Count: {c}' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: categories, axisLabel: { interval: 0, rotate: categories.length > 5 ? 30 : 0 } },
    yAxis: { type: 'value', name: 'Count' },
    series: [{ name: 'Count', type: 'bar', data: data, itemStyle: { color: '#91cc75' } }]
  };
}

export function getCategoricalPieChartOption(columnStats: DataStats): EChartsOption | null {
  const stats = getStats(columnStats);
  const counts = stats?.categorical_count;
  if (!counts) {
    console.warn(`Missing categorical_count for pie chart: ${columnStats.column_name}`);
    return null;
  }
  const columnName = columnStats.column_name;
  const data = Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  return {
    title: { text: `Distribution of ${columnName}`, left: 'center', textStyle: { fontSize: 16 } },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', top: 'middle' },
    series: [{
      name: columnName,
      type: 'pie',
      radius: '60%',
      center: ['60%', '60%'],
      data: data,
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      label: { show: true, formatter: '{b}: {d}%' }
    }]
  };
}


