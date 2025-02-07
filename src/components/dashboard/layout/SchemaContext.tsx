'use client';

import * as React from 'react';

interface SchemaContextValue {
  selectedSchemaName?: string;
  setSelectedSchemaName: (name?: string) => void;
}

export const SchemaContext = React.createContext<SchemaContextValue>({
  setSelectedSchemaName: () => {}
});

export function SchemaProvider({ children }: { children: React.ReactNode }) {
  const [selectedSchemaName, setSelectedSchemaName] = React.useState<string>();

  return (
    <SchemaContext.Provider value={{ selectedSchemaName, setSelectedSchemaName }}>
      {children}
    </SchemaContext.Provider>
  );
}
