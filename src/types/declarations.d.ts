
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

  export function useReactTable<T extends object>(options: TableOptions<T>): any;
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
  export type Table<T extends object = {}> = {
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
  };
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
  export function closestCenter(args?: any): any;
  export interface DragEndEvent {
    active: { id: string | number };
    over: { id: string | number } | null;
  }
  export interface PointerSensor {
    new(options?: any): any;
  }
  export interface SensorDescriptor<T = any> {
    sensor: T;
    options?: any;
  }
}

declare module '@dnd-kit/sortable' {
  export function SortableContext(props: { items: any[]; strategy?: any } & React.PropsWithChildren<{}>): JSX.Element;
  export function useSortable(args: { id: string | number }): any;
  export function verticalListSortingStrategy(args?: any): any;
  export function horizontalListSortingStrategy(args?: any): any;
  export function rectSortingStrategy(args?: any): any;
  export function arrayMove<T>(array: T[], from: number, to: number): T[];
  export function sortableKeyboardCoordinates(args?: any): any;
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
    sheet_to_csv(worksheet: any): string;
  };
  export function write(workbook: any, options?: any): any;
  export function writeFile(workbook: any, filename: string, opts?: any): void;
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
      signInWithPassword(credentials: { email: string; password: string }): Promise<{ data: any; error: any }>;
      signUp(credentials: { email: string; password: string; options?: any }): Promise<{ data: any; error: any }>;
      updateUser(attributes: any): Promise<{ data: any; error: any }>;
      resetPasswordForEmail(email: string, options?: any): Promise<{ data: any; error: any }>;
    };
    from(table: string): any;
    functions: {
      invoke(name: string, options?: any): Promise<{ data: any; error: any }>;
    };
  }

  export function createClient(url: string, key: string, options?: any): SupabaseClient;
}

// Add testing library type declarations
declare module '@testing-library/react' {
  export function render(
    ui: React.ReactElement, 
    options?: any
  ): {
    container: HTMLElement;
    baseElement: HTMLElement;
    debug: (baseElement?: HTMLElement | HTMLElement[]) => void;
    rerender: (ui: React.ReactElement) => void;
    unmount: () => boolean;
    asFragment: () => DocumentFragment;
    findByText: (text: string | RegExp) => Promise<HTMLElement>;
    findAllByText: (text: string | RegExp) => Promise<HTMLElement[]>;
    queryByText: (text: string | RegExp) => HTMLElement | null;
    queryAllByText: (text: string | RegExp) => HTMLElement[];
    getByText: (text: string | RegExp) => HTMLElement;
    getAllByText: (text: string | RegExp) => HTMLElement[];
    findByRole: (role: string, options?: any) => Promise<HTMLElement>;
    findAllByRole: (role: string, options?: any) => Promise<HTMLElement[]>;
    queryByRole: (role: string, options?: any) => HTMLElement | null;
    queryAllByRole: (role: string, options?: any) => HTMLElement[];
    getByRole: (role: string, options?: any) => HTMLElement;
    getAllByRole: (role: string, options?: any) => HTMLElement[];
    findByLabelText: (label: string | RegExp) => Promise<HTMLElement>;
    findAllByLabelText: (label: string | RegExp) => Promise<HTMLElement[]>;
    queryByLabelText: (label: string | RegExp) => HTMLElement | null;
    queryAllByLabelText: (label: string | RegExp) => HTMLElement[];
    getByLabelText: (label: string | RegExp) => HTMLElement;
    getAllByLabelText: (label: string | RegExp) => HTMLElement[];
    findByPlaceholderText: (placeholder: string | RegExp) => Promise<HTMLElement>;
    findAllByPlaceholderText: (placeholder: string | RegExp) => Promise<HTMLElement[]>;
    queryByPlaceholderText: (placeholder: string | RegExp) => HTMLElement | null;
    queryAllByPlaceholderText: (placeholder: string | RegExp) => HTMLElement[];
    getByPlaceholderText: (placeholder: string | RegExp) => HTMLElement;
    getAllByPlaceholderText: (placeholder: string | RegExp) => HTMLElement[];
    findByTestId: (testId: string | RegExp) => Promise<HTMLElement>;
    findAllByTestId: (testId: string | RegExp) => Promise<HTMLElement[]>;
    queryByTestId: (testId: string | RegExp) => HTMLElement | null;
    queryAllByTestId: (testId: string | RegExp) => HTMLElement[];
    getByTestId: (testId: string | RegExp) => HTMLElement;
    getAllByTestId: (testId: string | RegExp) => HTMLElement[];
  };
  export function screen(): any;
  export function fireEvent(element: HTMLElement, event: Event): boolean;
  fireEvent.click = function(element: HTMLElement, options?: {}): boolean;
  fireEvent.change = function(element: HTMLElement, options?: {}): boolean;
}

declare module '@testing-library/react-hooks' {
  export function renderHook<TProps, TResult>(
    callback: (props: TProps) => TResult,
    options?: {
      initialProps?: TProps;
      wrapper?: React.ComponentType<any>;
    }
  ): {
    result: {
      current: TResult;
      error?: Error;
    };
    rerender: (props?: TProps) => void;
    unmount: () => void;
    waitFor: (callback: () => boolean | void, options?: {
      interval?: number;
      timeout?: number;
    }) => Promise<void>;
    waitForNextUpdate: (options?: {
      timeout?: number;
    }) => Promise<void>;
    waitForValueToChange: (selector: () => any, options?: {
      timeout?: number;
    }) => Promise<void>;
  };
  
  export function act(callback: () => void | Promise<void>): Promise<void> | void;
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
