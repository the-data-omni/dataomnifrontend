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

/** Small helper to simulate delay, so user sees each step in your multi-step "Get Descriptions" animation. */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * All possible columns we might show. We’ll reference these names in
 * the column definitions and also in the column visibility toggles.
 */
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

export function Table5() {
  const { selectedSchemaName } = React.useContext(SchemaContext);
  const { data = [], isLoading, error } = useFlattenedFields(selectedSchemaName);

  // From Query Drawer context
  const {
    columns: selectedColumns,
    addColumnToQuery,
    removeColumnFromQuery,
    openDrawer,
    setTableName
  } = useQueryDrawer();

  // Local augmented data
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

  // Multi-step "Get Descriptions" dialog states
  const [descProgress, setDescProgress] = React.useState(0); // 0=idle, 1=scan, 2=found, 3=adding, 4=done
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [descFoundCount, setDescFoundCount] = React.useState(0);
  const [matchedTables, setMatchedTables] = React.useState<{ dataset: string; tableName: string }[]>(
    []
  );

  // Column visibility states
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

  // For row expansion of "Access Instructions"
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null);

  function toggleExpandRow(rowIndex: number) {
    setExpandedRow((prev) => (prev === rowIndex ? null : rowIndex));
  }

  // Editing logic for descriptions, PK, FK
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
          foreign_key: tempForeignKey,
        };
      }
      return item;
    });
    setAugmentedData(updated);
    // exit edit mode
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

  // Helper to build a fully qualified reference for the row
  function getFieldRef(row: FlattenedField): string {
    if (row.table_name.includes("*")) {
      // If your table is sharded, you might do something else
      return `\`${row.column_name}\``;
    }
    return `\`${row.table_schema}\`.\`${row.table_name}\`.\`${row.column_name}\``;
  }

  // (Not used in "Select Field" column anymore, but let's leave it for any future usage.)
  function isFieldSelected(row: FlattenedField): boolean {
    return selectedColumns.includes(getFieldRef(row));
  }

  // Column definitions (all possible). We'll filter by visibleColumns below.
  const allColumnDefs = React.useMemo<ColumnDef<FlattenedField>[]>(() => {
    return [
      {
        name: "Select Field",
        align: "center",
        width: 60,
        /** 
         * UPDATED: we now always use access_instructions for FROM + SELECT,
         * no fallback to getFieldRef().
         */
        formatter: (row) => {
          const fromClause = row.access_instructions?.from_clause || "";
          const selectExpr = row.access_instructions?.select_expr || "";

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
        },
      },
      {
        name: "Dataset",
        formatter: (row) => row.table_schema,
        width: 160,
      },
      {
        name: "Table Name",
        formatter: (row) => (
          <Link color="text.primary" underline="none" variant="subtitle2">
            {row.table_name}
          </Link>
        ),
        width: 160,
      },
      {
        name: "Field Name",
        formatter: (row) => row.column_name,
        width: 160,
      },
      {
        name: "Data Type",
        width: 120,
        formatter: (row) => row.data_type,
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
        },
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
        },
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
        },
      },
      {
        name: "Field Mode",
        width: 120,
        formatter: (row) => row.field_mode || "",
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
        },
      },
      {
        name: "Access Instructions",
        width: 80,
        formatter: (row, rowIndex) => {
          // Expand/collapse logic
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

  // Filter columns by what's visible
  const displayedColumns = React.useMemo(() => {
    return allColumnDefs.filter((col) => visibleColumns.includes(col.name));
  }, [allColumnDefs, visibleColumns]);

  // Filtering + pagination
  const uniqueTables = React.useMemo(
    () => Array.from(new Set(augmentedData.map((f) => f.table_name))),
    [augmentedData]
  );
  const uniqueDatasets = React.useMemo(
    () => Array.from(new Set(augmentedData.map((f) => f.table_schema))),
    [augmentedData]
  );

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

  // "Get Descriptions" logic
  async function handleGetDescriptions() {
    try {
      setDialogOpen(true);
      setDescProgress(1);
      await sleep(1000);

      setDescProgress(2);
      // Example: fetch from /my-schema.json
      const res = await fetch("/my-schema.json");
      if (!res.ok) {
        throw new Error(`Failed to load schema file. Status ${res.status}`);
      }
      const schema = await res.json();
      setDescFoundCount(schema.length);

      // Build matched
      const matched: { dataset: string; tableName: string }[] = [];
      augmentedData.forEach((row) => {
        if (!row.description) {
          const tbl = schema.find((t: any) => t.table_name === row.table_name);
          if (tbl && tbl.columns) {
            const col = tbl.columns.find((c: any) => c.column_name === row.column_name);
            if (col && col.description) {
              matched.push({ dataset: row.table_schema, tableName: row.table_name });
            }
          }
        }
      });
      // Deduplicate
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

      await sleep(2000);

      setDescProgress(3);
      // Update data with new descriptions
      const updated = augmentedData.map((row) => {
        if (!row.description) {
          const tbl = schema.find((t: any) => t.table_name === row.table_name);
          if (tbl && tbl.columns) {
            const col = tbl.columns.find((c: any) => c.column_name === row.column_name);
            if (col && col.description) {
              return { ...row, description: col.description };
            }
          }
        }
        return row;
      });
      setAugmentedData(updated);

      await sleep(2000);

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

  function handleSave() {
    console.log("Saving updated field data:", augmentedData);
    alert("Updated fields have been saved (check console).");
  }

  // Loading + error states
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

  // Multi-step "Get Descriptions" dialog content
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
        return (
          <>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Found {descFoundCount} dataset(s) in my-schema...
            </Typography>
            <Box sx={{ mt: 2, width: "100%", maxHeight: 200, overflowY: "auto" }}>
              {matchedTables.length > 0 ? (
                <List dense>
                  {matchedTables.map((m, idx) => (
                    <ListItem key={`${m.dataset}:${m.tableName}:${idx}`}>
                      <ListItemText
                        primary={m.tableName}
                        secondary={`dataset: ${m.dataset}`}
                      />
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
        return null; // or an empty fragment
    }
  }

  // Final render
  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Card>
        {/* Step-by-step "Get Descriptions" dialog */}
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

        {/* Filters and column visibility */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", flexWrap: "wrap", p: 3 }}
        >
          {/* Search */}
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

          {/* Table Filter */}
          <Select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            displayEmpty
            sx={{ maxWidth: "100%", width: "240px" }}
          >
            <Option value="">All tables</Option>
            {uniqueTables.map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>

          {/* Dataset Filter */}
          <Select
            value={datasetFilter}
            onChange={(e) => setDatasetFilter(e.target.value)}
            displayEmpty
            sx={{ maxWidth: "100%", width: "240px" }}
          >
            <Option value="">All datasets</Option>
            {uniqueDatasets.map((ds) => (
              <Option key={ds} value={ds}>
                {ds}
              </Option>
            ))}
          </Select>

          {/* Missing Description Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={missingDescription}
                onChange={(e) => setMissingDescription(e.target.checked)}
              />
            }
            label="Missing Description"
          />

          {/* Columns Visibility Button */}
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

        {/* DataTable with displayedColumns */}
        <Box sx={{ overflowX: "auto" }}>
          <DataTable<FlattenedField> columns={displayedColumns} rows={paginatedRows} />
        </Box>

        <Divider />

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={currentPage}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />

        <Divider />

        {/* Bottom buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="contained" onClick={handleGetDescriptions}>
            Get Descriptions
          </Button>
          <Button variant="contained" color="secondary" onClick={handleSave}>
            Save
          </Button>
          <Button
            variant="contained"
            disabled={selectedColumns.length === 0}
            onClick={() => openDrawer()}
          >
            View Query
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
