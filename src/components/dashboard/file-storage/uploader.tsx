// 'use client';

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import Dialog from '@mui/material/Dialog';
// import DialogContent from '@mui/material/DialogContent';
// import IconButton from '@mui/material/IconButton';
// import Stack from '@mui/material/Stack';
// import Tooltip from '@mui/material/Tooltip';
// import Typography from '@mui/material/Typography';
// import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';

// import type { File } from '@/components/core/file-dropzone';
// import { FileDropzone } from '@/components/core/file-dropzone';
// import { FileIcon } from '@/components/core/file-icon';
// import type { Item } from '@/components/dashboard/file-storage/types';

// interface UploaderProps {
//   onClose?: () => void;
//   open?: boolean;
//   onSchemaUpload?: (items: Item[]) => void;
// }

// function bytesToSize(bytes: number, decimals = 2): string {
//   if (bytes === 0) {
//     return '0 Bytes';
//   }

//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));

//   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
// }

// export function Uploader({ onClose, open = false, onSchemaUpload }: UploaderProps): React.JSX.Element {
//   const [files, setFiles] = React.useState<File[]>([]);

//   React.useEffect(() => {
//     setFiles([]);
//   }, [open]);

//   const handleDrop = React.useCallback((newFiles: File[]) => {
//     setFiles((prevFiles) => {
//       return [...prevFiles, ...newFiles];
//     });
//   }, []);

//   const handleRemove = React.useCallback((file: File) => {
//     setFiles((prevFiles) => {
//       return prevFiles.filter((_file) => _file.path !== file.path);
//     });
//   }, []);

//   const handleRemoveAll = React.useCallback(() => {
//     setFiles([]);
//   }, []);

//   const handleUpload = React.useCallback(async () => {
//     const jsonFile = files.find(f => f.name.toLowerCase().endsWith('.json'));
//     if (jsonFile && onSchemaUpload) {
//       try {
//         const content = await jsonFile.text();
//         const parsed = JSON.parse(content);

//         // Store the raw JSON content using the filename, just like with API data
//         if (typeof window !== 'undefined') {
//           localStorage.setItem(jsonFile.name, content);
//         }

//         // Create a single Item representing this uploaded JSON data
//         const uploadedItems: Item[] = [createItemFromJsonData(jsonFile.name, parsed)];

//         onSchemaUpload(uploadedItems);
//       } catch (err) {
//         console.error("Error reading JSON file:", err);
//       }
//     }

//     if (onClose) onClose();
//   }, [files, onClose, onSchemaUpload]);

//   return (
//     <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
//       <Stack direction="row" spacing={3} sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
//         <Typography variant="h6">Upload files or schema</Typography>
//         <IconButton onClick={onClose}>
//           <XIcon />
//         </IconButton>
//       </Stack>
//       <DialogContent>
//         <Stack spacing={3}>
//           <FileDropzone
//             accept={{ 'application/json': [] }}
//             caption="Max file size is 10 MB"
//             files={files}
//             onDrop={handleDrop}
//             maxSize={10 * 1024 * 1024} 
//           />
//           {files.length ? (
//             <Stack spacing={2}>
//               <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
//                 {files.map((file) => {
//                   const extension = file.name.split('.').pop();

//                   return (
//                     <Stack
//                       component="li"
//                       direction="row"
//                       key={file.path}
//                       spacing={2}
//                       sx={{
//                         alignItems: 'center',
//                         border: '1px solid var(--mui-palette-divider)',
//                         borderRadius: 1,
//                         flex: '1 1 auto',
//                         p: 1,
//                       }}
//                     >
//                       <FileIcon extension={extension} />
//                       <Box sx={{ flex: '1 1 auto' }}>
//                         <Typography variant="subtitle2">{file.name}</Typography>
//                         <Typography color="text.secondary" variant="body2">
//                           {bytesToSize(file.size)}
//                         </Typography>
//                       </Box>
//                       <Tooltip title="Remove">
//                         <IconButton
//                           onClick={() => {
//                             handleRemove(file);
//                           }}
//                         >
//                           <XIcon />
//                         </IconButton>
//                       </Tooltip>
//                     </Stack>
//                   );
//                 })}
//               </Stack>
//               <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
//                 <Button color="secondary" onClick={handleRemoveAll} size="small" type="button">
//                   Remove all
//                 </Button>
//                 <Button onClick={handleUpload} size="small" type="button" variant="contained">
//                   Upload
//                 </Button>
//               </Stack>
//             </Stack>
//           ) : null}
//         </Stack>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
// uploader.tsx
// uploader.tsx
// uploader.tsx
// uploader.tsx
// uploader.tsx
// 'use client';

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import Dialog from '@mui/material/Dialog';
// import DialogContent from '@mui/material/DialogContent';
// import IconButton from '@mui/material/IconButton';
// import Stack from '@mui/material/Stack';
// import Tooltip from '@mui/material/Tooltip';
// import Typography from '@mui/material/Typography';
// import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';

