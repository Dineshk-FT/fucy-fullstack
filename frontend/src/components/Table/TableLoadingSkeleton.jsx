/*eslint-disable*/
import React from 'react';
import { Box, Skeleton, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '10px 8px',
  textAlign: 'center',
  borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:last-child td, &:last-child th': { border: 0 }
}));

// Skeleton row component
const SkeletonRow = ({ columns, columnWidths, rowIndex }) => (
  <StyledTableRow key={`skeleton-${rowIndex}`}>
    {columns.map((column, idx) => (
      <StyledTableCell key={idx}>
        <Skeleton
          variant="text"
          width={columnWidths?.[column.id] ? `${Math.min(parseInt(columnWidths[column.id]), 200)}px` : column.skeletonWidth || '80%'}
          height={column.skeletonHeight || 25}
          animation="wave"
          sx={{
            margin: '0 auto',
            transform: 'scale(1)',
            bgcolor: 'rgba(0, 0, 0, 0.08)'
          }}
        />
      </StyledTableCell>
    ))}
  </StyledTableRow>
);

// Main loading component
const TableLoadingSkeleton = ({
  columns,
  rowsCount = 5,
  columnWidths = {},
  variant = 'skeleton', // 'skeleton', 'shimmer', 'spinner'
  emptyMessage = 'No data available',
  showCustomMessage = false
}) => {
  // Shimmer loading variant
  if (variant === 'shimmer') {
    return (
      <TableBody>
        {[...Array(rowsCount)].map((_, index) => (
          <StyledTableRow key={`shimmer-${index}`}>
            {columns.map((item, idx) => (
              <StyledTableCell key={idx}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    className="loading-shimmer"
                    style={{
                      width: columnWidths?.[item.id] ? `${Math.min(parseInt(columnWidths[item.id]), 200)}px` : item.shimmerWidth || '80px',
                      height: item.shimmerHeight || '20px',
                      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              </StyledTableCell>
            ))}
          </StyledTableRow>
        ))}
      </TableBody>
    );
  }

  // Spinner with overlay variant
  if (variant === 'spinner') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(2px)'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <div
            className="loading-spinner"
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
              borderTopColor: '#4caf50',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <Box sx={{ mt: 2, color: '#666' }}>Loading data...</Box>
        </Box>
      </Box>
    );
  }

  // Default skeleton loading
  return (
    <TableBody>
      {[...Array(rowsCount)].map((_, index) => (
        <SkeletonRow key={`skeleton-${index}`} columns={columns} columnWidths={columnWidths} rowIndex={index} />
      ))}
    </TableBody>
  );
};

// Empty state component
export const TableEmptyState = ({ columns, message = 'No data available', colSpan, icon, actionButton }) => (
  <TableBody>
    <TableRow>
      <TableCell colSpan={6} align="left">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          {icon && <Box sx={{ mb: 2 }}>{icon}</Box>}
          <Typography variant="body1" color="textSecondary">
            {message}
          </Typography>
          {actionButton && <Box sx={{ mt: 2 }}>{actionButton}</Box>}
        </Box>
      </TableCell>
    </TableRow>
  </TableBody>
);

export default TableLoadingSkeleton;
