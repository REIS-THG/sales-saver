
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
    channel(name: string, options?: any): any;
  }

  export function createClient(url: string, key: string, options?: any): SupabaseClient;
}
