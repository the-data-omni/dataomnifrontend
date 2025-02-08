// workspaces-popover.tsx
'use client';

import React from 'react';
import { useNavigate } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { paths } from '@/paths';

// local storage retrieval
function getLocalJsonSchemas() {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('uploadedItems');
  if (!stored) return [];
  try {
    const items = JSON.parse(stored) || [];
    // Filter for .json files
    return items
      .filter((i: any) => i.extension === 'json')
      .map((i: any) => ({ name: i.name }));
  } catch {
    return [];
  }
}

export interface SchemaPopoverProps {
  anchorEl: null | Element;
  onChange?: (schemaName: string) => void;
  onClose?: () => void;
  open?: boolean;
}

export function SchemaPopover({
  anchorEl,
  onChange,
  onClose,
  open = false
}: SchemaPopoverProps) {
  const navigate = useNavigate();

  // State that holds both local JSON files and the example file
  const [schemas, setSchemas] = React.useState<{ name: string }[]>([]);

  // Load local storage + example schema on mount
  React.useEffect(() => {
    // Start with local JSON schemas
    const localSchemas = getLocalJsonSchemas();

    // Fetch example schema from public folder
    fetch('/example-schema.json')
      .then((res) => {
        if (!res.ok) {
          // if the file is missing or an error occurred, just return null
          return null;
        }
        return res.json();
      })
      .then((exampleSchema) => {
        // exampleSchema might be null if fetch failed
        if (exampleSchema) {
          // 1. Store the raw JSON in localStorage, keyed by "example-schema.json"
          localStorage.setItem('example-schema.json', JSON.stringify(exampleSchema));
          
          // 2. Also add an entry to "uploadedItems" so it shows in our local schemas list
          const uploadedItemsRaw = localStorage.getItem('uploadedItems') || '[]';
          const uploadedItems = JSON.parse(uploadedItemsRaw) as any[];

          // Check if we already have "example-schema.json" in uploadedItems
          const alreadyExists = uploadedItems.some(
            (item) => item.name === 'example-schema.json'
          );

          if (!alreadyExists) {
            uploadedItems.push({
              name: 'example-schema.json',
              extension: 'json'
            });
            localStorage.setItem('uploadedItems', JSON.stringify(uploadedItems));
          }

          // 3. Finally, push it into localSchemas array so it's visible in this component
          // (Though if it's already in local storage, getLocalJsonSchemas might have done this,
          //  but let's push again in case it wasn't there yet.)
          const alreadyInLocalSchemas = localSchemas.some(
            (ls: { name: string; }) => ls.name === 'example-schema.json'
          );
          if (!alreadyInLocalSchemas) {
            localSchemas.push({ name: 'example-schema.json' });
          }
        }

        // Update the state
        setSchemas(localSchemas);
      })
      .catch(() => {
        // If there's a fetch error, we just ignore adding the example schema
        setSchemas(localSchemas);
      });
  }, []);

  // Handler for “Load from API”
  const handleLoadFromAPI = () => {
    // Redirect to the file storage page
    navigate(paths.dashboard.fileStorage);
    onClose?.();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: 250 } } }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      <MenuItem onClick={handleLoadFromAPI}>
        <ListItemAvatar>
          <Avatar variant="rounded">U</Avatar>
        </ListItemAvatar>
        <Typography variant="body2">Load from API</Typography>
      </MenuItem>

      {schemas.map((schema) => (
        <MenuItem
          key={schema.name}
          onClick={() => {
            onChange?.(schema.name);
            onClose?.();
          }}
        >
          <ListItemAvatar>
            <Avatar variant="rounded">S</Avatar>
          </ListItemAvatar>
          {schema.name}
        </MenuItem>
      ))}
    </Menu>
  );
}
