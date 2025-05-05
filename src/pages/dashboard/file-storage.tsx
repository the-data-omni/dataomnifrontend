// 'use client';

// import * as React from 'react';
// import { useSearchParams } from 'react-router-dom';
// import Box from '@mui/material/Box';
// import Grid from '@mui/material/Grid';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';

// import { ItemsFilters } from '@/components/dashboard/file-storage/items-filters';
// import type { Filters } from '@/components/dashboard/file-storage/items-filters';
// import { ItemsPagination } from '@/components/dashboard/file-storage/items-pagination';
// import { Stats } from '@/components/dashboard/file-storage/stats';
// import { StorageProvider } from '@/components/dashboard/file-storage/storage-context';
// import { StorageView } from '@/components/dashboard/file-storage/storage-view';
// import type { Item } from '@/components/dashboard/file-storage/types';
// import { UplaodButton } from '@/components/dashboard/file-storage/upload-button';

// import { useFlattenedFields } from '@/hooks/utils/useFlattenedFields';

// function createItemFromJsonData(filename: string, data: unknown): Item {
//   const jsonStr = JSON.stringify(data);
//   const sizeInBytes = new Blob([jsonStr]).size;
//   const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';

//   return {
//     id: `ITEM-${Date.now()}`,
//     type: 'file',
//     name: filename,
//     extension: 'json',
//     author: { name: 'System' },
//     isFavorite: false,
//     isPublic: false,
//     tags: [],
//     shared: [],
//     size: sizeMB,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };
// }

// export function Page(): React.JSX.Element {
//   const [searchParams] = useSearchParams();
//   const query = searchParams.get('query') || '';
//   const sortDir = (searchParams.get('sortDir') === 'asc') ? 'asc' : 'desc'; 
//   const rawView = searchParams.get('view');
//   const view: 'grid' | 'list' = (rawView === 'list') ? 'list' : 'grid';
//   const filters: Filters = { query };

//   // Manage Items in localStorage
//   const [items, setItems] = React.useState<Item[]>(() => {
//     if (typeof window !== 'undefined') {
//       const stored = localStorage.getItem('uploadedItems');
//       if (stored) {
//         try {
//           const parsed: Item[] = JSON.parse(stored);
//           return parsed.map(item => ({
//             ...item,
//             createdAt: new Date(item.createdAt),
//             updatedAt: new Date(item.updatedAt),
//           }));
//         } catch (e) {
//           console.error('Failed to parse stored items:', e);
//         }
//       }
//     }
//     return [];
//   });

//   const saveItemsToLocalStorage = React.useCallback((newItems: Item[]) => {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('uploadedItems', JSON.stringify(newItems));
//     }
//   }, []);

//   const handleSchemaUpload = React.useCallback((uploadedItems: Item[]) => {
//     const newItems = [...items, ...uploadedItems];
//     setItems(newItems);
//     saveItemsToLocalStorage(newItems);
//   }, [items, saveItemsToLocalStorage]);

//   // --- Service Account Upload Logic ---
//   const [serviceAccountUploaded, setServiceAccountUploaded] = React.useState(false);

//   const checkServiceAccountStatus = React.useCallback(async () => {
//     try {
//       const res = await fetch(
//         'https://schema-scoring-api-242009193450.us-central1.run.app/is_service_account_loaded',
//         {
//           method: 'GET',
//           credentials: 'include',
//         }
//       );
//       if (!res.ok) {
//         throw new Error(`Status check failed: ${res.status}`);
//       }
//       const data = await res.json();
//       setServiceAccountUploaded(data.uploaded === true);
//     } catch (error) {
//       console.error('Error checking service account status:', error);
//     }
//   }, []);

//   React.useEffect(() => {
//     checkServiceAccountStatus();
//   }, [checkServiceAccountStatus]);

//   const hiddenFileInputRef = React.useRef<HTMLInputElement | null>(null);

//   const handleClickUploadServiceAccount = React.useCallback(() => {
//     if (hiddenFileInputRef.current) {
//       hiddenFileInputRef.current.click();
//     }
//   }, []);

//   const handleServiceAccountFileChange = React.useCallback(
//     async (e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (!file) return;

//       try {
//         const fileText = await file.text();
//         const jsonData = JSON.parse(fileText);

//         const response = await fetch(
//           'https://schema-scoring-api-242009193450.us-central1.run.app/upload_service_account',
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(jsonData),
//             credentials: 'include',
//           }
//         );
//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(errorText || 'Failed to upload service account JSON');
//         }
//         const result = await response.json();
//         console.log('Service account response:', result);