// import type { File } from '@/components/core/file-dropzone';
// import { FileDropzone } from '@/components/core/file-dropzone';
// import { FileIcon } from '@/components/core/file-icon';
// import type { Item, ItemOrigin } from '@/components/dashboard/file-storage/types';

// interface UploaderProps {
//   onClose?: () => void;
//   open?: boolean;
//   onSchemaUpload?: (items: Item[]) => void;
// }

// /* ------------------------------------------------------------------ */
// /* helpers                                                            */
// function bytesToSize(bytes: number, decimals = 2): string {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024,
//     dm = decimals < 0 ? 0 : decimals,
//     sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
//     i = Math.floor(Math.log(bytes) / Math.log(k));
//   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
// }

// function createItemFromJsonData(
//   filename: string,
//   data: unknown,
//   origin: ItemOrigin
// ): Item {
//   const jsonStr = JSON.stringify(data);
//   const sizeInBytes = new Blob([jsonStr]).size;
//   const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';

//   return {
//     id: `ITEM-${Date.now()}`,
//     type: 'file',
//     name: filename,      // always `.json` after conversion
//     extension: 'json',   // keeps downstream logic simple
//     origin,              // 🔸 NEW
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
// /* ------------------------------------------------------------------ */

// export function Uploader({
//   onClose,
//   open = false,
//   onSchemaUpload,
// }: UploaderProps): React.JSX.Element {
//   const [files, setFiles] = React.useState<File[]>([]);

//   /* reset list when modal re‑opens */
//   React.useEffect(() => setFiles([]), [open]);

//   /* -------- handlers ---------------------------------------------- */
//   const handleDrop = React.useCallback(
//     (newFiles: File[]) => setFiles((prev) => [...prev, ...newFiles]),
//     []
//   );

//   const handleRemove = React.useCallback(
//     (file: File) => setFiles((prev) => prev.filter((f) => f.path !== file.path)),
//     []
//   );

//   const handleRemoveAll = React.useCallback(() => setFiles([]), []);

//   const handleUpload = React.useCallback(async () => {
//     if (!onSchemaUpload) {
//       onClose?.();
//       return;
//     }

//     const file = files.find(
//       (f) =>
//         f.name.toLowerCase().endsWith('.json') ||
//         f.name.toLowerCase().endsWith('.csv')
//     );
//     if (!file) {
//       onClose?.();
//       return;
//     }

//     try {
//       const raw = await file.text();
//       let parsed: unknown;
//       let storeName = file.name;
//       let origin: ItemOrigin = 'json';

//       /* JSON upload (unchanged) */
//       if (file.name.toLowerCase().endsWith('.json')) {
//         parsed = JSON.parse(raw);
//         origin = 'json';
//       } else {
//         /* CSV → JSON */
//         const lines = raw.trim().split(/\r?\n/).filter(Boolean);
//         const headers = lines[0].split(',').map((h) => h.trim());
//         parsed = lines.slice(1).map((line) => {
//           const cells = line.split(',');
//           return headers.reduce<Record<string, string>>((obj, h, idx) => {
//             obj[h] = cells[idx]?.trim() ?? '';
//             return obj;
//           }, {});
//         });
//         storeName = file.name.replace(/\.csv$/i, '.json');
//         origin = 'csv';             // 🔸 flag it
//       }

//       /* save parsed JSON into localStorage */
//       if (typeof window !== 'undefined') {
//         localStorage.setItem(storeName, JSON.stringify(parsed));
//       }

//       /* create Item & notify parent */
//       const uploadedItems = [createItemFromJsonData(storeName, parsed, origin)];
//       onSchemaUpload(uploadedItems);
//     } catch (err) {
//       console.error('Error processing uploaded file:', err);
//     }

