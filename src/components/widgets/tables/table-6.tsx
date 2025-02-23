"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  Divider,
  Stack,
  OutlinedInput,
  InputAdornment,
  Select,
  MenuItem,
  Button,
  Typography,
  Menu,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Switch,
  Dialog,
  DialogContent,
  CircularProgress
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import { MagnifyingGlass, List as ListIcon } from "@phosphor-icons/react";

import { DataTable } from "@/components/core/data-table";
import type { ColumnDef } from "@/components/core/data-table";

// ---------------------------
// 1) Define data interfaces
// ---------------------------
interface ApiTableItem {
  table_name: string;
  source_name: string;
  link?: string;
  columns: Array<{
    column_name: string;
    description: string;
  }>;
}

interface FlattenedRow {
  tableName: string;
  sourceName: string;
  link?: string;
  columnName: string;
  columnDesc: string;
}

// ---------------------------
// 2) Column definitions etc.
// ---------------------------
const ALL_COLUMNS = ["Table Name", "Source Name", "Column Name", "Description"];
const INITIAL_VISIBLE_COLUMNS = [...ALL_COLUMNS];

// Hard-coded scraping steps (shown in the modal)
const SCRAPING_STEPS = [
  "Launching headless browser...",
  "Navigating to page...",
  "Collecting table data...",
  "Processing columns...",
  "Finalizing..."
];

const columnDefs: ColumnDef<FlattenedRow>[] = [
  {
    name: "Table Name",
    field: "tableName",
    width: "180px",
  },
  {
    name: "Source Name",
    width: "180px",
    formatter: (row) => {
      // Show link if available
      if (row.link) {
        return (
          <a href={row.link} target="_blank" rel="noreferrer">
            {row.sourceName}
          </a>
        );
      }
      return row.sourceName;
    },
  },
  {
    name: "Column Name",
    field: "columnName",
    width: "180px",
  },
  {
    name: "Description",
    field: "columnDesc",
    width: "300px",
  },
];

// Flatten the API response so each "column" becomes one row
function flattenData(apiResponse: ApiTableItem[]): FlattenedRow[] {
  return apiResponse.flatMap((tableObj) =>
    tableObj.columns.map((col) => ({
      tableName: tableObj.table_name,
      sourceName: tableObj.source_name,
      link: tableObj.link,
      columnName: col.column_name,
      columnDesc: col.description,
    }))
  );
}

