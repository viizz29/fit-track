import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

type Table23Props<T> = {
  data: T[];
  fields: (keyof T)[];
};

function GenericTable<T extends Record<string, any>>({
  data,
  fields,
}: Table23Props<T>) {
  return (
    <TableContainer component={Paper} elevation={1}>
      <Table size="small">
        {/* Header */}
        <TableHead>
          <TableRow>
            {fields.map((field) => (
              <TableCell
                key={String(field)}
                sx={{ fontWeight: 600 }}
              >
                {String(field)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* Body */}
        <TableBody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                hover
              >
                {fields.map((field) => (
                  <TableCell key={String(field)}>
                    {String(row[field])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={fields.length} align="center">
                <Typography variant="body2" color="text.secondary">
                  No data available
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default GenericTable;