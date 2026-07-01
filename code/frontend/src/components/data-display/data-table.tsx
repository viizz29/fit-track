import { useState, useMemo } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TableSortLabel,
  Box, TextField, InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LoadingState from "@/components/data-display/loading-state";
import EmptyState from "@/components/data-display/empty-state";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string | number;
  hideOnMobile?: boolean;
}

export type SortDirection = "asc" | "desc";

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  searchPlaceholder?: string;
  searchable?: boolean;
  loadingRows?: number;
  stickyHeader?: boolean;
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  getRowKey,
  loading = false,
  emptyMessage = "No data available.",
  pageSize: defaultPageSize = 10,
  searchPlaceholder = "Search...",
  searchable = true,
  loadingRows = 5,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const raw = row[col.key];
        if (raw == null) return false;
        return String(raw).toLowerCase().includes(q);
      }),
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortColumn) return filtered;
    const col = columns.find((c) => c.key === sortColumn);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let cmp = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        cmp = aVal.localeCompare(bVal);
      } else {
        cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortColumn, sortDirection, columns]);

  const paginated = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage],
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {searchable && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2, width: { xs: "100%", sm: 300 } }}
        />
      )}

      {loading ? (
        <LoadingState rows={loadingRows} />
      ) : paginated.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader={stickyHeader}>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align || "left"}
                    sx={{ fontWeight: 600, width: col.width, ...(col.hideOnMobile ? { display: { xs: "none", md: "table-cell" } } : {}) }}
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={sortColumn === col.key}
                        direction={sortColumn === col.key ? sortDirection : "asc"}
                        onClick={() => handleSort(col.key)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={getRowKey(row)} hover>
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align || "left"} sx={col.hideOnMobile ? { display: { xs: "none", md: "table-cell" } } : {}}>
                      {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            labelRowsPerPage={""}
            count={sorted.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}
    </Box>
  );
}

export default DataTable;
