import React from "react";
import { Box, Typography } from "@mui/material";

interface DataTabProps {
  data: any[]; // The array of query results
}

export function DataTab({ data }: DataTabProps) {
  if (!data || data.length === 0) {
    return <Typography>No data available.</Typography>;
  }

  // Dynamically derive columns from the first row
  const columns = Object.keys(data[0]);

  return (
    <Box>
      <Typography variant="h6">Data</Typography>
      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} style={{ border: "1px solid #ccc", padding: "8px" }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col) => (
                <td key={col} style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