//         alert('Service account uploaded successfully!');
//         checkServiceAccountStatus();
//       } catch (error) {
//         console.error('Error uploading service account file:', error);
//         alert('Error uploading service account. See console for details.');
//       }
//     },
//     [checkServiceAccountStatus]
//   );

//   // --- Use Flattened Fields from "api" on user click ---
//   const [shouldFetchApi, setShouldFetchApi] = React.useState(false);

//   // This calls bigquery_info behind the scenes
//   const { data: fields, isLoading, isError } = useFlattenedFields(
//     shouldFetchApi ? 'api' : undefined
//   );

//   // Once 'fields' come back, we prompt for filename and store to local
//   React.useEffect(() => {
//     if (fields && shouldFetchApi) {
//       const filename = prompt('Enter a filename for this data (e.g. "api_schema.json")');
//       if (filename) {
//         // Store in localStorage as { schema: fields } or just the fields?
//         localStorage.setItem(filename, JSON.stringify({ schema: fields }));

//         // Also create an "Item" so it shows up in our File Storage
//         const newItem = createItemFromJsonData(filename, { schema: fields });
//         const newItems = [...items, newItem];
//         setItems(newItems);
//         saveItemsToLocalStorage(newItems);
//       }
//       // Reset so we don't continually prompt if fields changes
//       setShouldFetchApi(false);
//     }
//   }, [fields, shouldFetchApi, items, saveItemsToLocalStorage]);

//   const handleLoadFromAPI = React.useCallback(() => {
//     if (!serviceAccountUploaded) {
//       alert('Please upload a service account first.');
//       return;
//     }
//     setShouldFetchApi(true);
//   }, [serviceAccountUploaded]);

//   // Sort & Filter items
//   const sortedItems = applySort(items, sortDir);
//   const filteredItems = applyFilters(sortedItems, filters);

//   // Data Models
//   const [dataModels, setDataModels] = React.useState<{ key: string; modelName: string }[]>(() => {
//     if (typeof window !== 'undefined') {
//       const keys = Object.keys(localStorage).filter(k => k.startsWith('datamodel_'));
//       return keys.map(key => ({
//         key,
//         modelName: key.replace('datamodel_', ''),
//       }));
//     }
//     return [];
//   });

//   React.useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const keys = Object.keys(localStorage).filter(k => k.startsWith('datamodel_'));
//       setDataModels(keys.map(key => ({
//         key,
//         modelName: key.replace('datamodel_', ''),
//       })));
//     }
//   }, [items]);

//   function downloadModel(key: string) {
//     const data = localStorage.getItem(key);
//     if (!data) return;
//     const blob = new Blob([data], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${key}.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   }

//   function deleteModel(key: string) {
//     localStorage.removeItem(key);
//     const updated = dataModels.filter(dm => dm.key !== key);
//     setDataModels(updated);
//   }

//   return (
//     <Box sx={{ maxWidth: 'var(--Content-maxWidth)', m: 'var(--Content-margin)', p: 'var(--Content-padding)', width: 'var(--Content-width)' }}>
//       <Stack spacing={4}>
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
//           <Box sx={{ flex: '1 1 auto' }}>
//             <Typography variant="h4">File storage</Typography>
//           </Box>
//           <Stack direction="row" spacing={2}>
//             <Button variant="outlined" onClick={handleClickUploadServiceAccount}>
//               Upload Service Account
//             </Button>
//             <input
//               type="file"
//               accept=".json"
//               ref={hiddenFileInputRef}
//               style={{ display: 'none' }}
//               onChange={handleServiceAccountFileChange}
//             />
//             {/* Load from API button calls setShouldFetchApi(true) */}
//             <Button variant="outlined" onClick={handleLoadFromAPI} disabled={!serviceAccountUploaded || isLoading}>
//               {isLoading ? 'Loading...' : 'Load from API'}
//             </Button>
//             <UplaodButton onSchemaUpload={handleSchemaUpload} />
//           </Stack>
//         </Stack>

//         <Grid container spacing={4}>
//           <Grid item md={12} xs={12}>
//             <Stack spacing={4}>
//               <ItemsFilters filters={filters} sortDir={sortDir} view={view} />
//               <StorageProvider items={filteredItems}>
//                 <StorageView view={view} />
//               </StorageProvider>
//               <ItemsPagination count={filteredItems.length} page={0} />
//             </Stack>
//           </Grid>
//         </Grid>

