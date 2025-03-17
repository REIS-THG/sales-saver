
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
