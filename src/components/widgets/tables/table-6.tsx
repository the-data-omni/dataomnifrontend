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

/* ---------------------------------------
   1) Data interfaces
----------------------------------------*/
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

/* ---------------------------------------
   2) Column definitions & toggles
----------------------------------------*/
const ALL_COLUMNS = ["Table Name", "Source Name", "Column Name", "Description"];
const INITIAL_VISIBLE_COLUMNS = [...ALL_COLUMNS];

const SCRAPING_STEPS = [
  "Launching headless browser...",
  "Navigating to page...",
  "Collecting table data...",
  "Processing columns...",
  "Collecting and Formatting Data..."
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

/* ---------------------------------------
   3) Flatten the API response
----------------------------------------*/
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
  /* --------------------------------
     A) States
  ----------------------------------*/
  const [data, setData] = useState<FlattenedRow[]>([]);
  const [loading, setLoading] = useState(false);   // triggers steps & blur
  const [error, setError] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [screenshot, setScreenshot] = useState(""); // For modal background

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
     B) Show steps if loading
  ----------------------------------*/
  useEffect(() => {
    let intervalId: any;
    if (loading) {
      setModalOpen(true);
      setStepIndex(0);

      // cycle steps
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
     C) handleScrape (two-step)
  ----------------------------------*/
  async function handleScrape() {
    setError("");
    setData([]);
    setScreenshot("");
    setPage(0);

    try {
      // 1) Get screenshot
      //   route: POST /scrape_screenshot
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

      // 2) Now show steps
      setLoading(true);

      // 3) Get data
      //   route: POST /scrape_data
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
     D) handle column toggles
  ----------------------------------*/
  function openMenu(e: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(e.currentTarget);
  }
  function closeMenu() {
    setAnchorEl(null);
  }
  function toggleColumn(colName: string) {
    setVisibleColumns((prev) =>
      prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
    );
  }

  /* --------------------------------
     E) handle filters & pagination
  ----------------------------------*/
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
        const text = (row.tableName + row.sourceName + row.columnName + row.columnDesc).toLowerCase();
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
     F) Render
  ----------------------------------*/
  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Card>
        {/* 
          1) The bigger modal for steps 
          includes screenshot as background 
        */}
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
              backgroundImage: `url(${screenshot || "https://via.placeholder.com/600x400?text=Page+Screenshot"})`,
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
          BackdropProps={{
            sx: { backdropFilter: "blur(3px)" },
          }}
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

        {/* 
          2) docUrl input + "Scrape" button
        */}
        <Stack direction="row" spacing={2} sx={{ p: 3, alignItems: "center" }}>
          <OutlinedInput
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="Enter or paste docs URL"
            sx={{ flex: 1 }}
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlass />
              </InputAdornment>
            }
          />
          <Button variant="contained" onClick={handleScrape} disabled={loading}>
            {loading ? "Scraping..." : "Scrape"}
          </Button>
        </Stack>

        <Divider />

        {/* 
          3) Filters row 
        */}
        <Stack direction="row" spacing={2} sx={{ p: 3, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
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

          {/* Table Filter */}
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

          {/* Source Filter */}
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

          {/* Column toggles */}
          <Button variant="outlined" startIcon={<ListIcon />} onClick={(e) => setAnchorEl(e.currentTarget)}>
            Columns
          </Button>
        </Stack>

        {/* Column toggles menu */}
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

        {/* 
          4) Error 
        */}
        {error && (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        )}

        {/* 
          5) Data Table (blurred while loading)
        */}
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

        {/* 
          6) Pagination
        */}
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
