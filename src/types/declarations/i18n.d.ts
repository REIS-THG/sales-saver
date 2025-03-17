
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
