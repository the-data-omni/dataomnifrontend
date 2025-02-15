"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { CheckCircle as CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { PencilSimple as PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { useNavigate } from "react-router-dom";

import { paths } from "@/paths";
import { dayjs } from "@/lib/dayjs";
import { toast } from "@/components/core/toaster";
import { PropertyItem } from "@/components/core/property-item";
import { PropertyList } from "@/components/core/property-list";

/** The Query interface, including optional fields. */
interface Query {
  id?: string;
  question?: string;
  statementType?: string;
  count?: number;
  createdAt?: Date;
  sql?: string;
  avgExecutionTime?: number | null;
  avgTotalBytesProcessed?: number | null;
}

export interface ProductModalProps {
  /** Whether the modal is open or not */
  open: boolean;
  /** If provided, we're editing this query. If omitted, we're creating a new one. */
  query?: Query;
  /** Optional callback if you'd like to handle closure differently */
  onClose?: () => void;
}

/**
 * Helper function to parse BigQuery error messages like:
 *   1) "Syntax error: Unexpected integer literal "2" at [1:19]"
 *   2) "Unrecognized name: query at [1:8]"
 * ... etc.
 * If no match, returns the original rawMsg.
 */
function parseBqErrorMessage(rawMsg: string): string {
  const re = /(Syntax error:.*?at \[\d+:\d+\]|Unrecognized name:.*?at \[\d+:\d+\])/i;
  const match = rawMsg.match(re);
  if (match) {
    const cleaned = match[0].replace(/\s+at\s+\[\d+:\d+\]/i, "").trim();
    return cleaned;
  }
  return rawMsg;
}

/**
 * QueryModal => used for both adding a new query (no `query` prop)
 * or editing an existing query (with `query` prop).
 */
