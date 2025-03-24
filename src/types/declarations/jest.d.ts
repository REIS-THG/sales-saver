
/// <reference types="jest" />

// Explicitly augment the global scope with Jest types
declare global {
  // Re-export Jest namespace to make it available globally
  const jest: typeof import('jest');
  
  // Test functions
  function describe(name: string, fn: () => void): void;
  function describe(name: string, options: {timeout?: number}, fn: () => void): void;
  function fdescribe(name: string, fn: () => void): void;
  function xdescribe(name: string, fn: () => void): void;
  
  function beforeAll(fn: () => void | Promise<void>, timeout?: number): void;
  function beforeEach(fn: () => void | Promise<void>, timeout?: number): void;
  function afterAll(fn: () => void | Promise<void>, timeout?: number): void;
  function afterEach(fn: () => void | Promise<void>, timeout?: number): void;
  
  function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;
  function it(name: string, options: {timeout?: number}, fn: () => void | Promise<void>): void;
  function fit(name: string, fn: () => void | Promise<void>, timeout?: number): void;
  function xit(name: string, fn: () => void | Promise<void>, timeout?: number): void;
  
  function test(name: string, fn: () => void | Promise<void>, timeout?: number): void;
  function test(name: string, options: {timeout?: number}, fn: () => void | Promise<void>): void;
  
  // Matchers
  function expect<T = any>(actual: T): jest.Matchers<T>;
  
  namespace jest {
    // Re-export Jest namespace members
    function fn<T = any>(): jest.Mock<T>;
    function spyOn<T, K extends keyof T>(object: T, method: K): jest.SpyInstance;
    function mock(moduleName: string, factory?: () => unknown): typeof jest;
    function clearAllMocks(): typeof jest;
    function resetAllMocks(): typeof jest;
    function restoreAllMocks(): typeof jest;
    function useRealTimers(): typeof jest;
    function useFakeTimers(implementation?: 'legacy' | 'modern'): typeof jest;
    function resetModules(): typeof jest;
    function requireActual<T = any>(moduleName: string): T;
    function requireMock<T = any>(moduleName: string): T;

    interface Mock<T = any, Y extends any[] = any[]> {
      (...args: Y): T;
      mockReturnValue: (value: T) => this;
      mockReturnValueOnce: (value: T) => this;
      mockImplementation: (fn: (...args: Y) => T) => this;
      mockImplementationOnce: (fn: (...args: Y) => T) => this;
      mockResolvedValue: (value: T) => this;
      mockResolvedValueOnce: (value: T) => this;
      mockRejectedValue: (value: any) => this;
      mockRejectedValueOnce: (value: any) => this;
      mockClear: () => this;
      mockReset: () => this;
      mockRestore: () => this;
      getMockName: () => string;
      mockName: (name: string) => this;
      mock: {
        calls: Y[];
        instances: T[];
        results: Array<{ type: 'return' | 'throw'; value: any }>;
        lastCall: Y;
      };
    }
    
    interface SpyInstance<T = any, Y extends any[] = any[]> extends Mock<T, Y> {
      mockRestore(): void;
    }
    
    interface Matchers<R> {
      toEqual(expected: any): R;
      toStrictEqual(expected: any): R;
      toBe(expected: any): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeNaN(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeGreaterThan(expected: number | bigint): R;
      toBeGreaterThanOrEqual(expected: number | bigint): R;
      toBeLessThan(expected: number | bigint): R;
      toBeLessThanOrEqual(expected: number | bigint): R;
      toContain(expected: any): R;
      toContainEqual(expected: any): R;
      toHaveLength(expected: number): R;
      toHaveProperty(property: string, value?: any): R;
      toMatch(expected: string | RegExp): R;
      toMatchObject(expected: object): R;
      toMatchSnapshot(hint?: string): R;
      toThrow(expected?: any): R;
      toThrowError(expected?: any): R;
      toBeCalled(): R;
      toBeCalledWith(...args: any[]): R;
      toBeCalledTimes(times: number): R;
      toBeInstanceOf(expected: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(times: number): R;
      toHaveBeenLastCalledWith(...args: any[]): R;
      not: Matchers<R>;
      resolves: Matchers<Promise<R>>;
      rejects: Matchers<Promise<R>>;
    }
  }
}

// Make the module a proper module
export {};
