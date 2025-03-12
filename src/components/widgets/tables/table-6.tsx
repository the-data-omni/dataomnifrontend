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
  CircularProgress,
  TablePagination,
} from "@mui/material";
import { MagnifyingGlass, List as ListIcon } from "@phosphor-icons/react";

import { DataTable } from "@/components/core/data-table";
import type { ColumnDef } from "@/components/core/data-table";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** API shape for scraping */
interface ApiTableItem {
  table_name: string;
  source_name: string;
  link?: string;
  columns: Array<{
    column_name: string;
    description: string;
  }>;
}

/** Flattened row shape */
interface FlattenedRow {
  tableName: string;
  sourceName: string;
  link?: string;
  columnName: string;
  columnDesc: string;
}

/** Helper to flatten the API response */
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

const ALL_COLUMNS = ["Table Name", "Source Name", "Column Name", "Description"];
const INITIAL_VISIBLE_COLUMNS = [...ALL_COLUMNS];

const SCRAPING_STEPS = [
  "Launching headless browser...",
  "Navigating to page...",
  "Collecting table data...",
  "Processing columns...",
  "Collecting and Formatting Data...",
];

/** Column definitions for the DataTable */
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

export function Table6() {
  // 1) Local "data" for display in our table
  const [data, setData] = useState<FlattenedRow[]>([]);

  // 2) On mount, load from localStorage (if any)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("scrapedData");
      if (stored) {
        const parsed: FlattenedRow[] = JSON.parse(stored);
        setData(parsed);
      }
    } catch (err) {
      console.error("Error reading from localStorage:", err);
    }
  }, []);

  // States for scraping
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [screenshot, setScreenshot] = useState("");

  // Steps modal
  const [modalOpen, setModalOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Column toggles
  const [visibleColumns, setVisibleColumns] = useState<string[]>(INITIAL_VISIBLE_COLUMNS);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [missingDescOnly, setMissingDescOnly] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* --------------------------------
     A) Show steps if loading
  ----------------------------------*/
  useEffect(() => {
    let intervalId: any;
    if (loading) {
      setModalOpen(true);
      setStepIndex(0);

      intervalId = setInterval(() => {
        setStepIndex((prev) => (prev < SCRAPING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setModalOpen(false);
      setStepIndex(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [loading]);

  /* --------------------------------
     B) handleScrape
  ----------------------------------*/
  async function handleScrape() {
    setError("");
    setScreenshot("");
    setPage(0);

    try {
      // Clear old data from the table
      setData([]);

      // 1) screenshot
      const ssResp = await fetch("http://127.0.0.1:8080/scrape_screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: docUrl }),
      });
      if (!ssResp.ok) {
        const sErr = await ssResp.json();
        throw new Error(sErr.error || "Failed to get screenshot");
      }
      const ssJson = await ssResp.json();
      setScreenshot(ssJson.screenshot || "");

      // 2) show steps
      setLoading(true);

      // 3) get data
      const dataResp = await fetch("http://127.0.0.1:8080/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: docUrl }),
      });
      if (!dataResp.ok) {
        const dErr = await dataResp.json();
        throw new Error(dErr.error || "Failed to get data");
      }
      const raw: ApiTableItem[] = await dataResp.json();
      const flattened = flattenData(raw);
      setData(flattened);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  /* --------------------------------
     C) handleSaveScrapedData (append, case-insensitive)
  ----------------------------------*/
  function handleSaveScrapedData() {
    if (!data.length) {
      alert("No scraped data to save.");
      return;
    }
    try {
      // 1) Load existing data from localStorage (if any)
      let existing: FlattenedRow[] = [];
      const stored = localStorage.getItem("scrapedData");
      if (stored) {
        existing = JSON.parse(stored);
      }

      // 2) Merge the new data by appending only non-duplicate rows
      //    We'll identify duplicates by (tableName, columnName) case-insensitive
      const merged = [...existing];
      for (const row of data) {
        const rowTableLower = row.tableName.toLowerCase();
        const rowColLower = row.columnName.toLowerCase();

        const alreadyInList = merged.find((r) => {
          return (
            r.tableName.toLowerCase() === rowTableLower &&
            r.columnName.toLowerCase() === rowColLower
          );
        });
        if (!alreadyInList) {
          merged.push(row);
        }
      }

      // 3) Store the merged array back into localStorage
      localStorage.setItem("scrapedData", JSON.stringify(merged));

      // 4) Update our local state so the table shows the combined data
      setData(merged);

      alert("Scraped data appended to localStorage (case-insensitive)!");
    } catch (err) {
      console.error("Error saving to localStorage:", err);
      alert("Error saving to localStorage. See console for details.");
    }
  }

  /* --------------------------------
     D) Column toggles & filters
  ----------------------------------*/
  function openColumnsMenu(e: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(e.currentTarget);
  }
  function closeColumnsMenu() {
    setAnchorEl(null);
  }
  function toggleColumn(colName: string) {
    setVisibleColumns((prev) =>
      prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
    );
  }

  function handleChangePage(_e: any, newPage: number) {
    setPage(newPage);
  }
  function handleChangeRowsPerPage(e: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }

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
          row.tableName + row.sourceName + row.columnName + row.columnDesc
        ).toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [data, tableFilter, sourceFilter, missingDescOnly, searchQuery]);

  const totalCount = filteredRows.length;
  const startIndex = page * rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  const displayedColumns = useMemo(() => {
    return columnDefs.filter((col) => visibleColumns.includes(col.name));
  }, [visibleColumns]);

  /* --------------------------------
     E) Render
  ----------------------------------*/
  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Card>
        {/* Steps overlay */}
        <Dialog
          open={modalOpen}
          PaperProps={{
            sx: {
              width: "40vw",
              height: "40vh",
              maxWidth: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              backgroundImage: `url(${
                screenshot || "https://via.placeholder.com/600x400?text=Page+Screenshot"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.4)",
              },
              overflow: "hidden",
            },
          }}
          BackdropProps={{ sx: { backdropFilter: "blur(3px)" } }}
        >
          <DialogContent
            sx={{
              textAlign: "center",
              position: "relative",
              zIndex: 2,
              color: "#fff",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress sx={{ color: "#fff", mb: 2 }} />
            <Typography variant="h6">{SCRAPING_STEPS[stepIndex]}</Typography>
          </DialogContent>
        </Dialog>

        {/* Controls */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ p: 3, alignItems: "center", flexWrap: "wrap" }}
        >
          <OutlinedInput
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="Enter or paste docs URL"
            sx={{ minWidth: 280, flex: 1 }}
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlass />
              </InputAdornment>
            }
          />
          <Button variant="contained" onClick={handleScrape} disabled={loading}>
            {loading ? "Scraping..." : "Scrape"}
          </Button>

          {/* Button to append to localStorage (case-insensitive) */}
          <Button variant="contained" color="secondary" onClick={handleSaveScrapedData}>
            Append to Local Storage
          </Button>
        </Stack>

        <Divider />

        {/* Filters */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ p: 3, flexWrap: "wrap", alignItems: "center" }}
        >
          <OutlinedInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlass />
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

          <Button variant="outlined" startIcon={<ListIcon />} onClick={openColumnsMenu}>
            Columns
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeColumnsMenu}>
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
        </Stack>

        <Divider />

        {/* Error (scrape error) */}
        {error && (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        )}

        {/* Data table */}
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

        {/* Pagination */}
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
