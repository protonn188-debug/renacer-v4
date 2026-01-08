import { supabase, isSupabaseEnabled } from './client';

export class AuthService {
  static async signUp(email: string, password: string, username: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase no está configurado');
    }

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    
    if (error) throw error;
    return data;
  }
  
  static async signIn(email: string, password: string) {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase no está configurado');
    }

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }
  
  static async signOut() {
    if (!isSupabaseEnabled()) return;
    
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  }
  
  static async getCurrentUser() {
    if (!isSupabaseEnabled()) return null;
    
    const { data: { user } } = await supabase!.auth.getUser();
    return user;
  }
}