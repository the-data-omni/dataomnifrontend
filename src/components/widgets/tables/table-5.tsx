"use client";

import * as React from "react";
import {
  Box,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  Typography,
  MenuItem,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Menu,
  FormGroup,
  FormControlLabel as MUICheckboxLabel,
  Collapse
} from "@mui/material";
import {
  MagnifyingGlass,
  PencilSimple,
  Check,
  X,
  List as ListIcon,
  CaretDown,
  CaretUp
} from "@phosphor-icons/react";

import TablePagination from "@mui/material/TablePagination";
import { DataTable } from "@/components/core/data-table";
import { Option } from "@/components/core/option";

import { SchemaContext } from "@/components/dashboard/layout/SchemaContext";
import { useFlattenedFields } from "@/hooks/utils/useFlattenedFields";
import type { FlattenedField } from "@/hooks/utils/types";
import type { ColumnDef } from "@/components/core/data-table";

import { useQueryDrawer } from "@/components/dashboard/chat/context/query-drawer-context";

// isomorphic-git + lightning-fs
import * as git from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";
import http from "isomorphic-git/http/web";

// Utility to simulate delay in the multi-step "Get Descriptions" flow
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ALL_COLUMNS = [
  "Select Field",
  "Dataset",
  "Table Name",
  "Field Name",
  "Data Type",
  "Field Description",
  "Primary Key",
  "Foreign Key",
  "Field Mode",
  "Actions",
  "Access Instructions"
];

const INITIAL_VISIBLE_COLUMNS = [
  "Dataset",
  "Table Name",
  "Field Name",
  "Field Description"
];

// Additional Fivetran column names to detect
const FIVETRAN_COLUMNS = [
  "_fivetran_synced",
  "_fivetran_id",
  "_fivetran_start",
  "_fivetran_active",
  "_fivetran_end"
];