export function Table6() {
  // --------------------------------
  // A) States for data & scraping
  // --------------------------------
  const [data, setData] = useState<FlattenedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // The user-entered doc URL
  const [docUrl, setDocUrl] = useState(
    "https://fivetran.github.io/dbt_salesforce/#!/source/source.salesforce_source.salesforce.user_role#sources"
  );

  // --------------------------------
  // B) Modal logic for scraping steps
  // --------------------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Once loading is triggered, we open the modal and run a timer
  useEffect(() => {
    let intervalId: any;
    if (loading) {
      setModalOpen(true);
      setStepIndex(0);

      // Advance one step every ~1.5 seconds (adjust as you like)
      intervalId = setInterval(() => {
        setStepIndex((prev) => {
          if (prev < SCRAPING_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1500);
    } else {
      // If not loading, ensure we close the modal and reset
      setModalOpen(false);
      setStepIndex(0);
    }
    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loading]);

  // --------------------------------
  // C) Column visibility
  // --------------------------------
  const [visibleColumns, setVisibleColumns] = useState<string[]>(INITIAL_VISIBLE_COLUMNS);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function openMenu(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function closeMenu() {
    setAnchorEl(null);
  }
  function toggleColumn(colName: string) {
    setVisibleColumns((prev) =>
      prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
    );
  }

  // --------------------------------
  // D) Filters & search
  // --------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [missingDescOnly, setMissingDescOnly] = useState(false);

  // --------------------------------
  // E) Pagination
  // --------------------------------
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  function handleChangePage(_event: any, newPage: number) {
    setPage(newPage);
  }
  function handleChangeRowsPerPage(e: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }

  // --------------------------------
  // F) Data fetching function
  // --------------------------------
  async function handleScrape() {
    setLoading(true);
    setError("");
    setData([]);
    setPage(0);

    try {
      const response = await fetch("http://127.0.0.1:5080/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: docUrl }),
      });
      if (!response.ok) {
        const msg = await response.json();
        setError(msg.error || "An error occurred.");
      } else {
        const raw: ApiTableItem[] = await response.json();
        const flattened = flattenData(raw);
        setData(flattened);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------
  // G) Filter + Paginate
  // --------------------------------
  const uniqueTableNames = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.tableName)));
  }, [data]);

  const uniqueSourceNames = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.sourceName)));
  }, [data]);

  const filteredRows = useMemo(() => {
    return data.filter((row) => {
      if (tableFilter && row.tableName !== tableFilter) return false;
      if (sourceFilter && row.sourceName !== sourceFilter) return false;
      if (missingDescOnly && row.columnDesc) return false;

      if (searchQuery) {
        const text = (
          row.tableName +
          row.sourceName +
          row.columnName +
          row.columnDesc
        ).toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }

      return true;
    });
  }, [data, tableFilter, sourceFilter, missingDescOnly, searchQuery]);

  const totalCount = filteredRows.length;
  const startIndex = page * rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  // Columns to display
  const displayedColumns = useMemo(() => {
    return columnDefs.filter((col) => visibleColumns.includes(col.name));
  }, [visibleColumns]);

  // --------------------------------
  // H) Render
  // --------------------------------
  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Card>
        {/* Scraping Steps Modal (only shows while loading) */}
        <Dialog
          open={modalOpen}
          PaperProps={{
            sx: {
              // Example background image (placeholder or screenshot)
              // If you generate an actual screenshot, place the URL below
              backgroundImage:
                "url('https://via.placeholder.com/600x400?text=Page+Screenshot')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              // Some dark overlay so text is readable
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.4)",
              },
              overflow: "hidden",
            },
          }}
          BackdropProps={{
            sx: { backdropFilter: "blur(3px)" },
          }}
        >
          <DialogContent sx={{ textAlign: "center", position: "relative", zIndex: 2 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2, color: "#fff" }}>
              {SCRAPING_STEPS[stepIndex]}
            </Typography>
          </DialogContent>
        </Dialog>

        {/* 1) Top bar with docUrl and "Scrape" button */}
        <Stack direction="row" spacing={2} sx={{ p: 3, alignItems: "center" }}>
          <OutlinedInput
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="Enter or paste docs URL"
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlass />
              </InputAdornment>
            }
            sx={{ flex: 1 }}
          />
          <Button variant="contained" onClick={handleScrape} disabled={loading}>
            {loading ? "Scraping..." : "Scrape"}
          </Button>
        </Stack>

        <Divider />

        {/* 2) Filter row */}
        <Stack direction="row" spacing={2} sx={{ p: 3, flexWrap: "wrap", alignItems: "center" }}>
          <OutlinedInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlass fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
            sx={{ width: 240 }}
          />

          <Select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            displayEmpty
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Tables</MenuItem>
            {uniqueTableNames.map((tbl) => (
              <MenuItem key={tbl} value={tbl}>
                {tbl}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            displayEmpty
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Sources</MenuItem>
            {uniqueSourceNames.map((src) => (
              <MenuItem key={src} value={src}>
                {src}
              </MenuItem>
            ))}
          </Select>

          <FormControlLabel
            control={
              <Switch
                checked={missingDescOnly}
                onChange={(e) => setMissingDescOnly(e.target.checked)}
              />
            }
            label="Missing Description"
          />

          <Button variant="outlined" startIcon={<ListIcon />} onClick={(e) => setAnchorEl(e.currentTarget)}>
            Columns
          </Button>
        </Stack>

        {/* Columns Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <FormGroup sx={{ p: 2 }}>
            {ALL_COLUMNS.map((colName) => (
              <FormControlLabel
                key={colName}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(colName)}
                    onChange={() => toggleColumn(colName)}
                  />
                }
                label={colName}
              />
            ))}
          </FormGroup>
        </Menu>

        <Divider />

        {/* 3) Error */}
        {error && (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        )}

        {/* 4) The table itself (blurred if loading) */}
        <Box
          sx={{
            overflowX: "auto",
            filter: loading ? "blur(2px)" : "none",
            transition: "filter 0.2s ease",
          }}
        >
          <DataTable<FlattenedRow> columns={displayedColumns} rows={paginatedRows} />
        </Box>

        <Divider />

        {/* 5) Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
    </Box>
  );
}
