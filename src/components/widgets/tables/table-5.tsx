'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Chip,
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
  Menu,
  MenuItem,
  Checkbox,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { MagnifyingGlass, PencilSimple } from '@phosphor-icons/react';

import { DataTable } from '@/components/core/data-table';
import type { ColumnDef } from '@/components/core/data-table';
import { Option } from '@/components/core/option';

// Pagination from MUI
import TablePagination from '@mui/material/TablePagination';

// Context + Hook
import { SchemaContext } from '@/components/dashboard/layout/SchemaContext';
import { useFlattenedFields } from '@/hooks/utils/useFlattenedFields';
import type { FlattenedField } from '@/hooks/utils/types';

/**
 * Table5 with:
 *   1) Filters (search, dataset, table, missing desc)
 *   2) Pagination
 *   3) Select Columns (a button that toggles a menu)
 */
export function Table5() {
  //
  // 1) Hooks at the top, unconditionally
  //
  const { selectedSchemaName } = React.useContext(SchemaContext);
  const { data = [], isLoading, error } = useFlattenedFields(selectedSchemaName);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [tableFilter, setTableFilter] = React.useState('');
  const [datasetFilter, setDatasetFilter] = React.useState('');
  const [missingDescription, setMissingDescription] = React.useState(false);

  // For pagination
  const [currentPage, setCurrentPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5); // default 5

  // "Select Columns" menu anchor
  const [anchorElColumns, setAnchorElColumns] = React.useState<null | HTMLElement>(null);
  const openColumns = Boolean(anchorElColumns);
  function handleMenuOpenColumns(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorElColumns(event.currentTarget);
  }
  function handleMenuCloseColumns() {
    setAnchorElColumns(null);
  }

  // 2) Build the base columns in a memo
  const baseColumns = React.useMemo<ColumnDef<FlattenedField>[]>(() => {
    return [
      {
        name: 'Dataset',
        field: undefined, // not strictly needed
        formatter: (row) => row.table_schema,
        width: '160px',
      },
      {
        name: 'Table Name',
        formatter: (row) => (
          <Link color="text.primary" underline="none" variant="subtitle2">
            {row.table_name}
          </Link>
        ),
        width: '160px',
      },
      {
        name: 'Field Name',
        formatter: (row) => row.column_name,
        width: '160px',
      },
      {
        name: 'Field Description',
        formatter: (row) => row.description || '',
        width: '240px',
      },
      {
        name: 'Primary Key',
        formatter: (row) =>
          row.primary_key ? (
            <Chip label="Yes" color="success" size="small" variant="soft" />
          ) : (
            <Chip label="No" size="small" variant="soft" />
          ),
        width: '120px',
      },
      {
        name: 'Foreign Key',
        formatter: (row) =>
          row.foreign_key ? (
            <Chip label="Yes" color="warning" size="small" variant="soft" />
          ) : (
            <Chip label="No" size="small" variant="soft" />
          ),
        width: '120px',
      },
      {
        name: 'Actions',
        hideName: true,
        align: 'right',
        width: '80px',
        formatter: () => (
          <IconButton>
            <PencilSimple />
          </IconButton>
        ),
      },
    ];
  }, []);

  // We store a local array of columns with "isVisible"
  const [columnsWithVisibility, setColumnsWithVisibility] = React.useState<
    (ColumnDef<FlattenedField> & { isVisible: boolean })[]
  >([]);

  // On mount (or if baseColumns changes), initialize columnsWithVisibility
  React.useEffect(() => {
    if (columnsWithVisibility.length === 0) {
      setColumnsWithVisibility(
        baseColumns.map((col) => ({
          ...col,
          isVisible: true,
        }))
      );
    }
  }, [baseColumns, columnsWithVisibility.length]);

  // 3) Create your unique tables/datasets from data
  const uniqueTables = React.useMemo(() => {
    return Array.from(new Set(data.map((f) => f.table_name)));
  }, [data]);

  const uniqueDatasets = React.useMemo(() => {
    return Array.from(new Set(data.map((f) => f.table_schema)));
  }, [data]);

  // 4) Filter the data
  const filteredRows = React.useMemo(() => {
    return data.filter((row) => {
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
  }, [data, tableFilter, datasetFilter, missingDescription, searchQuery]);

  // 5) Pagination logic
  const totalCount = filteredRows.length;
  const startIndex = currentPage * rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  // If the user changes the page
  function handlePageChange(_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) {
    setCurrentPage(newPage);
  }

  // If the user changes rows-per-page
  function handleRowsPerPageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  }

  // 6) If loading/error, return early
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
        <Card sx={{ p: 3, color: 'error.main' }}>
          Error loading fields: {String(error)}
        </Card>
      </Box>
    );
  }

  // 7) Visible columns
  const visibleColumns = columnsWithVisibility.filter((col) => col.isVisible);

  function handleToggleColumn(index: number) {
    setColumnsWithVisibility((prev) => {
      const copy = [...prev];
      copy[index].isVisible = !copy[index].isVisible;
      return copy;
    });
  }

  //
  // 8) Render the final UI
  //
  return (
    <Box sx={{ bgcolor: 'var(--mui-palette-background-level1)', p: 3 }}>
      <Card>
        {/* Filters */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', flexWrap: 'wrap', p: 3 }}
        >
          {/* Search by field name */}
          <OutlinedInput
            placeholder="Search fields"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlass fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
            sx={{ maxWidth: '100%', width: '300px' }}
          />

          {/* Table filter */}
          <Select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            displayEmpty
            sx={{ maxWidth: '100%', width: '240px' }}
          >
            <Option value="">All tables</Option>
            {uniqueTables.map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>

          {/* Dataset filter */}
          <Select
            value={datasetFilter}
            onChange={(e) => setDatasetFilter(e.target.value)}
            displayEmpty
            sx={{ maxWidth: '100%', width: '240px' }}
          >
            <Option value="">All datasets</Option>
            {uniqueDatasets.map((ds) => (
              <Option key={ds} value={ds}>
                {ds}
              </Option>
            ))}
          </Select>

          {/* Missing Description toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={missingDescription}
                onChange={(e) => setMissingDescription(e.target.checked)}
              />
            }
            label="Missing Description"
          />

          {/* A button to open "Select Columns" menu */}

        </Stack>

        <Divider />

        {/* The DataTable */}
        <Box sx={{ overflowX: 'auto' }}>
          <DataTable<FlattenedField>
            columns={visibleColumns}
            rows={paginatedRows}
            selectable
          />
        </Box>

        {/* TablePagination component */}
        <Divider />
        <TablePagination
          component="div"
          count={totalCount}
          page={currentPage}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
    </Box>
  );
}
