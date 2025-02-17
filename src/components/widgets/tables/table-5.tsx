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
  Checkbox,
  Button,    // <--- import Button
} from '@mui/material';
import { MagnifyingGlass, PencilSimple } from '@phosphor-icons/react';

import TablePagination from '@mui/material/TablePagination';
import { DataTable } from '@/components/core/data-table';
import { Option } from '@/components/core/option';

import { SchemaContext } from '@/components/dashboard/layout/SchemaContext';
import { useFlattenedFields } from '@/hooks/utils/useFlattenedFields';
import type { FlattenedField } from '@/hooks/utils/types';
import type { ColumnDef } from '@/components/core/data-table';

import { useQueryDrawer } from '@/components/dashboard/chat/context/query-drawer-context';

export function Table5() {
  const { selectedSchemaName } = React.useContext(SchemaContext);
  const { data = [], isLoading, error } = useFlattenedFields(selectedSchemaName);

  // from Query Drawer context
  const {
    columns,
    addColumnToQuery,
    removeColumnFromQuery,
    openDrawer,
  } = useQueryDrawer();

  // Local states for filtering
  const [searchQuery, setSearchQuery] = React.useState('');
  const [tableFilter, setTableFilter] = React.useState('');
  const [datasetFilter, setDatasetFilter] = React.useState('');
  const [missingDescription, setMissingDescription] = React.useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Columns
  const baseColumns = React.useMemo<ColumnDef<FlattenedField>[]>(() => {
    return [
      {
        name: 'Select Field',
        align: 'center',
        width: '60px',
        formatter: (row) => (
          <Checkbox
            size="small"
            onChange={(e) => {
              if (e.target.checked) {
                const combinedName = `${row.table_name}.${row.column_name}`;
                addColumnToQuery(combinedName);
              } else {
                removeColumnFromQuery(`${row.table_name}.${row.column_name}`);
              }
            }}
          />
        ),
      },
      {
        name: 'Dataset',
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
  }, [addColumnToQuery, removeColumnFromQuery]);

  // For filters
  const uniqueTables = React.useMemo(
    () => Array.from(new Set(data.map((f) => f.table_name))),
    [data]
  );
  const uniqueDatasets = React.useMemo(
    () => Array.from(new Set(data.map((f) => f.table_schema))),
    [data]
  );

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

  const totalCount = filteredRows.length;
  const startIndex = currentPage * rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  function handlePageChange(_e: React.MouseEvent<HTMLButtonElement> | null, newPage: number) {
    setCurrentPage(newPage);
  }

  function handleRowsPerPageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(0);
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
        <Card sx={{ p: 3, color: 'error.main' }}>
          Error loading fields: {String(error)}
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'var(--mui-palette-background-level1)', p: 3 }}>
      <Card>
        {/* Filters */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', flexWrap: 'wrap', p: 3 }}
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
            sx={{ maxWidth: '100%', width: '300px' }}
          />

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
        <Box sx={{ overflowX: 'auto' }}>
          <DataTable<FlattenedField>
            columns={baseColumns}
            rows={paginatedRows}
            // selectable
          />
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

        {/*  Add a button for "View Query" at the bottom (or top). */}
        <Divider />
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
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
