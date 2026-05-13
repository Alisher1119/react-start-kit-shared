import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * State shape for the columns store.
 */
export type ColumnsStoreState = {
  /** Map of stored column visibilities keyed by table key. */
  storedColumns: Record<string, Record<string, boolean>>;
  /** Map of stored column orders (array of keys) keyed by table key. */
  columnOrders: Record<string, string[]>;
  /** Action to update stored columns. */
  setColumns: (storedColumns: ColumnsStoreState['storedColumns']) => void;
  /** Action to update column order for a specific table key. */
  setColumnOrder: (key: string, order: string[]) => void;
};

/**
 * Zustand store to persist column visibility and order settings across sessions.
 */
export const useColumnsStore = create<ColumnsStoreState>()(
  persist(
    (set) => ({
      setColumns: (storedColumns) => {
        set({ storedColumns });
      },
      setColumnOrder: (key, order) => {
        set((state) => ({
          columnOrders: { ...state.columnOrders, [key]: order },
        }));
      },
      storedColumns: {},
      columnOrders: {},
    }),
    {
      name: 'columnsStore',
    }
  )
);
