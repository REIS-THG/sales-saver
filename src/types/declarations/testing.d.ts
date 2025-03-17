
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
  export namespace fireEvent {
    export function click(element: HTMLElement, options?: {}): boolean;
    export function change(element: HTMLElement, options?: {}): boolean;
  }
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