//     onClose?.();
//   }, [files, onClose, onSchemaUpload]);

//   /* -------- UI ----------------------------------------------------- */
//   return (
//     <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
//       {/* header */}
//       <Stack
//         direction="row"
//         spacing={3}
//         sx={{
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           px: 3,
//           py: 2,
//         }}
//       >
//         <Typography variant="h6">Upload files or schema</Typography>
//         <IconButton onClick={onClose}>
//           <XIcon />
//         </IconButton>
//       </Stack>

//       {/* body */}
//       <DialogContent>
//         <Stack spacing={3}>
//           <FileDropzone
//             accept={{
//               'application/json': ['.json'],
//               'text/csv': ['.csv'],  
//             }}
//             caption="Max file size is 10 MB"
//             files={files}
//             onDrop={handleDrop}
//             maxSize={10 * 1024 * 1024}
//           />

//           {files.length ? (
//             <Stack spacing={2}>
//               {/* file list */}
//               <Stack
//                 component="ul"
//                 spacing={1}
//                 sx={{ listStyle: 'none', m: 0, p: 0 }}
//               >
//                 {files.map((file) => (
//                   <Stack
//                     component="li"
//                     direction="row"
//                     key={file.path}
//                     spacing={2}
//                     sx={{
//                       alignItems: 'center',
//                       border: '1px solid var(--mui-palette-divider)',
//                       borderRadius: 1,
//                       flex: '1 1 auto',
//                       p: 1,
//                     }}
//                   >
//                     <FileIcon extension={file.name.split('.').pop()} />
//                     <Box sx={{ flex: '1 1 auto' }}>
//                       <Typography variant="subtitle2">{file.name}</Typography>
//                       <Typography color="text.secondary" variant="body2">
//                         {bytesToSize(file.size)}
//                       </Typography>
//                     </Box>
//                     <Tooltip title="Remove">
//                       <IconButton onClick={() => handleRemove(file)}>
//                         <XIcon />
//                       </IconButton>
//                     </Tooltip>
//                   </Stack>
//                 ))}
//               </Stack>

//               {/* actions */}
//               <Stack
//                 direction="row"
//                 spacing={2}
//                 sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
//               >
//                 <Button
//                   color="secondary"
//                   onClick={handleRemoveAll}
//                   size="small"
//                   type="button"
//                 >
//                   Remove all
//                 </Button>
//                 <Button
//                   onClick={handleUpload}
//                   size="small"
//                   type="button"
//                   variant="contained"
//                 >
//                   Upload
//                 </Button>
//               </Stack>
//             </Stack>
//           ) : null}
//         </Stack>
//       </DialogContent>
//     </Dialog>
//   );
// }
// uploader.tsx
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';

import type { File } from '@/components/core/file-dropzone';
import { FileDropzone } from '@/components/core/file-dropzone';
import { FileIcon } from '@/components/core/file-icon';
import type { Item, ItemOrigin } from '@/components/dashboard/file-storage/types';

interface UploaderProps {
  onClose?: () => void;
  open?: boolean;
  onSchemaUpload?: (items: Item[]) => void;
}

/* ------------------------------------------------------------------ */
/* constants & helpers                                                */
const LOCAL_LIMIT = 4.5 * 1024 * 1024;        // 4.5 MB safety margin
const PREVIEW_ROWS = 100;                     // rows kept if dataset too big

function bytesToSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024,
    dm = decimals < 0 ? 0 : decimals,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function createItem(
  filename: string,
  sizeBytes: number,
  origin: ItemOrigin,
  truncated = false
): Item {
  return {
    id: `ITEM-${Date.now()}`,
    type: 'file',
    name: filename,
    extension: 'json',
    origin,
    size: bytesToSize(sizeBytes) + (truncated ? ' (preview)' : ''),
    author: { name: 'System' },
    isFavorite: false,
    isPublic: false,
    tags: [],
    shared: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
/* ------------------------------------------------------------------ */

export function Uploader({
  onClose,
  open = false,
  onSchemaUpload,
}: UploaderProps): React.JSX.Element {
  const [files, setFiles] = React.useState<File[]>([]);

  React.useEffect(() => setFiles([]), [open]);

  /* -------- handlers ---------------------------------------------- */
  const handleDrop = React.useCallback(
    (newFiles: File[]) => setFiles((prev) => [...prev, ...newFiles]),
    []
  );
  const handleRemove = React.useCallback(
    (file: File) => setFiles((prev) => prev.filter((f) => f.path !== file.path)),
    []
  );
  const handleRemoveAll = React.useCallback(() => setFiles([]), []);

  const handleUpload = React.useCallback(async () => {
    if (!onSchemaUpload) return onClose?.();

    /* pick first acceptable file */
    const file = files.find(
      (f) =>
        f.name.toLowerCase().endsWith('.json') ||
        f.name.toLowerCase().endsWith('.csv')
    );
    if (!file) return onClose?.();

    try {
      const raw = await file.text();
      let parsed: unknown;
      let storeName = file.name;
      let origin: ItemOrigin = 'json';

      /* JSON upload */
      if (file.name.toLowerCase().endsWith('.json')) {
        parsed = JSON.parse(raw);
      } else {
        /* CSV → JSON array */
        const [header, ...rows] = raw.trim().split(/\r?\n/).filter(Boolean);
        const headers = header.split(',').map((h) => h.trim());
        parsed = rows.map((line) => {
          const cells = line.split(',');
          return headers.reduce<Record<string, string>>((obj, h, idx) => {
            obj[h] = cells[idx]?.trim() ?? '';
            return obj;
          }, {});
        });
        storeName = file.name.replace(/\.csv$/i, '.json');
        origin = 'csv';
      }

      /* ---------- localStorage with size check -------------------- */
      let truncated = false;
      let jsonForStorage = JSON.stringify(parsed);
      let sizeBytes = jsonForStorage.length;

      if (sizeBytes > LOCAL_LIMIT) {
        truncated = true;
        /* keep lightweight preview so modal still works */
        if (origin === 'csv' && Array.isArray(parsed)) {
          const preview = (parsed as unknown[]).slice(0, PREVIEW_ROWS);
          jsonForStorage = JSON.stringify(preview);
          sizeBytes = jsonForStorage.length;
        } else {
          /* huge JSON file: skip storing any data */
          jsonForStorage = '';
        }
      }

      if (jsonForStorage && typeof window !== 'undefined') {
        localStorage.setItem(storeName, jsonForStorage);
      }

      const newItem = createItem(storeName, sizeBytes, origin, truncated);
      onSchemaUpload([newItem]);
    } catch (err) {
      console.error('Error processing uploaded file:', err);
      alert('Failed to process file. See console.');
    }

    onClose?.();
  }, [files, onClose, onSchemaUpload]);

  /* -------- UI ----------------------------------------------------- */
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <Stack
        direction="row"
        spacing={3}
        sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}
      >
        <Typography variant="h6">Upload files or schema</Typography>
        <IconButton onClick={onClose}>
          <XIcon />
        </IconButton>
      </Stack>

      <DialogContent>
        <Stack spacing={3}>
          <FileDropzone
            accept={{
              'application/json': ['.json'],
              'text/csv': ['.csv'],      // ✅ MIME‑type → extension list
            }}
            caption="Max file size is 10 MB"
            files={files}
            onDrop={handleDrop}
            maxSize={10 * 1024 * 1024}
          />

          {files.length ? (
            <Stack spacing={2}>
              {/* selected file list */}
              <Stack
                component="ul"
                spacing={1}
                sx={{ listStyle: 'none', m: 0, p: 0 }}
              >
                {files.map((file) => (
                  <Stack
                    component="li"
                    direction="row"
                    key={file.path}
                    spacing={2}
                    sx={{
                      alignItems: 'center',
                      border: '1px solid var(--mui-palette-divider)',
                      borderRadius: 1,
                      flex: '1 1 auto',
                      p: 1,
                    }}
                  >
                    <FileIcon extension={file.name.split('.').pop()} />
                    <Box sx={{ flex: '1 1 auto' }}>
                      <Typography variant="subtitle2">{file.name}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {bytesToSize(file.size)}
                      </Typography>
                    </Box>
                    <Tooltip title="Remove">
                      <IconButton onClick={() => handleRemove(file)}>
                        <XIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
              </Stack>

              {/* action buttons */}
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
              >
                <Button
                  color="secondary"
                  onClick={handleRemoveAll}
                  size="small"
                  type="button"
                >
                  Remove all
                </Button>
                <Button
                  onClick={handleUpload}
                  size="small"
                  type="button"
                  variant="contained"
                >
                  Upload
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
