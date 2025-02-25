// GlobalQueryDrawer.tsx
"use client";

import React, { useState } from "react";
import { Drawer, Box, IconButton, Button, Typography, TextField } from "@mui/material";
import Editor, { BeforeMount, Monaco } from "@monaco-editor/react";
import { X as XIcon } from "@phosphor-icons/react";
import { format } from "sql-formatter";

// The query drawer context
import { useQueryDrawer } from "@/components/dashboard/chat/context/query-drawer-context";

/** Parse BigQuery error messages like "Syntax error: ... at [1:19]" to just the relevant portion. */
function parseBqErrorMessage(rawMsg: string): string {
  const re = /(Syntax error:.*?at \[\d+:\d+\]|Unrecognized name:.*?at \[\d+:\d+\])/i;
  const match = rawMsg.match(re);
  if (match) {
    // remove trailing "at [X:Y]" text
    const cleaned = match[0].replace(/\s+at\s+\[\d+:\d+\]/i, "").trim();
    return cleaned;
  }
  return rawMsg;
}

/**
 * Calls your Flask /api/generate_sql endpoint with userQuestion + existingSql,
 * returning a JSON: { sql: "..."}
 */
async function askOpenAiForSql(userQuestion: string, existingSql: string) {
  const response = await fetch("https://schema-scoring-api-242009193450.us-central1.run.app/generate_sql", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userQuestion, existingSql }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.sql;
}

/**
 * Calls your /dry_run endpoint to validate SQL, returning
 * { formatted_bytes_processed, message } or throws an error message.
 */
async function dryRunQuery(sql: string) {
  const resp = await fetch("https://schema-scoring-api-242009193450.us-central1.run.app/dry_run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });

  if (!resp.ok) {
    // We expect some { message: "... } JSON on error
    const errorData = await resp.json().catch(() => ({}));
    const rawMessage = errorData?.message || "Error testing query";
    const sanitizedMessage = parseBqErrorMessage(rawMessage);
    throw new Error(sanitizedMessage);
  }

  const data = await resp.json();
  return data; // { formatted_bytes_processed, message }
}

export function GlobalQueryDrawer() {
  const { open, closeDrawer, sql, setSql } = useQueryDrawer();
  const [userQuestion, setUserQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  // For "Validate Query" status:
  const [testQueryStatus, setTestQueryStatus] = useState<"idle" | "success" | "error">("idle");
  const [testQueryErrorMessage, setTestQueryErrorMessage] = useState("");
  const [dryRunBytes, setDryRunBytes] = useState("");

  // Optional auto-formatter for Monaco
  const handleEditorWillMount: BeforeMount = (monaco: Monaco) => {
    monaco.languages.registerDocumentFormattingEditProvider("sql", {
      provideDocumentFormattingEdits(model) {
        const originalText = model.getValue();
        const formattedText = format(originalText, {
          language: "bigquery",
          tabWidth: 2,
          keywordCase: "upper",
        });
        return [
          {
            range: model.getFullModelRange(),
            text: formattedText,
          },
        ];
      },
    });
  };

  // Handle "Ask OpenAI" => generates or refines SQL
  const handleAskOpenAi = async () => {
    setLoading(true);
    try {
      // Reset test status if we replace the SQL
      setTestQueryStatus("idle");
      setTestQueryErrorMessage("");
      setDryRunBytes("");

      const newSql = await askOpenAiForSql(userQuestion, sql);
      setSql(newSql);
    } catch (err) {
      console.error("Error calling /api/generate_sql:", err);
      alert("Error generating SQL. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // Handle "Validate Query" => calls /dry_run with current sql
  const handleTestQuery = async () => {
    try {
      setTestQueryStatus("idle");
      setTestQueryErrorMessage("");
      setDryRunBytes("");

      const data = await dryRunQuery(sql);
      setTestQueryStatus("success");
      setDryRunBytes(data.formatted_bytes_processed || "");
    //   alert(data.message || "Dry-run succeeded");
    } catch (error) {
      console.error("Dry run failed:", error);
      setTestQueryStatus("error");
      setTestQueryErrorMessage((error as Error).message);
    //   alert((error as Error).message || "Error testing query");
    }
  };

  // If user edits the SQL manually, reset test status
  const handleEditorChange = (val?: string) => {
    if (typeof val === "string") {
      setSql(val);
      setTestQueryStatus("idle");
      setTestQueryErrorMessage("");
      setDryRunBytes("");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeDrawer}
      PaperProps={{
        sx: { width: 500, p: 2, display: "flex", flexDirection: "column" },
      }}
      variant="temporary"
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Query Builder
        </Typography>
        <IconButton onClick={closeDrawer}>
          <XIcon />
        </IconButton>
      </Box>

      {/* If generating SQL from OpenAI */}
      {loading && (
        <Typography color="text.secondary">Generating SQL with OpenAI...</Typography>
      )}

      {/* Ask a question input */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Ask a question (or refine existing SQL)"
          variant="outlined"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          size="small"
        />
        <Button
          onClick={handleAskOpenAi}
          variant="contained"
          disabled={loading}
          sx={{ mt: 1 }}
        >
          Ask OpenAI
        </Button>
      </Box>

      {/* The Editor for SQL */}
      <Box sx={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={sql}
          beforeMount={handleEditorWillMount}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
          }}
        />
      </Box>

      {/* "Validate Query" button + success/error UI */}
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          variant="contained"
          // If test success, show a green button
          color={testQueryStatus === "success" ? "success" : "primary"}
          onClick={handleTestQuery}
        >
          {testQueryStatus === "success"
            ? `Query Valid - ${dryRunBytes}`
            : "Validate Query"}
        </Button>

        {testQueryStatus === "error" && testQueryErrorMessage && (
          <Typography color="error" variant="body2">
            {testQueryErrorMessage}
          </Typography>
        )}
      </Box>

      {/* Footer / Actions */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => alert(`Run query:\n\n${sql}`)}
        >
          Run Query
        </Button>
      </Box>
    </Drawer>
  );
}
