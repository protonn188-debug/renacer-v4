import { useState, useEffect } from 'react';
import { supabase, isSupabaseEnabled } from '../services/supabase/client';
import { DataService } from '../services/dataService';

export interface User {
  id: string;
  email?: string;
  codename?: string;
  streak?: number;
  max_streak?: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Verificar sesión existente
    const checkSession = async () => {
      if (!isSupabaseEnabled()) {
        // Modo offline - usar datos locales
        const localState = JSON.parse(localStorage.getItem('renacer_state_v4') || '{}');
        if (localState.user) {
          setUser({
            id: 'local-user',
            codename: localState.user.codename,
            streak: localState.user.streak
          });
        }
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase!.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            codename: session.user.user_metadata?.username || 'User'
          });
          
          // Cargar estado inicial desde Supabase
          await DataService.loadUserState(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios en autenticación
    if (isSupabaseEnabled()) {
      const { data: { subscription } } = supabase!.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              codename: session.user.user_metadata?.username || 'User'
            });
            
            if (event === 'SIGNED_IN') {
              // Migrar datos locales a Supabase si es primera vez
              await migrateLocalToSupabase(session.user.id);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
          
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase no está configurado');
    }

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, username: string) => {
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
  };

  const signOut = async () => {
    if (!isSupabaseEnabled()) return;
    
    await supabase!.auth.signOut();
    setUser(null);
    // Volver a modo local
    setUser({
      id: 'local-user',
      codename: 'Local User',
      streak: 0
    });
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated
  };
};

// Función auxiliar para migrar datos locales
const migrateLocalToSupabase = async (userId: string) => {
  try {
    const hasMigrated = localStorage.getItem('has_migrated_to_supabase');
    if (!hasMigrated) {
      const localState = JSON.parse(localStorage.getItem('renacer_state_v4') || '{}');
      
      if (localState.user) {
        // Actualizar perfil
        await supabase!.from('user_profiles').update({
          codename: localState.user.codename,
          streak: localState.user.streak,
          daily_pages: localState.user.dailyPages
        }).eq('id', userId);
      }
      
      localStorage.setItem('has_migrated_to_supabase', 'true');
      console.log('✅ Datos migrados a Supabase');
    }
  } catch (error) {
    console.error('Error migrando datos:', error);
  }
};