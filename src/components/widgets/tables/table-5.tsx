// table-5.tsx
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
} from "@mui/material";
import {
  MagnifyingGlass,
  PencilSimple,
  Check,
  X,
} from "@phosphor-icons/react";

import TablePagination from "@mui/material/TablePagination";
import { DataTable } from "@/components/core/data-table";
import { Option } from "@/components/core/option";

import { SchemaContext } from "@/components/dashboard/layout/SchemaContext";
import { useFlattenedFields } from "@/hooks/utils/useFlattenedFields";
import type { FlattenedField } from "@/hooks/utils/types";
import type { ColumnDef } from "@/components/core/data-table";

import { useQueryDrawer } from "@/components/dashboard/chat/context/query-drawer-context";

export function Table5() {
  const { selectedSchemaName } = React.useContext(SchemaContext);
  const { data = [], isLoading, error } = useFlattenedFields(selectedSchemaName);

  // From Query Drawer context
  const {
    columns,             // array of fully qualified column references
    addColumnToQuery,
    removeColumnFromQuery,
    openDrawer,
  } = useQueryDrawer();

  // Local augmented data
  const [augmentedData, setAugmentedData] = React.useState<FlattenedField[]>([]);

  // In-line editing states
  const [editingFieldKey, setEditingFieldKey] = React.useState<string | null>(null);
  const [tempDescription, setTempDescription] = React.useState("");
  const [tempPrimaryKey, setTempPrimaryKey] = React.useState<boolean>(false);
  const [tempForeignKey, setTempForeignKey] = React.useState<boolean>(false);

  React.useEffect(() => {
    setAugmentedData(data);
  }, [data]);

  // Filtering
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tableFilter, setTableFilter] = React.useState("");
  const [datasetFilter, setDatasetFilter] = React.useState("");
  const [missingDescription, setMissingDescription] = React.useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  /* ---------------- EDITING LOGIC ---------------- */
  function handleEdit(row: FlattenedField) {
    const rowKey = row.table_name + "." + row.column_name;
    setEditingFieldKey(rowKey);
    setTempDescription(row.description || "");
    setTempPrimaryKey(!!row.primary_key);
    setTempForeignKey(!!row.foreign_key);
  }

  function handleSaveDescription(fieldKey: string) {
    // Save changes to augmentedData
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

  /* ---------------- BUILDING COLUMN REFS ---------------- */
  // For wildcard table "events_*", we store just the column as "`colName`"
  // For normal table, we store "`schema`.`table`.`colName`"
  function getFieldRef(row: FlattenedField): string {
    const hasWildcard = row.table_name.includes("*");
    if (hasWildcard) {
      // e.g. "SELECT `my_col` FROM `my_dataset`.`events_*`"
      return `\`${row.column_name}\``;
    }
    // Normal table
    return `\`${row.table_schema}\`.\`${row.table_name}\`.\`${row.column_name}\``;
  }

  // Also track if checkbox is checked
  function isFieldSelected(row: FlattenedField): boolean {
    const ref = getFieldRef(row);
    return columns.includes(ref);
  }

  /* ---------------- TABLE COLUMNS DEFINITION ---------------- */
  const baseColumns = React.useMemo<ColumnDef<FlattenedField>[]>(() => {
    return [
      {
        name: "Select Field",
        align: "center",
        width: "60px",
        formatter: (row) => {
          const ref = getFieldRef(row);
          return (
            <Checkbox
              size="small"
              checked={isFieldSelected(row)}
              onChange={(e) => {
                if (e.target.checked) {
                  addColumnToQuery(ref);
                } else {
                  removeColumnFromQuery(ref);
                }
              }}
            />
          );
        },
      },
      {
        name: "Dataset",
        formatter: (row) => row.table_schema,
        width: "160px",
      },
      {
        name: "Table Name",
        formatter: (row) => (
          <Link color="text.primary" underline="none" variant="subtitle2">
            {row.table_name}
          </Link>
        ),
        width: "160px",
      },
      {
        name: "Field Name",
        formatter: (row) => row.column_name,
        width: "160px",
      },
      {
        name: "Field Description",
        width: "220px",
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
        width: "120px",
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
        width: "120px",
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
        name: "Actions",
        hideName: true,
        align: "right",
        width: "80px",
        formatter: (row) => {
          const fieldKey = row.table_name + "." + row.column_name;
          if (editingFieldKey === fieldKey) {
            return (
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={() => handleSaveDescription(fieldKey)}
                  color="primary"
                >
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
    ];
  }, [
    editingFieldKey,
    tempDescription,
    tempPrimaryKey,
    tempForeignKey,
    columns,
    addColumnToQuery,
    removeColumnFromQuery,
  ]);

  /* ---------------- FILTERING + PAGINATION ---------------- */
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

  function handlePageChange(_e: any, newPage: number) {
    setCurrentPage(newPage);
  }
  function handleRowsPerPageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(0);
  }

  // Example "Get Descriptions" from JSON
  async function handleGetDescriptions() {
    try {
      const res = await fetch("/my-schema.json");
      if (!res.ok) {
        throw new Error(`Failed to load schema file. Status ${res.status}`);
      }
      const schema = await res.json();

      const updated = augmentedData.map((row) => {
        if (!row.description) {
          const tbl = schema.find((t: any) => t.table_name === row.table_name);
          if (tbl && tbl.columns) {
            const col = tbl.columns.find(
              (c: any) => c.column_name === row.column_name
            );
            if (col && col.description) {
              return { ...row, description: col.description };
            }
          }
        }
        return row;
      });

      setAugmentedData(updated);
    } catch (err) {
      console.error("Error fetching schema descriptions:", err);
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

  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Card>
        {/* Filters */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", flexWrap: "wrap", p: 3 }}
        >
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
            {uniqueTables.map((t) => (
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
            {uniqueDatasets.map((ds) => (
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
        </Stack>

        <Divider />

        {/* DataTable */}
        <Box sx={{ overflowX: "auto" }}>
          <DataTable<FlattenedField> columns={baseColumns} rows={paginatedRows} />
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

        {/* Buttons row */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button variant="contained" onClick={handleGetDescriptions}>
            Get Descriptions
          </Button>
          <Button variant="contained" color="secondary" onClick={handleSave}>
            Save
          </Button>
          <Button
            variant="contained"
            disabled={columns.length === 0}
            onClick={() => openDrawer()}
          >
            View Query
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
