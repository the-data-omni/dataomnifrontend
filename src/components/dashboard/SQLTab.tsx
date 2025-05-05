import React from "react";
import { Box, Typography } from "@mui/material";

interface SQLTabProps {
  sql: string;
}

export function SQLTab({ sql }: SQLTabProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        CODE
      </Typography>
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: "1rem",
          borderRadius: "4px",
          whiteSpace: "pre-wrap",
        }}
      >
        {sql}
      </pre>
    </Box>
  );
}