//         {/* Data Models Section */}
//         <Box sx={{ mt: 4 }}>
//           <Typography variant="h5" gutterBottom>Data Models</Typography>
//           {dataModels.length === 0 ? (
//             <Typography>No data models saved yet.</Typography>
//           ) : (
//             <Stack spacing={2}>
//               {dataModels.map(dm => (
//                 <Box key={dm.key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                   <Typography variant="body1">{dm.modelName}</Typography>
//                   <Button variant="outlined" onClick={() => downloadModel(dm.key)}>
//                     Download
//                   </Button>
//                   <Button variant="outlined" color="error" onClick={() => deleteModel(dm.key)}>
//                     Delete
//                   </Button>
//                 </Box>
//               ))}
//             </Stack>
//           )}
//         </Box>
//       </Stack>

//       {/* If you want to display loading/error state for the "Load from API" action */}
//       {isLoading && <p>Loading BigQuery data…</p>}
//       {isError && <p>Error loading BigQuery data.</p>}
//     </Box>
//   );
// }

// function applySort(row: Item[], sortDir: 'asc' | 'desc' | undefined): Item[] {
//   return [...row].sort((a, b) => {
//     if (sortDir === 'asc') {
//       return a.createdAt.getTime() - b.createdAt.getTime();
//     }
//     return b.createdAt.getTime() - a.createdAt.getTime();
//   });
// }

// function applyFilters(row: Item[], { query }: Filters): Item[] {
//   return row.filter(item => {
//     if (query && !item.name?.toLowerCase().includes(query.toLowerCase())) {
//       return false;
//     }
//     return true;
//   });
// }
// file-storage.tsx
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
import type { Item, ItemOrigin } from '@/components/dashboard/file-storage/types';
import { UplaodButton } from '@/components/dashboard/file-storage/upload-button';

import { useFlattenedFields } from '@/hooks/utils/useFlattenedFields';

