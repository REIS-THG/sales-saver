
// Type declarations for missing packages

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
    };
    onSortingChange?: any;
    onColumnFiltersChange?: any;
    onPaginationChange?: any;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    manualPagination?: boolean;
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

  export function useReactTable<T extends object>(options: TableOptions<T>): any;
  export function getCoreRowModel(): any;
  export function getSortedRowModel(): any;
  export function getFilteredRowModel(): any;
  export function getPaginationRowModel(): any;
  export function flexRender(component: any, props: any): React.ReactNode;
}

declare module '@dnd-kit/core' {
  export interface DndContextProps {
    sensors?: any[];
    collisionDetection?: any;
    modifiers?: any[];
    onDragStart?: (event: any) => void;
    onDragMove?: (event: any) => void;
    onDragEnd?: (event: any) => void;
    onDragCancel?: (event: any) => void;
  }

  export function DndContext(props: DndContextProps & React.PropsWithChildren<{}>): JSX.Element;
  export function useSensor(sensor: any, options?: any): any;
  export function useSensors(...sensors: any[]): any[];
  export function MouseSensor(options?: any): any;
  export function TouchSensor(options?: any): any;
  export function KeyboardSensor(options?: any): any;
  export function pointerWithin(args?: any): any;
  export function rectIntersection(args?: any): any;
}

declare module '@dnd-kit/sortable' {
  export function SortableContext(props: { items: any[]; strategy?: any } & React.PropsWithChildren<{}>): JSX.Element;
  export function useSortable(args: { id: string | number }): any;
  export function verticalListSortingStrategy(args?: any): any;
  export function horizontalListSortingStrategy(args?: any): any;
  export function rectSortingStrategy(args?: any): any;
}

declare module '@dnd-kit/utilities' {
  export const CSS: {
    Transform: {
      toString(args?: any): string;
    };
    Transition: {
      toString(args?: any): string;
    };
  };
}

declare module 'xlsx' {
  export const utils: {
    json_to_sheet<T extends object>(data: T[]): any;
    book_new(): any;
    book_append_sheet(workbook: any, worksheet: any, name?: string): void;
  };
  export function write(workbook: any, options?: any): any;
}

declare module 'i18next' {
  const i18next: any;
  export default i18next;
  export function init(options: any): any;
  export function use(plugin: any): any;
}

declare module 'react-i18next' {
  export function useTranslation(namespace?: string | string[]): {
    t: (key: string, options?: any) => string;
    i18n: any;
  };
  export const initReactI18next: any;
}

declare module 'i18next-http-backend' {
  const backend: any;
  export default backend;
}

declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    auth: {
      getSession(): Promise<{ data: { session: any }; error: any }>;
      getUser(): Promise<{ data: { user: any }; error: any }>;
      signOut(): Promise<{ error: any }>;
      onAuthStateChange(callback: (event: string, session: any) => void): { data: { subscription: { unsubscribe: () => void } } };
    };
    from(table: string): any;
    functions: {
      invoke(name: string, options?: any): Promise<{ data: any; error: any }>;
    };
  }

  export function createClient(url: string, key: string, options?: any): SupabaseClient;
}

// Make global test types available
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any[]> {
      mockReturnValue(value: T): this;
      mockReturnValueOnce(value: T): this;
      mockImplementation(fn: (...args: Y) => T): this;
      mockImplementationOnce(fn: (...args: Y) => T): this;
      mockResolvedValue(value: T): this;
      mockResolvedValueOnce(value: T): this;
      mockRejectedValue(value: any): this;
      mockRejectedValueOnce(value: any): this;
    }
  }

  function jest(options?: any): any;
  namespace jest {
    function fn<T = any>(): Mock<T>;
    function mock(path: string, factory?: () => any): any;
    function requireActual<T = any>(module: string): T;
  }

  function describe(name: string, fn: () => void): void;
  function beforeEach(fn: () => void): void;
  function afterEach(fn: () => void): void;
  function it(name: string, fn: () => void, timeout?: number): void;
  function expect<T>(value: T): any;
}