export function Table5() {
  // 1) Flattened fields + query drawer
  const { selectedSchemaName } = React.useContext(SchemaContext);
  const { data = [], isLoading, error } = useFlattenedFields(selectedSchemaName);

  const {
    columns: selectedColumns,
    addColumnToQuery,
    removeColumnFromQuery,
    openDrawer,
    setTableName
  } = useQueryDrawer();

  // Local data for editing and display – updated from original data or a committed file
  const [augmentedData, setAugmentedData] = React.useState<FlattenedField[]>([]);
  React.useEffect(() => {
    setAugmentedData(data);
  }, [data]);

  // Inline editing states
  const [editingFieldKey, setEditingFieldKey] = React.useState<string | null>(null);
  const [tempDescription, setTempDescription] = React.useState("");
  const [tempPrimaryKey, setTempPrimaryKey] = React.useState<boolean>(false);
  const [tempForeignKey, setTempForeignKey] = React.useState<boolean>(false);

  // Filtering
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tableFilter, setTableFilter] = React.useState("");
  const [datasetFilter, setDatasetFilter] = React.useState("");
  const [missingDescription, setMissingDescription] = React.useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // "Get Descriptions" dialog states
  // NOTE: We'll use the same modal for scanning + merging descriptions,
  //       but insert a step for detecting Fivetran/GA datasets.
  const [descProgress, setDescProgress] = React.useState(0); // 0=idle, 1=scan, 2=found, 3=adding, 4=done
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // The existing "found" counts from user code
  const [descFoundCount, setDescFoundCount] = React.useState(0);
  const [matchedTables, setMatchedTables] = React.useState<{ dataset: string; tableName: string }[]>([]);

  // **New** states to store detected Fivetran + GA datasets
  const [fivetranDatasets, setFivetranDatasets] = React.useState<string[]>([]);
  const [gaDatasets, setGaDatasets] = React.useState<string[]>([]);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(INITIAL_VISIBLE_COLUMNS);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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

  // "Access Instructions" row expansion
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null);
  function toggleExpandRow(rowIndex: number) {
    setExpandedRow((prev) => (prev === rowIndex ? null : rowIndex));
  }

  // 2) Ephemeral Git Setup
  const [fsBase] = React.useState(() => new LightningFS("table5-fs"));
  const pfs = fsBase.promises;

  // We'll track two branches: "main" and "feature/desc-updates"
  // Default to "feature/desc-updates"
  const [currentBranch, setCurrentBranch] = React.useState("feature/desc-updates");

  // We'll track if "main" has new commits => can update BQ
  const [mainHasNewCommits, setMainHasNewCommits] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        await pfs.stat("/repo/.git");
        console.log("Ephemeral repo already exists");
      } catch {
        console.log("No ephemeral .git found; init now...");
        await pfs.mkdir("/repo").catch(() => {});
        await git.init({ fs: fsBase, dir: "/repo", defaultBranch: "main" });
        await git.setConfig({
          fs: fsBase,
          dir: "/repo",
          path: "user.name",
          value: "BrowserUser"
        });
        await git.setConfig({
          fs: fsBase,
          dir: "/repo",
          path: "user.email",
          value: "browser@example.com"
        });
      }

      try {
        const existingBranches = await git.listBranches({ fs: fsBase, dir: "/repo" });
        console.log("Local branches at init:", existingBranches);
        if (!existingBranches.includes("feature/desc-updates")) {
          await git.branch({
            fs: fsBase,
            dir: "/repo",
            ref: "feature/desc-updates"
          });
          console.log('Created "feature/desc-updates" branch');
        }
        await git.checkout({
          fs: fsBase,
          dir: "/repo",
          ref: currentBranch
        });
        console.log(`Checked out branch "${currentBranch}"`);
      } catch (err) {
        console.error("Error creating/checking out feature branch:", err);
      }
    })();
  }, [fsBase, pfs, currentBranch]);

  // Load committed data from the file on the current branch (or fall back to original data)
  React.useEffect(() => {
    (async () => {
      const fileName = "table5_descriptions.json";
      try {
        let content = await pfs.readFile(`/repo/${fileName}`, "utf8");
        if (content instanceof Uint8Array) {
          content = new TextDecoder("utf8").decode(content);
        }
        const parsedData = JSON.parse(content);
        setAugmentedData(parsedData);
        console.log(`Loaded committed data from branch ${currentBranch}`);
      } catch (err) {
        setAugmentedData(data);
        console.log(`No committed data for branch ${currentBranch}. Using original data.`);
      }
    })();
  }, [currentBranch, data, pfs]);

  /** Commits changes (augmentedData) to the current branch. */
  async function commitToCurrentBranch() {
    try {
      const fileName = "table5_descriptions.json";
      const content = JSON.stringify(augmentedData, null, 2);
      await pfs.writeFile(`/repo/${fileName}`, content, "utf8");
      await git.add({ fs: fsBase, dir: "/repo", filepath: fileName });
      const sha = await git.commit({
        fs: fsBase,
        dir: "/repo",
        message: "Work in progress on field desc",
        author: { name: "BrowserUser", email: "browser@example.com" }
      });
      console.log(`Committed to ${currentBranch}, SHA=${sha}`);
      alert(`Committed changes to branch '${currentBranch}'! (SHA: ${sha})`);
      try {
        let fileContent = await pfs.readFile(`/repo/${fileName}`, "utf8");
        if (fileContent instanceof Uint8Array) {
          fileContent = new TextDecoder("utf8").decode(fileContent);
        }
        const parsedData = JSON.parse(fileContent);
        setAugmentedData(parsedData);
      } catch (err) {
        console.error("Error reloading committed data:", err);
      }
    } catch (err) {
      console.error("commitToCurrentBranch error:", err);
      alert(String(err));
    }
  }

  /** Merge "feature/desc-updates" -> "main" and flag if new commits exist. */
  async function mergeFeatureIntoMain() {
    try {
      await git.checkout({ fs: fsBase, dir: "/repo", ref: "main" });
      setCurrentBranch("main");
      const mergeResult = await git.merge({
        fs: fsBase,
        dir: "/repo",
        ours: "main",
        theirs: "feature/desc-updates"
      });
      console.log("mergeResult:", mergeResult);
      const { alreadyMerged, fastForward, mergeCommit, oid } = mergeResult || {};
      if (alreadyMerged) {
        alert("No changes. 'feature/desc-updates' was already merged into main!");
      } else if (fastForward) {
        alert(`Fast-forwarded feature/desc-updates into main! (OID: ${oid})`);
        setMainHasNewCommits(true);
      } else if (mergeCommit) {
        alert(`Merged feature/desc-updates into main with a merge commit! OID: ${oid}`);
        setMainHasNewCommits(true);
      } else {
        alert("Merge result unclear; no fast-forward, no new commit, not already merged?");
      }
    } catch (err) {
      console.error("mergeFeatureIntoMain error:", err);
      alert(String(err));
    }
  }

  /** "Update BigQuery" only if mainHasNewCommits is true.
   *  Button text changes to "Updating" while in progress.
   */
  const [updatingBQ, setUpdatingBQ] = React.useState(false);
  async function handleUpdateBigQuery() {
    if (!mainHasNewCommits) {
      return alert("No new commits in main. Please merge your feature changes into main first.");
    }
    setUpdatingBQ(true);
    const payload = {
      schema: augmentedData.map((item) => ({
        table_catalog: item.table_catalog,
        table_schema: item.table_schema,
        table_name: item.table_name,
        column_name: item.column_name,
        field_path: item.field_path || item.column_name,
        description: item.description || ""
      }))
    };
    try {
      const res = await fetch("http://127.0.0.1:8080/update_descriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Failed to update BQ, status: ${res.status}`);
      }
      const json = await res.json();
      console.log("BQ updated successfully:", json);
      alert("Updated BigQuery from main branch changes!");
      setMainHasNewCommits(false);
    } catch (err) {
      console.error("Error updating BQ:", err);
      alert(String(err));
    } finally {
      setUpdatingBQ(false);
    }
  }

  /**
   * Instead of a toggle group, use a single dropdown to select the branch.
   */
  async function handleBranchChange(newBranch: string) {
    try {
      await git.checkout({ fs: fsBase, dir: "/repo", ref: newBranch });
      setCurrentBranch(newBranch);
      alert(`Switched to branch: ${newBranch}`);
    } catch (err) {
      console.error("handleBranchChange error:", err);
      alert(String(err));
    }
  }

  /**
   * Combined dropdown for version control actions: commit or merge.
   */
  const [anchorElCommitMerge, setAnchorElCommitMerge] = React.useState<null | HTMLElement>(null);
  function handleCommitMergeClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorElCommitMerge(event.currentTarget);
  }
  function handleCommitMergeClose() {
    setAnchorElCommitMerge(null);
  }

  /**
   * Combined dropdown for revert actions: revert unsaved changes or reset to original.
   */
  const [anchorElRevertReset, setAnchorElRevertReset] = React.useState<null | HTMLElement>(null);
  function handleRevertResetClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorElRevertReset(event.currentTarget);
  }
  function handleRevertResetClose() {
    setAnchorElRevertReset(null);
  }

  /**
   * Revert unsaved changes by reloading the last committed state.
   * If no committed file exists, revert to the original data.
   */
  async function revertChanges() {
    const fileName = "table5_descriptions.json";
    try {
      let content = await pfs.readFile(`/repo/${fileName}`, "utf8");
      if (content instanceof Uint8Array) {
        content = new TextDecoder("utf8").decode(content);
      }
      const parsedData = JSON.parse(content);
      setAugmentedData(parsedData);
      alert("Reverted changes to the last committed state.");
    } catch (err) {
      setAugmentedData(data);
      alert("No committed data found; reverted to original state.");
    }
  }

  /**
   * Completely reset the data to the original file.
   */
  function resetToOriginal() {
    setAugmentedData(data);
    alert("Reset to the original file.");
  }

  // Editing logic
  function handleEdit(row: FlattenedField) {
    const rowKey = row.table_name + "." + row.column_name;
    setEditingFieldKey(rowKey);
    setTempDescription(row.description || "");
    setTempPrimaryKey(!!row.primary_key);
    setTempForeignKey(!!row.foreign_key);
  }
  function handleSaveDescription(fieldKey: string) {
    const updated = augmentedData.map((item) => {
      const itemKey = item.table_name + "." + item.column_name;
      if (itemKey === fieldKey) {
        return {
          ...item,
          description: tempDescription,
          primary_key: tempPrimaryKey,
          foreign_key: tempForeignKey
        };
      }
      return item;
    });
    setAugmentedData(updated);
    setEditingFieldKey(null);
    setTempDescription("");
    setTempPrimaryKey(false);
    setTempForeignKey(false);
  }
  function handleCancelEdit() {
    setEditingFieldKey(null);
    setTempDescription("");
    setTempPrimaryKey(false);
    setTempForeignKey(false);
  }

  function getFieldRef(row: FlattenedField) {
    if (row.table_name.includes("*")) return `${row.column_name}`;
    return `${row.table_schema}.${row.table_name}.${row.column_name}`;
  }
  function isFieldSelected(row: FlattenedField): boolean {
    return selectedColumns.includes(getFieldRef(row));
  }

  // Column definitions
  const allColumnDefs = React.useMemo<ColumnDef<FlattenedField>[]>(() => {
    return [
      {
        name: "Select Field",
        align: "center",
        width: 60,
        formatter: (row) => {
          const fromClause = row.access_instructions?.from_clause || "";
          const selectExpr = row.access_instructions?.select_expr || getFieldRef(row);
          return (
            <Checkbox
              size="small"
              checked={selectedColumns.includes(selectExpr)}
              onChange={(e) => {
                if (e.target.checked) {
                  setTableName(fromClause);
                  addColumnToQuery(selectExpr);
                } else {
                  removeColumnFromQuery(selectExpr);
                }
              }}
            />
          );
        }
      },
      {
        name: "Dataset",
        formatter: (row) => row.table_schema,
        width: 160
      },
      {
        name: "Table Name",
        formatter: (row) => (
          <Link color="text.primary" underline="none" variant="subtitle2">
            {row.table_name}
          </Link>
        ),
        width: 160
      },
      {
        name: "Field Name",
        formatter: (row) => row.column_name,
        width: 160
      },
      {
        name: "Data Type",
        width: 120,
        formatter: (row) => row.data_type || ""
      },
      {
        name: "Field Description",
        width: 220,
        formatter: (row) => {
          const fieldKey = row.table_name + "." + row.column_name;
          if (editingFieldKey === fieldKey) {
            return (
              <TextField
                size="small"
                fullWidth
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
              />
            );
          }
          return row.description || "";
        }
      },
      {
        name: "Primary Key",
        width: 120,
        formatter: (row) => {
          const fieldKey = row.table_name + "." + row.column_name;
          if (editingFieldKey === fieldKey) {
            return (
              <Select
                size="small"
                value={tempPrimaryKey ? "yes" : "no"}
                onChange={(e) => {
                  setTempPrimaryKey(e.target.value === "yes");
                }}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            );
          }
          return row.primary_key ? (
            <Chip label="Yes" color="success" size="small" variant="soft" />
          ) : (
            <Chip label="No" size="small" variant="soft" />
          );
        }
      },
      {
        name: "Foreign Key",
        width: 120,
        formatter: (row) => {
          const fieldKey = row.table_name + "." + row.column_name;
          if (editingFieldKey === fieldKey) {
            return (
              <Select
                size="small"
                value={tempForeignKey ? "yes" : "no"}
                onChange={(e) => {
                  setTempForeignKey(e.target.value === "yes");
                }}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            );
          }
          return row.foreign_key ? (
            <Chip label="Yes" color="warning" size="small" variant="soft" />
          ) : (
            <Chip label="No" size="small" variant="soft" />
          );
        }
      },
      {
        name: "Field Mode",
        width: 120,
        formatter: (row) => row.field_mode || ""
      },
      {
        name: "Actions",
        align: "right",
        hideName: true,
        width: 80,
        formatter: (row) => {
          const fieldKey = row.table_name + "." + row.column_name;
          if (editingFieldKey === fieldKey) {
            return (
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => handleSaveDescription(fieldKey)} color="primary">
                  <Check size={18} />
                </IconButton>
                <IconButton onClick={handleCancelEdit} color="inherit">
                  <X size={18} />
                </IconButton>
              </Stack>
            );
          }
          return (
            <IconButton onClick={() => handleEdit(row)}>
              <PencilSimple />
            </IconButton>
          );
        }
      },
      {
        name: "Access Instructions",
        width: 80,
        formatter: (row, rowIndex) => {
          const isExpanded = expandedRow === rowIndex;
          return (
            <Box>
              <IconButton onClick={() => toggleExpandRow(rowIndex)}>
                {isExpanded ? <CaretUp /> : <CaretDown />}
              </IconButton>
              <Collapse in={isExpanded} unmountOnExit>
                <Box
                  sx={{
                    p: 1,
                    borderLeft: "2px solid #ccc",
                    marginLeft: 2,
                    marginTop: 1
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">
                    FROM Clause
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", fontFamily: "monospace", whiteSpace: "pre-wrap" }}
                  >
                    {row.access_instructions?.from_clause || "N/A"}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ mt: 1 }}>
                    SELECT Expr
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", fontFamily: "monospace", whiteSpace: "pre-wrap" }}
                  >
                    {row.access_instructions?.select_expr || "N/A"}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          );
        }
      }
    ];
  }, [
    editingFieldKey,
    tempDescription,
    tempPrimaryKey,
    tempForeignKey,
    selectedColumns,
    expandedRow,
    addColumnToQuery,
    removeColumnFromQuery,
    setTableName
  ]);

  const displayedColumns = React.useMemo(() => {
    return allColumnDefs.filter((col) => visibleColumns.includes(col.name));
  }, [allColumnDefs, visibleColumns]);

  // Filtering & pagination
  const filteredRows = React.useMemo(() => {
    return augmentedData.filter((row) => {
      if (tableFilter && row.table_name !== tableFilter) return false;
      if (datasetFilter && row.table_schema !== datasetFilter) return false;
      if (missingDescription && row.description) return false;
      if (searchQuery) {
        const lowerName = row.column_name.toLowerCase();
        if (!lowerName.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [augmentedData, tableFilter, datasetFilter, missingDescription, searchQuery]);

  const totalCount = filteredRows.length;
  const startIndex = currentPage * rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  function handlePageChange(_event: any, newPage: number) {
    setCurrentPage(newPage);
  }
  function handleRowsPerPageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(0);
  }

  // "Get Descriptions" logic (now includes detecting Fivetran & GA)
  async function handleGetDescriptions() {
    try {
      setDialogOpen(true);
      setDescProgress(1);
      await sleep(1000);

      // -------------------------------------
      // Step 1: "Scanning schema..."
      //  => Do nothing special besides wait.
      // -------------------------------------

      // -------------------------------------
      // Step 2: Detect Fivetran & GA datasets
      //         AND also fetch your localScraped + /my-schema
      // -------------------------------------
      setDescProgress(2);

      // 2a) Attempt to load localStorage data
      let localScraped: {
        tableName: string;
        columnName: string;
        columnDesc: string;
      }[] = [];
      try {
        const stored = localStorage.getItem("scrapedData");
        if (stored) {
          localScraped = JSON.parse(stored);
        }
      } catch (err) {
        console.error("Error parsing scrapedData from localStorage:", err);
      }

      // 2b) Build a quick lookup from localScraped
      const localMap = new Map<string, string>();
      localScraped.forEach((item) => {
        const key =
          item.tableName.toLowerCase() + "." + item.columnName.toLowerCase();
        localMap.set(key, item.columnDesc);
      });

      // 2c) Fetch /my-schema.json
      const res = await fetch("/my-schema.json");
      if (!res.ok) {
        throw new Error(`Failed to load schema file. Status ${res.status}`);
      }
      const schema = await res.json();
      setDescFoundCount(schema.length);

      // 2d) Detect Fivetran or GA from augmentedData
      const fivetranFound = new Set<string>();
      const gaFound = new Set<string>();

      augmentedData.forEach((row) => {
        // If any known Fivetran column is present => that dataset is Fivetran
        if (FIVETRAN_COLUMNS.includes(row.column_name.toLowerCase())) {
          fivetranFound.add(row.table_schema);
        }
        // If the table name starts with "events_" => GA dataset
        if (row.table_name.toLowerCase().startsWith("events_")) {
          gaFound.add(row.table_schema);
        }
      });
      setFivetranDatasets(Array.from(fivetranFound));
      setGaDatasets(Array.from(gaFound));

      // 2e) Identify matched tables for your progress UI
      const matched: { dataset: string; tableName: string }[] = [];

      // We'll still follow your original logic for merging descriptions:
      augmentedData.forEach((row) => {
        if (!row.description) {
          const rowTableLower = row.table_name.toLowerCase();
          const rowColLower = row.column_name.toLowerCase();

          // localMap first
          const localKey = rowTableLower + "." + rowColLower;
          const localDesc = localMap.get(localKey);
          if (localDesc) {
            matched.push({ dataset: row.table_schema, tableName: row.table_name });
            return;
          }

          // Then fallback to /my-schema
          const tbl = schema.find((t: any) => t.table_name.toLowerCase() === rowTableLower);
          if (tbl && tbl.columns) {
            const col = tbl.columns.find(
              (c: any) => c.column_name.toLowerCase() === rowColLower
            );
            if (col && col.description) {
              matched.push({ dataset: row.table_schema, tableName: row.table_name });
            }
          }
        }
      });

      // Deduplicate matched
      const uniqueMatched: { dataset: string; tableName: string }[] = [];
      const seen = new Set<string>();
      for (const m of matched) {
        const key = m.dataset + ":" + m.tableName;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMatched.push(m);
        }
      }
      setMatchedTables(uniqueMatched);

      await sleep(1000);

      // -------------------------------------
      // Step 3: "Adding descriptions..."
      // -------------------------------------
      setDescProgress(3);
      await sleep(1200);

      // Actually update augmentedData with merged descriptions
      const updated = augmentedData.map((row) => {
        if (!row.description) {
          const rowTableLower = row.table_name.toLowerCase();
          const rowColLower = row.column_name.toLowerCase();

          // localMap first
          const localKey = rowTableLower + "." + rowColLower;
          const localDesc = localMap.get(localKey);
          if (localDesc) {
            return { ...row, description: localDesc };
          }

          // Then fallback to /my-schema
          const tbl = schema.find((t: any) => t.table_name.toLowerCase() === rowTableLower);
          if (tbl && tbl.columns) {
            const col = tbl.columns.find(
              (c: any) => c.column_name.toLowerCase() === rowColLower
            );
            if (col && col.description) {
              return { ...row, description: col.description };
            }
          }
        }
        return row;
      });
      setAugmentedData(updated);

      // -------------------------------------
      // Step 4: "Done!"
      // -------------------------------------
      await sleep(1000);
      setDescProgress(4);
      await sleep(1200);
      setDescProgress(0);
      setDialogOpen(false);
    } catch (err) {
      console.error("Error fetching schema descriptions:", err);
      setDescProgress(0);
      setDialogOpen(false);
    }
  }

  function renderDialogContent() {
    switch (descProgress) {
      case 1:
        return (
          <>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Scanning schema...
            </Typography>
          </>
        );

      case 2:
        // Show the newly found Fivetran & GA datasets, plus the existing "Found X dataset(s)..." text
        return (
          <>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Found {descFoundCount} dataset(s) in my-schema...
            </Typography>

            {/* Fivetran & GA results */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Fivetran Datasets Detected:</Typography>
              {fivetranDatasets.length > 0 ? (
                <List dense>
                  {fivetranDatasets.map((ds) => (
                    <ListItem key={ds}>
                      <ListItemText primary={ds} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  None
                </Typography>
              )}

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Google Analytics Datasets Detected:
              </Typography>
              {gaDatasets.length > 0 ? (
                <List dense>
                  {gaDatasets.map((ds) => (
                    <ListItem key={ds}>
                      <ListItemText primary={ds} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  None
                </Typography>
              )}
            </Box>

            {/* The matched tables for which we have new descriptions */}
            <Box sx={{ mt: 2, maxHeight: 200, overflowY: "auto" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Will add descriptions to:
              </Typography>
              {matchedTables.length > 0 ? (
                <List dense>
                  {matchedTables.map((m, idx) => (
                    <ListItem key={`${m.dataset}:${m.tableName}:${idx}`}>
                      <ListItemText primary={m.tableName} secondary={`dataset: ${m.dataset}`} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  0 descriptions added.
                </Typography>
              )}
            </Box>
          </>
        );

      case 3:
        return (
          <>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Adding descriptions...
            </Typography>
          </>
        );

      case 4:
        return (
          <>
            <Check size={48} color="green" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Process complete!
            </Typography>
            {matchedTables.length === 0 && (
              <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
                0 descriptions added.
              </Typography>
            )}
          </>
        );

      default:
        return null;
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ p: 3 }}>Loading schema fields...</Card>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ p: 3, color: "error.main" }}>
          Error loading fields: {String(error)}
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Card>
        {/* "Get Descriptions" Dialog */}
        <Dialog
          open={dialogOpen}
          BackdropProps={{ sx: { backdropFilter: "blur(5px)" } }}
          PaperProps={{
            sx: {
              width: 400,
              minHeight: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              p: 3
            }
          }}
        >
          <DialogContent>{renderDialogContent()}</DialogContent>
        </Dialog>

        {/* Filters and Column Toggles */}
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", p: 3 }}>
          <OutlinedInput
            placeholder="Search fields"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlass fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
            sx={{ maxWidth: "100%", width: "300px" }}
          />
          <Select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            displayEmpty
            sx={{ maxWidth: "100%", width: "240px" }}
          >
            <Option value="">All tables</Option>
            {Array.from(new Set(augmentedData.map((f) => f.table_name))).map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>
          <Select
            value={datasetFilter}
            onChange={(e) => setDatasetFilter(e.target.value)}
            displayEmpty
            sx={{ maxWidth: "100%", width: "240px" }}
          >
            <Option value="">All datasets</Option>
            {Array.from(new Set(augmentedData.map((f) => f.table_schema))).map((ds) => (
              <Option key={ds} value={ds}>
                {ds}
              </Option>
            ))}
          </Select>
          <FormControlLabel
            control={
              <Switch
                checked={missingDescription}
                onChange={(e) => setMissingDescription(e.target.checked)}
              />
            }
            label="Missing Description"
          />

          <Button variant="outlined" startIcon={<ListIcon />} onClick={openMenu}>
            Columns
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
            <FormGroup sx={{ p: 2 }}>
              {ALL_COLUMNS.map((colName) => (
                <MUICheckboxLabel
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

        {/* Data Table */}
        <Box sx={{ overflowX: "auto" }}>
          <DataTable<FlattenedField> columns={displayedColumns} rows={paginatedRows} />
        </Box>

        <Divider />

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={currentPage}
          onPageChange={(_e, newPage) => setCurrentPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setCurrentPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />

        <Divider />

        {/* Bottom Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          {/* Branch Selector Dropdown */}
          <Select
            value={currentBranch}
            onChange={(e) => handleBranchChange(e.target.value as string)}
            size="small"
            variant="outlined"
          >
            <MenuItem value="main">main</MenuItem>
            <MenuItem value="feature/desc-updates">feature/desc-updates</MenuItem>
          </Select>

          {/* Combined Commit / Merge Dropdown */}
          <Button variant="outlined" onClick={handleCommitMergeClick} endIcon={<CaretDown />}>
            Version Actions
          </Button>
          <Menu
            anchorEl={anchorElCommitMerge}
            open={Boolean(anchorElCommitMerge)}
            onClose={handleCommitMergeClose}
          >
            <MenuItem
              onClick={() => {
                handleCommitMergeClose();
                commitToCurrentBranch();
              }}
            >
              Commit to {currentBranch}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCommitMergeClose();
                mergeFeatureIntoMain();
              }}
            >
              Merge Feature → Main
            </MenuItem>
          </Menu>

          {/* Update BigQuery Button */}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUpdateBigQuery}
            disabled={!mainHasNewCommits}
          >
            {updatingBQ ? "Updating" : "Update BigQuery"}
          </Button>

          {/* "Get Descriptions" Button (now includes detection logic) */}
          <Button variant="contained" onClick={handleGetDescriptions}>
            Get Descriptions
          </Button>

          {/* Combined Revert / Reset Dropdown */}
          <Button variant="outlined" color="error" onClick={handleRevertResetClick} endIcon={<CaretDown />}>
            Revert / Reset
          </Button>
          <Menu
            anchorEl={anchorElRevertReset}
            open={Boolean(anchorElRevertReset)}
            onClose={handleRevertResetClose}
          >
            <MenuItem
              onClick={() => {
                handleRevertResetClose();
                revertChanges();
              }}
            >
              Revert Changes
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleRevertResetClose();
                resetToOriginal();
              }}
            >
              Reset to Original
            </MenuItem>
          </Menu>

          {/* View Query Button */}
          <Button variant="contained" disabled={selectedColumns.length === 0} onClick={() => openDrawer()}>
            View Query
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
