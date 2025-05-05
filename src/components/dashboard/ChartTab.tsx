import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";

/** Guess each column's type by checking if all values parse as numbers. */
function guessColumnTypes(
  data: Array<Record<string, any>>
): Record<string, "number" | "string"> {
  if (!data || data.length === 0) return {};
  const columns = Object.keys(data[0]);
  const columnTypes: Record<string, "number" | "string"> = {};

  columns.forEach((col) => {
    const allNumeric = data.every((row) => {
      const val = row[col];
      return val !== null && val !== undefined && !isNaN(Number(val));
    });
    columnTypes[col] = allNumeric ? "number" : "string";
  });

  return columnTypes;
}

/** Helper to generate random color for each series (optional). */
function randomColor() {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgb(${r}, ${g}, ${b})`;
}

interface ChartTabProps {
  data: Array<Record<string, any>>;
}

export function ChartTab({ data }: ChartTabProps) {
  // If no data, show a message
  console.log("ChartTab received data:", data);
  if (!data || data.length === 0) {
    return <Typography>No data to chart.</Typography>;
  }

  // 1. Derive columns + guess types
  const columns = Object.keys(data[0]);
  const columnTypes = guessColumnTypes(data);

  // 2. Toggles for chart settings panel
  const [showSettings, setShowSettings] = useState(false);

  // 3. Single-Value Check
  const isSingleValue = columns.length === 1 && data.length === 1;
  let singleValueOption: any = null; // We'll build a gauge or text if single-value is numeric or string.

  if (isSingleValue) {
    const col = columns[0];
    const val = data[0][col];
    const isNumeric = columnTypes[col] === "number";

    if (isNumeric) {
      // Build a gauge chart
      singleValueOption = {
        title: {
          text: "Single Value",
        },
        tooltip: {
          formatter: `{a} <br/>{b}: {c}`,
        },
        series: [
          {
            name: col,
            type: "gauge",
            data: [{ value: val, name: col }],
            min: 0,
            max: typeof val === "number" && val > 0 ? val * 2 : 100,
          },
        ],
      };
    }
  }

  // 4. Normal chart logic (bar/line/pie) if not single-value
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [xColumn, setXColumn] = useState<string>("");
  const [yColumns, setYColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!isSingleValue) {
      // Only pick defaults if not single-value
      if (!xColumn) {
        const defaultX =
          columns.find((col) => columnTypes[col] !== "number") || columns[0];
        setXColumn(defaultX);
      }
      if (yColumns.length === 0) {
        const numericCols = columns.filter(
          (col) => columnTypes[col] === "number"
        );
        if (numericCols.length > 0) {
          setYColumns(numericCols);
        }
      }
    }
  }, [columns, columnTypes, xColumn, yColumns, isSingleValue]);

  // Build ECharts option for normal scenario
  let normalChartOption: any = null;
  if (!isSingleValue) {
    let xAxisData: string[] = [];
    let series: any[] = [];

    if (chartType === "pie") {
      // For a pie chart, we typically remove xAxis/yAxis
      series = yColumns.map((col) => ({
        name: col,
        type: "pie",
        data: data.map((row) => ({
          name: String(row[xColumn] ?? ""),
          value: Number(row[col] ?? 0),
        })),
        radius: "50%",
        center: ["50%", "50%"],
      }));
    } else {
      // bar or line
      xAxisData = data.map((row) => String(row[xColumn] ?? ""));
      series = yColumns.map((col) => ({
        name: col,
        type: chartType,
        data: data.map((row) => Number(row[col] ?? 0)),
        itemStyle: { color: randomColor() },
        smooth: chartType === "line",
      }));
    }

    normalChartOption = {
      title: {
        text: "Dynamic Charts",
      },
      tooltip: {
        trigger: chartType === "pie" ? "item" : "axis",
      },
      legend: {
        data: yColumns,
      },
      xAxis:
        chartType === "pie"
          ? undefined
          : {
              type: "category",
              data: xAxisData,
              name: xColumn,
            },
      yAxis:
        chartType === "pie"
          ? undefined
          : {
              type: "value",
              name: yColumns.join(", "),
            },
      series,
    };
  }

  return (
    <Box>
      {/* <Typography variant="h6">Dynamic ECharts</Typography> */}

      {/* Button to toggle settings - Always visible */}
      <Button
        variant="outlined"
        size="small"
        onClick={() => setShowSettings((prev) => !prev)}
        sx={{ mt: 2 }}
      >
        {showSettings ? "Hide Chart Settings" : "Show Chart Settings"}
      </Button>

      {/* If single value, the settings won't do much, but we can still show them */}
      {showSettings && (
        <Box sx={{ mt: 2, border: "1px solid #ccc", p: 2, borderRadius: 2 }}>
          {isSingleValue ? (
            <Typography variant="body2">
              This dataset has a single column & single row. Chart settings are
              not applicable here, but you can still see them below if you want
              to adapt.
            </Typography>
          ) : (
            <>
              {/* CHART TYPE SELECT */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Chart Type</InputLabel>
                <Select
                  label="Chart Type"
                  value={chartType}
                  onChange={(e) =>
                    setChartType(e.target.value as "bar" | "line" | "pie")
                  }
                >
                  <MenuItem value="bar">Bar</MenuItem>
                  <MenuItem value="line">Line</MenuItem>
                  <MenuItem value="pie">Pie</MenuItem>
                </Select>
              </FormControl>

              {/* X-Axis Column Select */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>X Axis</InputLabel>
                <Select
                  label="X Axis"
                  value={xColumn}
                  onChange={(e) => setXColumn(e.target.value)}
                >
                  {columns.map((col) => (
                    <MenuItem key={col} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Y-Axis Column(s) Select (multiple) */}
              <FormControl fullWidth>
                <InputLabel>Y Axis Columns</InputLabel>
                <Select
                  multiple
                  value={yColumns}
                  onChange={(e) => {
                    const value = e.target.value;
                    setYColumns(
                      typeof value === "string" ? value.split(",") : value
                    );
                  }}
                  renderValue={(selected) => (selected as string[]).join(", ")}
                >
                  {columns.map((col) => (
                    <MenuItem key={col} value={col}>
                      <Checkbox checked={yColumns.includes(col)} />
                      <ListItemText primary={col} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </Box>
      )}

      {/* The actual ECharts chart */}
      <Box sx={{ mt: 3 }}>
        {isSingleValue ? (
          // Single-value scenario
          (() => {
            const col = columns[0];
            const val = data[0][col];
            const isNumeric = columnTypes[col] === "number";
            if (isNumeric) {
              return (
                <ReactECharts
                  option={singleValueOption}
                  style={{ height: 400, width: "100%" }}
                />
              );
            } else {
              return (
                <Box>
                  <Typography variant="h6">Single Value (String)</Typography>
                  <Typography>{`${col}: ${String(val)}`}</Typography>
                </Box>
              );
            }
          })()
        ) : (
          // Normal bar/line/pie scenario
          <ReactECharts
            option={normalChartOption}
            notMerge={true}
            style={{ height: 400, width: "100%" }}
          />
        )}
      </Box>
    </Box>
  );
}
