"use client";

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { format } from "sql-formatter";

interface QueryDrawerContextValue {
  open: boolean;
  sql: string;
  setSql: React.Dispatch<React.SetStateAction<string>>;
  columns: string[];
  tableName: string;

  openDrawer: () => void;
  closeDrawer: () => void;
  setTableName: (t: string) => void;

  addColumnToQuery: (colName: string) => void;
  removeColumnFromQuery: (colName: string) => void;
  clearColumns: () => void;
}

const QueryDrawerContext = createContext<QueryDrawerContextValue>({
  open: false,
  sql: "SELECT * FROM `project.dataset.table`",
  setSql: () => {},
  columns: [],
  tableName: "`project.dataset.table`",
  openDrawer: () => {},
  closeDrawer: () => {},
  setTableName: () => {},
  addColumnToQuery: () => {},
  removeColumnFromQuery: () => {},
  clearColumns: () => {},
});

export function QueryDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const [sql, setSql] = useState("SELECT * FROM `project.dataset.table`");
  const [columns, setColumns] = useState<string[]>([]);
  const [tableName, setTableName] = useState("`project.dataset.table`");

  // Rebuild + auto-format whenever columns/tableName changes
  useEffect(() => {
    let rawSql = columns.length
      ? `SELECT ${columns.join(", ")}\nFROM ${tableName}`
      : `SELECT *\nFROM ${tableName}`;

    const formatted = format(rawSql, {
      language: "bigquery",
      tabWidth: 2,
      useTabs: false,
      keywordCase: "upper",
    });

    setSql(formatted);
  }, [columns, tableName]);

  // Manually open/close the drawer
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  // No longer automatically opening in addColumn
  const addColumnToQuery = useCallback((colName: string) => {
    setColumns((prev) => {
      let updated = prev.filter((c) => c !== "*");
      if (!updated.includes(colName)) {
        updated = [...updated, colName];
      }
      return updated;
    });
  }, []);

  const removeColumnFromQuery = useCallback((colName: string) => {
    setColumns((prev) => prev.filter((c) => c !== colName));
  }, []);

  const clearColumns = useCallback(() => {
    setColumns([]);
  }, []);

  const value: QueryDrawerContextValue = {
    open,
    sql,
    setSql,
    columns,
    tableName,

    openDrawer,
    closeDrawer,
    setTableName,
    addColumnToQuery,
    removeColumnFromQuery,
    clearColumns,
  };

  return (
    <QueryDrawerContext.Provider value={value}>
      {children}
    </QueryDrawerContext.Provider>
  );
}

export function useQueryDrawer() {
  return useContext(QueryDrawerContext);
}
