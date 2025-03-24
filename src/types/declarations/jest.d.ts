
/// <reference types="jest" />

// Explicitly augment the global scope with Jest types
declare global {
  // Re-export Jest namespace to make it available globally
  namespace jest {
    // Add commonly used Jest matchers and utilities
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
      mockReturnThis: () => this;
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

    interface JestMatchers<T> {
      not: JestMatchers<T>;
      toEqual(expected: any): void;
      toStrictEqual(expected: any): void;
      toBe(expected: any): void;
      toBeDefined(): void;
      toBeUndefined(): void;
      toBeNull(): void;
      toBeNaN(): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toBeGreaterThan(expected: number | bigint): void;
      toBeGreaterThanOrEqual(expected: number | bigint): void;
      toBeLessThan(expected: number | bigint): void;
      toBeLessThanOrEqual(expected: number | bigint): void;
      toContain(expected: any): void;
      toContainEqual(expected: any): void;
      toHaveLength(expected: number): void;
      toHaveProperty(property: string, value?: any): void;
      toMatch(expected: string | RegExp): void;
      toMatchObject(expected: object): void;
      toMatchSnapshot(hint?: string): void;
      toThrow(expected?: any): void;
      toThrowError(expected?: any): void;
      toBeCalled(): void;
      toBeCalledWith(...args: any[]): void;
      toHaveBeenCalled(): void;
      toHaveBeenCalledWith(...args: any[]): void;
      toBeCalledTimes(times: number): void;
      toBeInstanceOf(expected: any): void;
      resolves: JestMatchers<Promise<T>>;
      rejects: JestMatchers<Promise<T>>;
    }

    interface Matchers<R> extends JestMatchers<R> {}
    
    function expect<T = any>(actual: T): JestMatchers<T>;
    
    namespace expect {
      function objectContaining<T extends object>(expected: Partial<T>): T;
      function any(constructor: any): any;
    }
  }
  
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
  const expect: typeof jest.expect;
  
  // Jest object
  const jest: typeof jest;
}

// Make the module a proper module
export {};