/* ------------------------------------------------------------------ */
/* helper to create Item objects                                       */
function createItemFromJsonData(
  filename: string,
  data: unknown,
  origin: ItemOrigin = 'json'
): Item {
  const jsonStr = JSON.stringify(data);
  const sizeInBytes = new Blob([jsonStr]).size;
  const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';

  return {
    id: `ITEM-${Date.now()}`,
    type: 'file',
    name: filename,           // always `.json`
    extension: 'json',
    origin,                   // 🔸 new
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
/* ------------------------------------------------------------------ */

export function Page(): React.JSX.Element {
  /* -------- URL‑driven view / filter state ------------------------ */
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const sortDir = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc';
  const rawView = searchParams.get('view');
  const view: 'grid' | 'list' = rawView === 'list' ? 'list' : 'grid';
  const filters: Filters = { query };

  /* -------- persisted items (localStorage) ------------------------ */
  const [items, setItems] = React.useState<Item[]>(() => {
    if (typeof window === 'undefined') return [];
  
    const stored = localStorage.getItem('uploadedItems');
    if (!stored) return [];
  
    try {
      const parsed: Item[] = JSON.parse(stored);
  
      return parsed.map((it) => ({
        ...it,                                             // ◀️ 1st: copy everything
        origin: ('origin' in it ? (it as any).origin : 'json') as ItemOrigin,  // ◀️ 2nd: ensure origin
        createdAt: new Date(it.createdAt),
        updatedAt: new Date(it.updatedAt),
      }));
    } catch (err) {
      console.error('Failed to parse stored items:', err);
      return [];
    }
  });

  const saveItemsToLocalStorage = React.useCallback((newItems: Item[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('uploadedItems', JSON.stringify(newItems));
    }
  }, []);

  const handleSchemaUpload = React.useCallback(
    (uploaded: Item[]) => {
      const newItems = [...items, ...uploaded];
      setItems(newItems);
      saveItemsToLocalStorage(newItems);
    },
    [items, saveItemsToLocalStorage]
  );

  /* ----------- BigQuery service‑account helper -------------------- */
  const [serviceAccountUploaded, setServiceAccountUploaded] =
    React.useState(false);

  const checkServiceAccountStatus = React.useCallback(async () => {
    try {
      const res = await fetch(
        'https://schema-scoring-api-242009193450.us-central1.run.app/is_service_account_loaded',
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
      const data = await res.json();
      setServiceAccountUploaded(data.uploaded === true);
    } catch (err) {
      console.error('Error checking service account status:', err);
    }
  }, []);

  React.useEffect(() => {
    void checkServiceAccountStatus();   // fire‑and‑forget
  }, [checkServiceAccountStatus]);

  /* ----------- hidden <input> for ServiceAccount ------------------ */
  const hiddenFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClickUploadServiceAccount = () =>
    hiddenFileInputRef.current?.click();

  const handleServiceAccountFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const jsonData = JSON.parse(await file.text());
        const res = await fetch(
          'https://schema-scoring-api-242009193450.us-central1.run.app/upload_service_account',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData),
            credentials: 'include',
          }
        );
        if (!res.ok) throw new Error(await res.text());
        alert('Service account uploaded successfully!');
        checkServiceAccountStatus();
      } catch (err) {
        console.error(err);
        alert('Error uploading service account. See console.');
      }
    },
    [checkServiceAccountStatus]
  );

  /* ----------- Load BigQuery schema via API ----------------------- */
  const [shouldFetchApi, setShouldFetchApi] = React.useState(false);
  const { data: fields, isLoading, isError } = useFlattenedFields(
    shouldFetchApi ? 'api' : undefined
  );

  React.useEffect(() => {
    if (!fields || !shouldFetchApi) return;
    const filename =
      prompt('Enter a filename for this data (e.g. "api_schema.json")') ||
      undefined;
    if (!filename) {
      setShouldFetchApi(false);
      return;
    }

    localStorage.setItem(filename, JSON.stringify({ schema: fields }));
    const newItem = createItemFromJsonData(filename, { schema: fields }, 'json');
    const newItems = [...items, newItem];
    setItems(newItems);
    saveItemsToLocalStorage(newItems);
    setShouldFetchApi(false);
  }, [fields, shouldFetchApi, items, saveItemsToLocalStorage]);

  const handleLoadFromAPI = () => {
    if (!serviceAccountUploaded) {
      alert('Please upload a service account first.');
      return;
    }
    setShouldFetchApi(true);
  };

  /* ----------- sort & filter helpers ------------------------------ */
  const sortedItems = React.useMemo(
    () =>
      [...items].sort((a, b) =>
        sortDir === 'asc'
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime()
      ),
    [items, sortDir]
  );

  const filteredItems = React.useMemo(
    () =>
      sortedItems.filter(
        (it) =>
          !query ||
          (it.name && it.name.toLowerCase().includes(query.toLowerCase()))
      ),
    [sortedItems, query]
  );

  /* ----------- data models (unrelated to grouping) ---------------- */
  const [dataModels, setDataModels] = React.useState<
    { key: string; modelName: string }[]
  >(() => {
    if (typeof window === 'undefined') return [];
    return Object.keys(localStorage)
      .filter((k) => k.startsWith('datamodel_'))
      .map((k) => ({ key: k, modelName: k.replace('datamodel_', '') }));
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setDataModels(
      Object.keys(localStorage)
        .filter((k) => k.startsWith('datamodel_'))
        .map((k) => ({ key: k, modelName: k.replace('datamodel_', '') }))
    );
  }, [items]);

  const downloadModel = (key: string) => {
    const data = localStorage.getItem(key);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${key}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteModel = (key: string) => {
    localStorage.removeItem(key);
    setDataModels((prev) => prev.filter((x) => x.key !== key));
  };

  /* ------------------ render -------------------------------------- */
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
        {/* header + buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ alignItems: 'flex-start' }}
        >
          <Box sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">File storage</Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleClickUploadServiceAccount}>
              Upload Service Account
            </Button>
            <input
              type="file"
              accept=".json"
              ref={hiddenFileInputRef}
              style={{ display: 'none' }}
              onChange={handleServiceAccountFileChange}
            />
            <Button
              variant="outlined"
              onClick={handleLoadFromAPI}
              disabled={!serviceAccountUploaded || isLoading}
            >
              {isLoading ? 'Loading…' : 'Load from API'}
            </Button>
            <UplaodButton onSchemaUpload={handleSchemaUpload} />
          </Stack>
        </Stack>

        {/* filters + list */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Stack spacing={4}>
              <ItemsFilters filters={filters} sortDir={sortDir} view={view} />
              <StorageProvider items={filteredItems}>
                <StorageView view={view} />
              </StorageProvider>
              <ItemsPagination count={filteredItems.length} page={0} />
            </Stack>
          </Grid>
        </Grid>

        {/* data models */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Data Models
          </Typography>
          {dataModels.length === 0 ? (
            <Typography>No data models saved yet.</Typography>
          ) : (
            <Stack spacing={2}>
              {dataModels.map((dm) => (
                <Box
                  key={dm.key}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <Typography variant="body1">{dm.modelName}</Typography>
                  <Button
                    variant="outlined"
                    onClick={() => downloadModel(dm.key)}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => deleteModel(dm.key)}
                  >
                    Delete
                  </Button>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>

      {isLoading && <p>Loading BigQuery data…</p>}
      {isError && <p>Error loading BigQuery data.</p>}
    </Box>
  );
}
