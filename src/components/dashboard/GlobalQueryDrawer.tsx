// components/GlobalQueryDrawer.tsx
"use client";

import React from 'react';
import { Drawer, Box, IconButton, Button, Typography } from '@mui/material';
import { X as XIcon } from '@phosphor-icons/react';
import Editor, { OnMount, BeforeMount, Monaco } from '@monaco-editor/react'; 
import { useQueryDrawer } from '@/components/dashboard/chat/context/query-drawer-context';

// 1) Import the SQL format function:
import { format } from 'sql-formatter';

export function GlobalQueryDrawer() {
  const { open, closeDrawer, sql, setSql } = useQueryDrawer();

  // 2) A function that registers the Document Formatting provider
  const handleEditorWillMount: BeforeMount = (monaco: Monaco) => {
    monaco.languages.registerDocumentFormattingEditProvider('sql', {
      provideDocumentFormattingEdits(model, options, token) {
        const originalText = model.getValue();

        // sql-formatter usage:
        const formattedText = format(originalText, {
          language: 'bigquery',  // or 'bigquery', 'mysql', etc.
          tabWidth: 2,
          useTabs: false,
          keywordCase: 'upper'
        });

        // Return a single text edit that covers the entire file
        return [
          {
            range: model.getFullModelRange(),
            text: formattedText,
          },
        ];
      },
    });
  };

  // 3) (Optional) if you want to store a ref to the editor instance
  const handleEditorDidMount: OnMount = (editorInstance, monacoLib) => {
    // You could programmatically call format:
    // editorInstance.trigger('', 'editor.action.formatDocument', null);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeDrawer}
      PaperProps={{ sx: { width: 500, p: 2, display: 'flex', flexDirection: 'column' } }}
      variant="temporary"
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Query Builder
        </Typography>
        <IconButton onClick={closeDrawer}>
          <XIcon />
        </IconButton>
      </Box>

      {/* 4) The Editor with beforeMount + onMount */}
      <Box sx={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={sql}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={(val) => {
            if (typeof val === 'string') {
              setSql(val);
            }
          }}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
          }}
        />
      </Box>

      {/* Footer / Actions */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="contained" onClick={() => alert(`Run query:\n\n${sql}`)}>
          Run Query
        </Button>
      </Box>
    </Drawer>
  );
}
