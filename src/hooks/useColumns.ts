import get from 'lodash.get';
import isEmpty from 'lodash.isempty';
import { useCallback, useEffect, useMemo } from 'react';
import { useColumnsStore } from '../stores';
import type { ColumnType } from '../types';

/**
 * Props for the useColumns hook.
 * @template TData - The type of data associated with the columns.
 */
export interface UseColumnsProps<TData> {
  /** Unique key to identify the table for persisting column state. */
  key: string;
  /** Array of column definitions. */
  columns: ColumnType<TData>[];
}

/**
 * useColumns manages visibility and order of table columns using a persisted store.
 * Returns formatted columns and helpers to toggle/reset visibility and reorder via drag-and-drop.
 *
 * @template TData - Row data type.
 * @param key - Unique key for storing visibility/order per table.
 * @param columns - Original column definitions.
 * @returns {Object} Column management object
 * @returns {ColumnType<TData>[]} formattedColumns - Filtered and ordered columns with visibility applied from store
 * @returns {(column: ColumnType<TData>, value: boolean) => void} handleColumnsChange - Function to toggle column visibility
 * @returns {() => void} resetColumns - Function to reset all columns to their default visibility and order
 * @returns {(fromKey: string, toKey: string) => void} moveColumn - Function to move a column from one position to another
 */
export const useColumns = <TData>({
  key,
  columns = [],
}: UseColumnsProps<TData>) => {
  const { storedColumns, columnOrders, setColumns, setColumnOrder } =
    useColumnsStore();

  useEffect(() => {
    const dataColumns = columns.filter((c) => c.type !== 'action');

    if (isEmpty(get(storedColumns, key)) && !isEmpty(columns)) {
      const columnsObj = {};
      columns.forEach((column) => {
        Object.assign(columnsObj, { [column.key]: !!column.hidden });
      });
      setColumns({
        ...storedColumns,
        [key]: columnsObj,
      });
    }

    if (isEmpty(get(columnOrders, key)) && !isEmpty(dataColumns)) {
      setColumnOrder(
        key,
        dataColumns.map((c) => c.key)
      );
    }
  }, [key, columns, storedColumns, columnOrders, setColumns, setColumnOrder]);

  const formattedColumns = useMemo(() => {
    const columnsObj = get(storedColumns, key, {});
    const order: string[] = get(columnOrders, key, []);

    const dataColumns = columns
      .filter((column) => column.type !== 'action')
      .map((column) => {
        const { hidden, ...rest } = column;
        return {
          ...rest,
          hidden: get(columnsObj, column.key, !!hidden),
        };
      });

    if (isEmpty(order)) return dataColumns;

    const columnMap = new Map(dataColumns.map((c) => [c.key, c]));

    const ordered = order
      .map((k) => columnMap.get(k))
      .filter((c): c is (typeof dataColumns)[number] => c !== undefined);

    // append any new columns not yet in the stored order
    const orderedKeys = new Set(order);
    dataColumns
      .filter((c) => !orderedKeys.has(c.key))
      .forEach((c) => ordered.push(c));

    return ordered;
  }, [key, storedColumns, columnOrders, columns]);

  const handleColumnsChange = useCallback(
    (column: ColumnType<TData>, value: boolean) => {
      const columnsObj = get(storedColumns, key, {});
      Object.assign(columnsObj, { [column.key]: value });

      setColumns({
        ...storedColumns,
        [key]: columnsObj,
      });
    },
    [key, setColumns, storedColumns]
  );

  const moveColumn = useCallback(
    (fromKey: string, toKey: string) => {
      if (fromKey === toKey) return;

      const currentOrder: string[] = get(
        columnOrders,
        key,
        columns.filter((c) => c.type !== 'action').map((c) => c.key)
      );

      const fromIndex = currentOrder.indexOf(fromKey);
      const toIndex = currentOrder.indexOf(toKey);

      if (fromIndex === -1 || toIndex === -1) return;

      const newOrder = [...currentOrder];
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, fromKey);

      setColumnOrder(key, newOrder);
    },
    [key, columnOrders, columns, setColumnOrder]
  );

  const resetColumns = useCallback(() => {
    const dataColumns = columns.filter((c) => c.type !== 'action');
    const columnsObj: Record<string, boolean> = {};
    columns.forEach((column) => {
      Object.assign(columnsObj, { [column.key]: !!column.hidden });
    });

    setColumns({
      ...storedColumns,
      [key]: columnsObj,
    });
    setColumnOrder(
      key,
      dataColumns.map((c) => c.key)
    );
  }, [key, setColumns, setColumnOrder, storedColumns, columns]);

  return {
    formattedColumns,
    handleColumnsChange,
    moveColumn,
    resetColumns,
  };
};
