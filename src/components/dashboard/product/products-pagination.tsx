"use client";

import * as React from "react";
import TablePagination from "@mui/material/TablePagination";

interface QueriesPaginationProps {
  count: number;   // total number of filtered rows
  page: number;    // current page
  rowsPerPage: number;  // how many rows shown per page
  onChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * QueriesPagination => uses MUI's TablePagination
 */
export function QueriesPagination({
  count,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage
}: QueriesPaginationProps): React.JSX.Element {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onChangePage}
      onRowsPerPageChange={onChangeRowsPerPage}
      rowsPerPageOptions={[5, 10, 25]}
    />
  );
}
