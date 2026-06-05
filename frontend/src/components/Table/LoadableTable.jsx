/*eslint-disable*/
import TableLoadingSkeleton, { TableEmptyState } from './TableLoadingSkeleton';

const LoadableTable = ({
  loading,
  loadingConfig = {},
  data,
  columns,
  columnWidths = {},
  renderRow,
  emptyMessage = 'No data available',
  emptyIcon = null,
  emptyActionButton = null,
  children
}) => {
  // Loading state
  if (loading) {
    return (
      <TableLoadingSkeleton
        columns={columns}
        rowsCount={loadingConfig.rowsCount || 5}
        columnWidths={columnWidths}
        variant={loadingConfig.variant || 'skeleton'}
      />
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return <TableEmptyState columns={columns} message={emptyMessage} icon={emptyIcon} actionButton={emptyActionButton} />;
  }

  // Data rendered by parent
  return <>{children}</>;
};

export default LoadableTable;
