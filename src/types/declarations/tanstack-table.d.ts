
declare module '@tanstack/react-table' {
  // Basic types for react-table
  export interface ColumnDef<T extends object = {}, TValue = unknown> {
    id?: string;
    accessorKey?: string;
    accessorFn?: (row: T) => TValue;
    header?: string | ((info: any) => React.ReactNode);
    cell?: (info: any) => React.ReactNode;
    meta?: Record<string, any>;
    enableSorting?: boolean;
    enableHiding?: boolean;
    enableColumnFilter?: boolean;
  }

  export interface TableOptions<T extends object> {
    data: T[];
    columns: ColumnDef<T>[];
    getCoreRowModel?: () => any;
    getSortedRowModel?: () => any;
    getFilteredRowModel?: () => any;
    getPaginationRowModel?: () => any;
    state?: {
      sorting?: SortingState;
      columnFilters?: ColumnFiltersState;
      pagination?: PaginationState;
      rowSelection?: Record<string, boolean>;
      globalFilter?: string;
    };
    onSortingChange?: any;
    onColumnFiltersChange?: any;
    onPaginationChange?: any;
    onRowSelectionChange?: any;
    onGlobalFilterChange?: any;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    manualPagination?: boolean;
    globalFilterFn?: any;
  }

  export type SortingState = Array<{
    id: string;
    desc: boolean;
  }>;

  export type ColumnFiltersState = Array<{
    id: string;
    value: any;
  }>;

  export interface PaginationState {
    pageIndex: number;
    pageSize: number;
  }

  export function useReactTable<T extends object>(options: TableOptions<T>): Table<T>;
  export function getCoreRowModel(): any;
  export function getSortedRowModel(): any;
  export function getFilteredRowModel(): any;
  export function getPaginationRowModel(): any;
  export function flexRender(component: any, props: any): React.ReactNode;
  
  export interface Row<T extends object = {}> {
    id: string;
    index: number;
    original: T;
    getIsSelected: () => boolean;
    getIsSomeSelected: () => boolean;
    getIsAllSubRowsSelected: () => boolean;
    getCanSelect: () => boolean;
    getCanMultiSelect: () => boolean;
    getCanSelectSubRows: () => boolean;
    getToggleSelectedHandler: () => (event: unknown) => void;
    getVisibleCells: () => any[];
  }
  
  // Add missing Table type
  export interface Table<T extends object = {}> {
    getState: () => any;
    getRowModel: () => { rows: Row<T>[] };
    getColumn: (id: string) => any;
    getAllColumns: () => any[];
    getHeaderGroups: () => any[];
    getFlatHeaders: () => any[];
    getPreFilteredRowModel: () => any;
    getFilteredRowModel: () => any;
    getPaginationRowModel: () => any;
    getSortedRowModel: () => any;
    setPageIndex: (index: number) => void;
    getPageCount: () => number;
    getCanPreviousPage: () => boolean;
    getCanNextPage: () => boolean;
    previousPage: () => void;
    nextPage: () => void;
    setPageSize: (size: number) => void;
    resetRowSelection: () => void;
    resetColumnFilters: () => void;
    resetGlobalFilter: () => void;
    getSelectedRowModel: () => any;
  }
}
