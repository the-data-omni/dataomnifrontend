'use client';

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { ItemsFilters } from '@/components/dashboard/file-storage/items-filters';
import type { Filters } from '@/components/dashboard/file-storage/items-filters';
import { ItemsPagination } from '@/components/dashboard/file-storage/items-pagination';
import { Stats } from '@/components/dashboard/file-storage/stats';
import { StorageProvider } from '@/components/dashboard/file-storage/storage-context';
import { StorageView } from '@/components/dashboard/file-storage/storage-view';
import type { Item } from '@/components/dashboard/file-storage/types';
import { UplaodButton } from '@/components/dashboard/file-storage/upload-button';
import { paths } from '@/paths'; // If you need it for navigate, etc.

function createItemFromJsonData(filename: string, data: unknown): Item {
  const jsonStr = JSON.stringify(data);
  const sizeInBytes = new Blob([jsonStr]).size;
  const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';

  return {
    id: `ITEM-${Date.now()}`,
    type: 'file',
    name: filename,
    extension: 'json',
    author: { name: 'System' },
    isFavorite: false,
    isPublic: false,
    tags: [],
    shared: [],
    size: sizeMB,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function Page(): React.JSX.Element {
  // 1) Use the useSearchParams hook
  const [searchParams] = useSearchParams();
  // 2) Extract query params from the URL
  const query = searchParams.get('query') || '';
  const sortDir = (searchParams.get('sortDir') === 'asc') ? 'asc' : 'desc'; 
  const rawView = searchParams.get('view');

// if it's "grid" or "list", use it. Otherwise fall back to "grid"
const view: "grid" | "list" = (rawView === "list") ? "list" : "grid";

  // We'll reuse your "filters" object (same as in your old code)
  const filters: Filters = { query };

  const [items, setItems] = React.useState<Item[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('uploadedItems');
      if (stored) {
        try {
          const parsed: Item[] = JSON.parse(stored);
          return parsed.map(item => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          }));
        } catch (e) {
          console.error("Failed to parse stored items:", e);
        }
      }
    }
    return [];
  });

  const saveItemsToLocalStorage = React.useCallback((newItems: Item[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('uploadedItems', JSON.stringify(newItems));
    }
  }, []);

  const handleSchemaUpload = React.useCallback((uploadedItems: Item[]) => {
    const newItems = [...items, ...uploadedItems];
    setItems(newItems);
    saveItemsToLocalStorage(newItems);
  }, [items, saveItemsToLocalStorage]);

  const handleLoadFromAPI = React.useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/bigquery_info');
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      const filename = prompt('Enter a filename for this data (e.g. "api_schema.json")');
      if (!filename) return;

      if (typeof window !== 'undefined') {
        localStorage.setItem(filename, JSON.stringify(data));
      }

      const newItem = createItemFromJsonData(filename, data);
      const newItems = [...items, newItem];
      setItems(newItems);
      saveItemsToLocalStorage(newItems);
    } catch (e) {
      console.error("Error loading from API:", e);
    }
  }, [items, saveItemsToLocalStorage]);

  const sortedItems = applySort(items, sortDir);
  const filteredItems = applyFilters(sortedItems, filters);

  // Data Models section
  const [dataModels, setDataModels] = React.useState<{key: string; modelName: string}[]>(() => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('datamodel_'));
      return keys.map(key => ({
        key,
        modelName: key.replace('datamodel_', '')
      }));
    }
    return [];
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('datamodel_'));
      setDataModels(keys.map(key => ({
        key,
        modelName: key.replace('datamodel_', '')
      })));
    }
  }, [items]); 

  function downloadModel(key: string) {
    const data = localStorage.getItem(key);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${key}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function deleteModel(key: string) {
    localStorage.removeItem(key);
    const updated = dataModels.filter(dm => dm.key !== key);
    setDataModels(updated);
  }

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack spacing={4}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">File storage</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleLoadFromAPI}>
              Load from API
            </Button>
            <UplaodButton onSchemaUpload={handleSchemaUpload} />
          </Stack>
        </Stack>
        <Grid container spacing={4}>
          <Grid
            item
            md={12}
            xs={12}
          >
            <Stack spacing={4}>
              <ItemsFilters filters={filters} sortDir={sortDir} view={view} />
              <StorageProvider items={filteredItems}>
                <StorageView view={view} />
              </StorageProvider>
              <ItemsPagination count={filteredItems.length} page={0} />
            </Stack>
          </Grid>
          {/* Optionally show stats or other info in another column
          <Grid
            item
            md={4}
            xs={12}
          >
            <Stats />
          </Grid> 
          */}
        </Grid>

        {/* Data Models Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Data Models</Typography>
          {dataModels.length === 0 ? (
            <Typography>No data models saved yet.</Typography>
          ) : (
            <Stack spacing={2}>
              {dataModels.map(dm => (
                <Box key={dm.key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1">{dm.modelName}</Typography>
                  <Button variant="outlined" onClick={() => downloadModel(dm.key)}>Download</Button>
                  <Button variant="outlined" color="error" onClick={() => deleteModel(dm.key)}>Delete</Button>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

function applySort(row: Item[], sortDir: 'asc' | 'desc' | undefined): Item[] {
  return [...row].sort((a, b) => {
    if (sortDir === 'asc') {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function applyFilters(row: Item[], { query }: Filters): Item[] {
  return row.filter((item) => {
    if (query && !item.name?.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    return true;
  });
}
