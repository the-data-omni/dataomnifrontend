'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';

import { usePopover } from '@/hooks/use-popover';
import { SchemaPopover } from './workspaces-popover';
import { SchemaContext } from './SchemaContext'; // Adjust import path accordingly

export function SchemaSwitch(): React.JSX.Element {
  const { selectedSchemaName, setSelectedSchemaName } = React.useContext(SchemaContext);
  const popover = usePopover<HTMLDivElement>();

  const handleChange = React.useCallback((schemaName: string) => {
    setSelectedSchemaName(schemaName);
  }, [setSelectedSchemaName]);

  const handleLoadFromApi = React.useCallback(() => {
    // We'll handle load from API in page.tsx by also exposing a callback from there or by a global event.
    // For simplicity, let's dispatch a custom event and handle in page, or handle all in page?
    // Another approach: We'll store a global callback in context or call a callback passed down from parent.
    const event = new CustomEvent('LoadFromApi');
    window.dispatchEvent(event);
  }, []);

  return (
    <React.Fragment>
      <Stack
        direction="row"
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        spacing={2}
        sx={{
          alignItems: 'center',
          border: '1px solid var(--Workspaces-border-color)',
          borderRadius: '12px',
          cursor: 'pointer',
          p: '4px 8px',
        }}
      >
        <Avatar variant="rounded">{selectedSchemaName ? selectedSchemaName.charAt(0).toUpperCase() : 'S'}</Avatar>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography variant="caption">Schema</Typography>
          <Typography variant="subtitle2">
            {selectedSchemaName ?? 'No schema selected'}
          </Typography>
        </Box>
        <CaretUpDownIcon color="var(--Workspaces-expand-color)" fontSize="var(--icon-fontSize-sm)" />
      </Stack>
      <SchemaPopover
        anchorEl={popover.anchorRef.current}
        onChange={handleChange}
        onClose={popover.handleClose}
        // onLoadFromApi={handleLoadFromApi}
        open={popover.open}
      />
    </React.Fragment>
  );
}