export function QueryModal({
  open,
  query,
  onClose,
}: ProductModalProps): React.JSX.Element | null {
  /* ---------------------------------------------
   * HOOKS / STATE
   * --------------------------------------------- */
  const navigate = useNavigate();

  // Distinguish "Add" vs "Edit": if no `query` is passed, we’re in "Add" mode
  const isNew = !query?.id;

  // Whether we are editing (text fields) or showing read-only
  // If adding new, we start editing immediately. If editing existing, start read-only.
  const [editing, setEditing] = React.useState(isNew);

  // Local states for the fields
  const [localQuestion, setLocalQuestion] = React.useState("");
  const [localStatementType, setLocalStatementType] = React.useState("");
  const [localSql, setLocalSql] = React.useState("");

  // Track dry-run status and message/bytes
  const [testQueryStatus, setTestQueryStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [dryRunBytes, setDryRunBytes] = React.useState<string>("");
  const [testQueryErrorMessage, setTestQueryErrorMessage] = React.useState<string>("");

  // Handle menu for "Open Query"
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Example function to open Looker Studio with the current localSql
  // You'd customize this link for your environment:
  function handleOpenLookerStudio(sql: string) {
    const baseUrl = "https://lookerstudio.google.com/reporting/create";
    const mode = "edit";
    const connector = "bigQuery";
    const projectId = "bigquery-public-data";
    const billingProjectId = "foreign-connect-48db5";

    const sqlParam = encodeURIComponent(sql);
    const finalUrl =
      `${baseUrl}?c.mode=${mode}` +
      `&ds.connector=${connector}` +
      `&ds.type=CUSTOM_QUERY` +
      `&ds.projectId=${projectId}` +
      `&ds.sql=${sqlParam}` +
      `&ds.billingProjectId=${billingProjectId}`;

    window.open(finalUrl, "_blank");
  }

  // Sync when `query` changes
  React.useEffect(() => {
    if (query) {
      setLocalQuestion(query.question ?? "");
      setLocalStatementType(query.statementType ?? "");
      setLocalSql(query.sql ?? "");
      // If existing query, default to read-only
      setEditing(isNew);
    } else {
      // If no query => new
      setLocalQuestion("");
      setLocalStatementType("");
      setLocalSql("");
      setEditing(true);
    }
  }, [query, isNew]);

  // By default, if user hits "X" or outside click, we close + navigate
  const handleClose = React.useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate(paths.dashboard.products.list);
    }
  }, [navigate, onClose]);

  // handle "Save"
  const handleSave = React.useCallback(() => {
    // In real code, call an API or update React Query cache
    if (isNew) {
      toast.success(`Created new query: ${localQuestion}`);
    } else {
      toast.success(`Updated query: ${localQuestion}`);
    }
    setEditing(false);
    handleClose();
  }, [isNew, localQuestion, handleClose]);

  // handle "Cancel" => revert local fields
  const handleCancel = React.useCallback(() => {
    if (query) {
      setLocalQuestion(query.question ?? "");
      setLocalStatementType(query.statementType ?? "");
      setLocalSql(query.sql ?? "");
      setEditing(false);
    } else {
      // If truly new, user might want to close entirely
      handleClose();
    }
  }, [query, handleClose]);

  // Function to test/dry-run query
  const handleTestQuery = React.useCallback(async () => {
    try {
      setTestQueryStatus("idle");
      setDryRunBytes("");
      setTestQueryErrorMessage("");

      const resp = await fetch("http://127.0.0.1:5000/dry_run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: localSql }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        const rawMessage = errorData?.message || "Error testing query";
        const sanitizedMessage = parseBqErrorMessage(rawMessage);
        throw new Error(sanitizedMessage);
      }

      const data = await resp.json();
      setDryRunBytes(data.formatted_bytes_processed);
      setTestQueryStatus("success");
      toast.success(data.message);
    } catch (error) {
      console.error("Dry run failed:", error);
      setTestQueryStatus("error");
      setTestQueryErrorMessage((error as Error).message);
      toast.error((error as Error).message || "Error testing query");
    }
  }, [localSql]);

  // If modal not open, don’t render anything
  if (!open) return null;

  // Fallback data for read-only
  const fallbackId = query?.id ?? "NO-ID";
  const fallbackCount = query?.count ?? 0;
  const fallbackCreated = query?.createdAt
    ? dayjs(query.createdAt).format("MMMM D, YYYY hh:mm A")
    : "N/A";
  const fallbackExec =
    query?.avgExecutionTime != null ? `${query.avgExecutionTime} ms` : "N/A";
  const fallbackBytes =
    query?.avgTotalBytesProcessed != null
      ? `${query.avgTotalBytesProcessed.toFixed(2)} bytes`
      : "N/A";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      sx={{
        "& .MuiDialog-container": { justifyContent: "flex-end" },
        "& .MuiDialog-paper": { height: "100%", width: "100%" },
      }}
    >
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
        {/* Header: if new => "Add Query", else => "Edit Query" */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isNew ? "Add Query" : `Edit Query ${fallbackId}`}
          </Typography>
          <IconButton onClick={handleClose}>
            <XIcon />
          </IconButton>
        </Stack>

        <Stack spacing={3} sx={{ flex: "1 1 auto", overflowY: "auto" }}>
          {/* Main "Details" Card */}
          <Stack spacing={3}>
            <Stack
              direction="row"
              spacing={3}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography variant="h6">Details</Typography>

              {/* If not new and not editing => show "Edit" button */}
              {!isNew && !editing ? (
                <Button
                  color="secondary"
                  startIcon={<PencilSimpleIcon />}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              ) : null}

              {/* If editing => show "Save" and "Cancel" */}
              {editing && (
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={handleSave}>
                    Save
                  </Button>
                  <Button color="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                </Stack>
              )}
            </Stack>

            <Card sx={{ borderRadius: 1 }} variant="outlined">
              {/* If not editing => read-only, else => text fields */}
              {!editing ? (
                <PropertyList
                  divider={<Divider />}
                  sx={{ "--PropertyItem-padding": "12px 24px" }}
                >
                  <PropertyItem name="Question" value={localQuestion || "N/A"} />
                  <PropertyItem name="Statement Type" value={localStatementType || "N/A"} />
                  <PropertyItem name="Created at" value={fallbackCreated} />
                  <PropertyItem
                    name="Count"
                    value={
                      <Chip
                        icon={
                          <CheckCircleIcon
                            color="var(--mui-palette-success-main)"
                            weight="fill"
                          />
                        }
                        label={fallbackCount}
                        size="small"
                        variant="outlined"
                      />
                    }
                  />
                  <PropertyItem name="Avg Execution Time" value={fallbackExec} />
                  <PropertyItem name="Avg Bytes Processed" value={fallbackBytes} />
                </PropertyList>
              ) : (
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Question"
                    value={localQuestion}
                    onChange={(e) => setLocalQuestion(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Statement Type"
                    value={localStatementType}
                    onChange={(e) => setLocalStatementType(e.target.value)}
                    fullWidth
                  />
                  {/* "Created" and "Count" read-only or hidden */}
                  <Typography variant="body2" color="text.secondary">
                    Created: {fallbackCreated}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Count: {fallbackCount}
                  </Typography>
                </Box>
              )}
            </Card>
          </Stack>

          {/* Full Query section */}
          <Stack spacing={3}>
            <Typography variant="h6">Full Query</Typography>
            <Card sx={{ borderRadius: 1 }} variant="outlined">
              {!editing ? (
                <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
                  {localSql ? (
                    <>
                      <Box
                        sx={{
                          bgcolor: "#f9f9f9",
                          p: 2,
                          borderRadius: 1,
                          mb: 2,
                        }}
                      >
                        <pre style={{ margin: 0 }}>{localSql}</pre>
                      </Box>

                      {/* REPLACED "Do Something" BUTTON WITH "Open Query" DROPDOWN */}
                      <Button
                        variant="contained"
                        onClick={handleMenuClick}
                      >
                        Open Query
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleMenuClose}
                      >
                        <MenuItem
                          onClick={() => {
                            handleOpenLookerStudio(localSql);
                            handleMenuClose();
                          }}
                        >
                          Looker Studio
                        </MenuItem>
                        <MenuItem disabled>Tableau (coming soon)</MenuItem>
                        <MenuItem disabled>Power BI (coming soon)</MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No SQL
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="SQL"
                    multiline
                    minRows={4}
                    value={localSql}
                    onChange={(e) => {
                      setLocalSql(e.target.value);
                      // Reset the test status if user changes the query
                      setTestQueryStatus("idle");
                      setTestQueryErrorMessage("");
                    }}
                  />

                  {/* Test Query Button - calls /dry_run */}
                  <Button
                    variant="contained"
                    color={testQueryStatus === "success" ? "success" : "primary"}
                    onClick={handleTestQuery}
                  >
                    {testQueryStatus === "success"
                      ? `Query Valid - ${dryRunBytes}`
                      : "Test Query"}
                  </Button>

                  {testQueryStatus === "error" && testQueryErrorMessage && (
                    <Typography color="error" variant="body2">
                      {testQueryErrorMessage}
                    </Typography>
                  )}
                </Box>
              )}
            </Card>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
