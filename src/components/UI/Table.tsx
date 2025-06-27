import React from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";

// StyledTableContainer with responsive properties
const StyledTableContainer = styled(Box)(({ theme }) => ({
  overflowX: "auto", // Enable horizontal scrolling on small screens
  maxWidth: "100%",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#ffffff",
  [theme.breakpoints.down("sm")]: {
    "& .MuiTableCell-root": {
      padding: "8px", // Reduced padding on small screens
      fontSize: "0.75rem", // Smaller font size
    },
  },
}));

// StyledTableRow for consistent row styling
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "#f8fafc", // Subtle hover effect
  },
  "&:last-child td, &:last-child th": {
    borderBottom: 0, // Remove border for last row
  },
}));

interface Column<T> {
  id: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string; // Added width property for fixed column widths
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  rowsPerPage: number;
  orderBy: string;
  orderDirection: "asc" | "desc";
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onSort: (columnId: string) => void;
  renderActions?: (row: T) => React.ReactNode;
  noDataMessage?: string;
}

const Table = <T,>({
  columns,
  data,
  total,
  page,
  rowsPerPage,
  orderBy,
  orderDirection,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  renderActions,
  noDataMessage,
}: TableProps<T>) => {
  const { t } = useTranslation();

  return (
    <>
      <StyledTableContainer>
        <MuiTable stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#f1f5f9",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id as string}
                  sx={{
                    fontWeight: 700,
                    color: "#1e293b",
                    py: 2,
                    borderBottom: "2px solid #e2e8f0",
                    width: column.width || "auto", // Set fixed width
                    minWidth: column.width || "100px", // Ensure minimum width
                    maxWidth: column.width || "200px", // Prevent overflow
                    whiteSpace: "nowrap", // Prevent text wrapping
                    overflow: "hidden",
                    textOverflow: "ellipsis", // Truncate long text
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? orderDirection : "asc"}
                      onClick={() => onSort(column.id as string)}
                      sx={{
                        "&:hover": {
                          color: "#3b82f6",
                        },
                        "&.Mui-active": {
                          color: "#3b82f6",
                        },
                        "& .MuiTableSortLabel-icon": {
                          color: "#3b82f6 !important",
                        },
                      }}
                    >
                      {t(column.label)}
                    </TableSortLabel>
                  ) : (
                    t(column.label)
                  )}
                </TableCell>
              ))}
              {renderActions && (
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#1e293b",
                    py: 2,
                    borderBottom: "2px solid #e2e8f0",
                    width: "150px", // Fixed width for actions
                    minWidth: "150px",
                    maxWidth: "150px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Actions")}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <StyledTableRow key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id as string}
                      sx={{
                        py: 1.5,
                        color: "#475569",
                        borderBottom: "1px solid #e5e7eb",
                        width: column.width || "auto",
                        minWidth: column.width || "100px",
                        maxWidth: column.width || "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {column.render
                        ? column.render(row)
                        : (row[column.id as keyof T] as unknown as React.ReactNode)}
                    </TableCell>
                  ))}
                  {renderActions && (
                    <TableCell
                      sx={{
                        py: 1.5,
                        borderBottom: "1px solid #e5e7eb",
                        width: "100px",
                        minWidth: "100px",
                        maxWidth: "100px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {renderActions(row)}
                    </TableCell>
                  )}
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  align="center"
                  sx={{
                    py: 4,
                    color: "#64748b",
                  }}
                >
                  <Typography variant="body2">
                    {noDataMessage || t("No data available")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </StyledTableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_event, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(parseInt(event.target.value, 10))
        }
        labelRowsPerPage={t("Rows per page:")}
        labelDisplayedRows={({ from, to, count }) =>
          t(`${from}-${to} of ${count}`)
        }
        sx={{
          borderTop: "1px solid #e5e7eb",
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            color: "#475569",
          },
          "& .MuiTablePagination-actions": {
            "& .MuiIconButton-root": {
              color: "#3b82f6",
              "&:hover": {
                backgroundColor: "#eff6ff",
              },
            },
          },
        }}
      />
    </>
  );
};

export default Table;