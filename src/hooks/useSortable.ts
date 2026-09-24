import { useCallback, useEffect, useState } from 'react';
import { SortOrder } from '../enums';

export interface UseSortableProps<TData> {
  /** Current field being sorted by */
  sort?: keyof TData;
  /** Current sort order (asc or desc) */
  order?: SortOrder;
  /** Callback triggered when sort state changes */
  onSortOrderChange?: (
    newSortOrder: Omit<UseSortableProps<TData>, 'onSortOrderChange'>
  ) => void;
}

/**
 * useSortable manages sort field and order for tables and lists.
 * Cycles through asc -> desc -> none for a given field and emits changes.
 *
 * @template TData - Row data type.
 * @param sort - Current sorted field.
 * @param order - Current sort order.
 * @param onSortOrderChange - Callback with new sort state.
 * @returns {Object} Sort management object
 * @returns {Object} sortObject - Current sort state with sort and order
 * @returns {(field: keyof TData) => void} handleSort - Function to trigger sort on a field
 */
export const useSortable = <TData>({
  sort,
  order,
  onSortOrderChange,
}: UseSortableProps<TData>) => {
  const [sortObject, setSortObject] = useState<{
    sort?: keyof TData;
    order?: SortOrder;
  }>();

  useEffect(() => {
    if (sort) {
      setSortObject((prevState) =>
        prevState?.sort === sort && prevState?.order === order
          ? prevState
          : {
              sort,
              order: order || undefined,
            }
      );
    }
  }, [sort, order]);

  const handleSort = useCallback(
    (field: keyof TData) => {
      setSortObject((prev) => {
        const isSameField = prev?.sort === field;
        const newSortOrder = isSameField
          ? prev?.order === SortOrder.ASC
            ? SortOrder.DESC
            : undefined
          : SortOrder.ASC;

        const newSortObject = {
          sort: newSortOrder ? field : undefined,
          order: newSortOrder,
        };

        if (onSortOrderChange) {
          onSortOrderChange(newSortObject);
        }
        return newSortObject;
      });
    },
    [onSortOrderChange]
  );

  return {
    sortObject,
    handleSort,
  };
};
