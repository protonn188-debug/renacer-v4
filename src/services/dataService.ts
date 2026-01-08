import { supabase, isSupabaseEnabled } from './supabase/client';
import { RenacerStateType } from '../types';
import { loadState as loadLocalState, saveState as saveLocalState } from '../state/persistence';

export class DataService {
  // ============================================
  // SINCRONIZACIÓN DE ESTADO
  // ============================================
  static async loadUserState(userId: string): Promise<RenacerStateType | null> {
    // Si Supabase no está habilitado, usar localStorage
    if (!isSupabaseEnabled()) {
      console.log('📦 Usando localStorage (Supabase no configurado)');
      return loadLocalState();
    }

    try {
      // Cargar datos del usuario desde Supabase
      const [profile, books, habits, privacy, schedules, readingPlan] = await Promise.all([
        supabase!.from('user_profiles').select('*').eq('id', userId).single(),
        supabase!.from('books').select('*').eq('user_id', userId).eq('status', 'reading').single(),
        supabase!.from('habits').select('*').eq('user_id', userId).order('order_index'),
        supabase!.from('privacy_tasks').select('*').eq('user_id', userId).order('order_index'),
        supabase!.from('schedules').select('*').eq('user_id', userId).order('order_index'),
        supabase!.from('reading_plan').select('*').eq('user_id', userId).order('order_index')
      ]);

      if (!profile.data) return null;

      // Construir estado desde Supabase
      const state: RenacerStateType = {
        version: '4.0',
        user: {
          codename: profile.data.codename || 'Hol',
          goal: profile.data.goal || 'Primer Puesto 2026',
          level: profile.data.level || 'EXPERT',
          workMode: profile.data.work_mode,
          streak: profile.data.streak,
          dailyPages: profile.data.daily_pages
        },
        reading: {
          currentBook: books.data ? {
            title: books.data.title,
            author: books.data.author,
            totalPages: books.data.total_pages,
            currentPage: books.data.current_page,
            progress: books.data.progress,
            category: books.data.category,
            quote: books.data.quote || ''
          } : loadLocalState()?.reading.currentBook || {} as any,
          plan: readingPlan.data?.map(p => ({
            period: p.period,
            category: p.category,
            books: p.total_books,
            completed: p.completed_books
          })) || []
        },
        habits: habits.data?.map(h => ({
          id: parseInt(h.id),
          name: h.name,
          icon: h.icon,
          frequency: h.frequency,
          completed: h.completed
        })) || [],
        privacy: privacy.data?.map(p => ({
          id: parseInt(p.id),
          task: p.task,
          priority: p.priority,
          enabled: p.enabled
        })) || [],
        schedule: {
          workMode: schedules.data?.filter(s => s.mode === 'work').map(s => ({
            time: s.time,
            activity: s.activity,
            category: s.category,
            description: s.description
          })) || [],
          studyMode: schedules.data?.filter(s => s.mode === 'study').map(s => ({
            time: s.time,
            activity: s.activity,
            category: s.category,
            description: s.description
          })) || []
        }
      };

      return state;
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      return loadLocalState();
    }
  }

  static async saveUserState(userId: string, state: RenacerStateType): Promise<void> {
    // Siempre guardar en localStorage
    saveLocalState(state);

    // Si Supabase está habilitado, sincronizar
    if (!isSupabaseEnabled()) return;

    try {
      // Actualizar perfil
      await supabase!.from('user_profiles').update({
        work_mode: state.user.workMode,
        streak: state.user.streak,
        daily_pages: state.user.dailyPages
      }).eq('id', userId);

      // Actualizar libro actual
      if (state.reading.currentBook) {
        await supabase!.from('books').update({
          current_page: state.reading.currentBook.currentPage,
          progress: state.reading.currentBook.progress
        }).eq('user_id', userId).eq('status', 'reading');
      }

      // Actualizar hábitos
      for (const habit of state.habits) {
        await supabase!.from('habits').update({
          completed: habit.completed
        }).eq('user_id', userId).eq('id', habit.id);
      }

      // Actualizar tareas de privacidad
      for (const task of state.privacy) {
        await supabase!.from('privacy_tasks').update({
          enabled: task.enabled
        }).eq('user_id', userId).eq('id', task.id);
      }

      console.log('✅ Estado sincronizado con Supabase');
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
    }
  }

  // ============================================
  // OPERACIONES DE LECTURA
  // ============================================
  static async updateReadingProgress(userId: string, pages: number): Promise<void> {
    if (!isSupabaseEnabled()) return;

    try {
      // Obtener libro actual
      const { data: book } = await supabase!
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'reading')
        .single();

      if (!book) return;

      const newPage = Math.min(book.current_page + pages, book.total_pages);
      const progress = (newPage / book.total_pages) * 100;

      // Actualizar libro
      await supabase!.from('books').update({
        current_page: newPage,
        progress: progress
      }).eq('id', book.id);

      // Si se completa, cambiar estado
      if (newPage >= book.total_pages) {
        await supabase!.from('books').update({
          status: 'completed'
        }).eq('id', book.id);
      }

      // Registrar progreso diario
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase!
        .from('daily_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (existing) {
        await supabase!.from('daily_progress').update({
          pages_read: existing.pages_read + pages
        }).eq('id', existing.id);
      } else {
        await supabase!.from('daily_progress').insert([{
          user_id: userId,
          date: today,
          pages_read: pages
        }]);
      }
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  }

  // ============================================
  // OPERACIONES DE HÁBITOS
  // ============================================
  static async toggleHabit(userId: string, habitId: number, completed: boolean): Promise<void> {
    if (!isSupabaseEnabled()) return;

    try {
      await supabase!.from('habits').update({
        completed
      }).eq('user_id', userId).eq('id', habitId);

      // Registrar en tracking
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase!
        .from('habit_tracking')
        .select('*')
        .eq('habit_id', habitId)
        .eq('date', today)
        .single();

      if (existing) {
        await supabase!.from('habit_tracking').update({
          completed
        }).eq('id', existing.id);
      } else {
        await supabase!.from('habit_tracking').insert([{
          habit_id: habitId,
          user_id: userId,
          date: today,
          completed
        }]);
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  }

  // ============================================
  // RESET DIARIO
  // ============================================
  static async resetDailyCounters(userId: string): Promise<void> {
    if (!isSupabaseEnabled()) return;

    try {
      // Resetear daily_pages
      await supabase!.from('user_profiles').update({
        daily_pages: 0
      }).eq('id', userId);

      // Resetear hábitos
      await supabase!.from('habits').update({
        completed: false
      }).eq('user_id', userId);

      console.log('🌅 Contadores diarios reseteados');
    } catch (error) {
      console.error('Error resetting daily counters:', error);
    }
  }
}