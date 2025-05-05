"use client";

import type * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import type { TableProps } from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

type RowId = number | string;

/**
 * Each column in the table.
 * - `field` can be *any* string, since our rows can have arbitrary keys.
 * - `headerRenderer` is optional for custom header content (e.g. charts, filter boxes).
 */
export interface ColumnDef<TRowModel extends Record<string, unknown>> {
  align?: "left" | "right" | "center";
  field?: string;
  formatter?: (row: TRowModel, index: number) => React.ReactNode;
  hideName?: boolean;
  name: string;
  width?: number | string;

  /**
   * Optional custom header renderer: if present, it overrides the default (which shows `column.name`).
   */
  headerRenderer?: () => React.ReactNode;
}

/**
 * Props for our reusable data table component:
 * - `rows`: array of objects (with optional `id`).
 * - `columns`: array of column definitions.
 * - `selectable`: if true, we display checkboxes for row selection.
 * - `selected`: a set of row IDs that are currently selected.
 * - `onSelectAll` / `onDeselectAll` / `onSelectOne` / `onDeselectOne`: handlers for selection logic.
 * - `uniqueRowId`: function to generate a stable ID if row doesn't have an `id` field.
 */
export interface DataTableProps<
  TRowModel extends Record<string, unknown> & { id?: RowId | null }
> extends Omit<TableProps, "onClick"> {
  columns: ColumnDef<TRowModel>[];
  hideHead?: boolean;
  hover?: boolean;
  onClick?: (event: React.MouseEvent, row: TRowModel) => void;
  onDeselectAll?: (event: React.ChangeEvent) => void;
  onDeselectOne?: (event: React.ChangeEvent, row: TRowModel) => void;
  onSelectAll?: (event: React.ChangeEvent) => void;
  onSelectOne?: (event: React.ChangeEvent, row: TRowModel) => void;
  rows: TRowModel[];
  selectable?: boolean;
  selected?: Set<RowId>;
  uniqueRowId?: (row: TRowModel) => RowId;
}

export function DataTable<
  TRowModel extends Record<string, unknown> & { id?: RowId | null }
>({
  columns,
  hideHead,
  hover,
  onClick,
  onDeselectAll,
  onDeselectOne,
  onSelectOne,
  onSelectAll,
  rows,
  selectable,
  selected,
  uniqueRowId,
  ...props
}: DataTableProps<TRowModel>): React.JSX.Element {
  const selectedSome =
    (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  return (
    <Table {...props}>
      {/* TABLE HEAD */}
      <TableHead
        sx={{
          ...(hideHead && {
            visibility: "collapse",
            "--TableCell-borderWidth": 0,
          }),
        }}
      >
        <TableRow>
          {selectable ? (
            <TableCell
              padding="checkbox"
              sx={{ width: "40px", minWidth: "40px", maxWidth: "40px" }}
            >
              <Checkbox
                checked={selectedAll}
                indeterminate={selectedSome}
                onChange={(event: React.ChangeEvent) => {
                  if (selectedAll) {
                    onDeselectAll?.(event);
                  } else {
                    onSelectAll?.(event);
                  }
                }}
              />
            </TableCell>
          ) : null}

          {columns.map((column) => (
            <TableCell
              key={column.name}
              sx={{
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
                ...(column.align && { textAlign: column.align }),
              }}
            >
              {/* If there's a headerRenderer, use that; otherwise show column.name (unless hideName) */}
              {column.headerRenderer
                ? column.headerRenderer()
                : column.hideName
                ? null
                : column.name}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      {/* TABLE BODY */}
      <TableBody>
        {rows.map((row, index) => {
          const rowId = row.id ?? uniqueRowId?.(row);
          const rowSelected = rowId ? selected?.has(rowId) : false;

          return (
            <TableRow
              key={rowId ?? index}
              hover={hover}
              selected={rowSelected}
              {...(onClick && {
                onClick: (event: React.MouseEvent) => onClick(event, row),
              })}
              sx={{ ...(onClick && { cursor: "pointer" }) }}
            >
              {selectable ? (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={rowSelected || false}
                    onChange={(event: React.ChangeEvent) => {
                      if (rowSelected) {
                        onDeselectOne?.(event, row);
                      } else {
                        onSelectOne?.(event, row);
                      }
                    }}
                    onClick={(event: React.MouseEvent) => {
                      // Stop row click from also firing if user clicks on the checkbox
                      if (onClick) {
                        event.stopPropagation();
                      }
                    }}
                  />
                </TableCell>
              ) : null}

              {/* Render each column cell */}
              {columns.map((column) => (
                <TableCell
                  key={column.name}
                  sx={{
                    ...(column.align && { textAlign: column.align }),
                  }}
                >
                  {column.formatter
                    ? column.formatter(row, index)
                    : column.field
                    ? // row is Record<string, unknown>, so we can safely do row[column.field]
                      String(row[column.field] ?? "")
                    : null}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
