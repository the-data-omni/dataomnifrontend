'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import { UploadSimple as UploadSimpleIcon } from '@phosphor-icons/react/dist/ssr/UploadSimple';

import { useDialog } from '@/hooks/use-dialog';
import { Uploader } from './uploader';
import type { Item } from './types';

interface UploadButtonProps {
  onSchemaUpload?: (items: Item[]) => void;
}

export function UplaodButton({ onSchemaUpload }: UploadButtonProps): React.JSX.Element {
  const uploadDialog = useDialog();

  return (
    <React.Fragment>
      <Button onClick={uploadDialog.handleOpen} startIcon={<UploadSimpleIcon />} variant="contained">
        Upload
      </Button>
      <Uploader onClose={uploadDialog.handleClose} open={uploadDialog.open} onSchemaUpload={onSchemaUpload} />
    </React.Fragment>
  );
}
