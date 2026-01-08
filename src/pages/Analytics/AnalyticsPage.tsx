import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { supabase, isSupabaseEnabled } from '../../services/supabase/client';

const AnalyticsPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Usuario');
  const [isCloudMode, setIsCloudMode] = useState(false);
  
  const { 
    analytics, 
    weeklyData, 
    loading, 
    error, 
    timeRange, 
    setTimeRange,
    refreshAnalytics 
  } = useAnalytics(userId);

  const [selectedMetric, setSelectedMetric] = useState<'pages' | 'habits' | 'hours'>('pages');

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      try {
        if (isSupabaseEnabled()) {
          const { data: { user } } = await supabase!.auth.getUser();
          if (user) {
            setUserId(user.id);
            setIsCloudMode(true);
            
            // Obtener nombre del perfil
            const { data: profile } = await supabase!
              .from('user_profiles')
              .select('codename')
              .eq('id', user.id)
              .single();
            
            if (profile?.codename) {
              setUserName(profile.codename);
            } else {
              setUserName(user.email?.split('@')[0] || 'Usuario');
            }
          } else {
            // Modo local
            setUserId('local-user');
            setIsCloudMode(false);
            const localState = JSON.parse(localStorage.getItem('renacer_state_v4') || '{}');
            setUserName(localState.user?.codename || 'Usuario Local');
          }
        } else {
          // Modo solo localStorage
          setUserId('local-user');
          setIsCloudMode(false);
          const localState = JSON.parse(localStorage.getItem('renacer_state_v4') || '{}');
          setUserName(localState.user?.codename || 'Usuario');
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setUserId('local-user');
        setIsCloudMode(false);
        setUserName('Usuario');
      }
    };

    getUser();
  }, []);

  // Renderizar mientras carga
  if (loading) {
    return (
      <main className="main-content p-6">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <span className="text-lg">Cargando analíticas...</span>
          <p className="text-tertiary text-sm mt-2">
            {isCloudMode ? 'Obteniendo datos de la nube...' : 'Cargando datos locales...'}
          </p>
        </div>
      </main>
    );
  }

  // Renderizar error
  if (error || !analytics) {
    return (
      <main className="main-content p-6">
        <div className="card bg-danger/10 border-danger/20 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-danger/20 text-danger">
              <i className="fas fa-exclamation-triangle text-xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Error al cargar datos</h3>
              <p className="text-tertiary mb-4">{error || 'No se pudieron cargar las analíticas'}</p>
              <div className="flex gap-3">
                <button 
                  onClick={refreshAnalytics}
                  className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/80 transition-colors"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Reintentar
                </button>
                <button 
                  onClick={() => {
                    setUserId('local-user');
                    refreshAnalytics();
                  }}
                  className="px-4 py-2 bg-surface hover:bg-surface/80 rounded-lg transition-colors"
                >
                  Usar datos locales
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Calcular estadísticas
  const stats = [
    { 
      label: 'Páginas Totales', 
      value: analytics.reading.totalPages.toLocaleString(), 
      icon: '📖', 
      color: 'primary',
      change: analytics.reading.avgPagesPerDay > 0 ? `+${analytics.reading.avgPagesPerDay}/día` : 'Sin datos',
      trend: analytics.reading.avgPagesPerDay > 10 ? 'up' : 'stable' as const
    },
    { 
      label: 'Horas de Estudio', 
      value: `${analytics.productivity.totalStudyHours.toFixed(1)}h`, 
      icon: '⏱️', 
      color: 'secondary',
      change: `${analytics.productivity.focusTime.toFixed(1)} h/día`,
      trend: analytics.productivity.focusTime > 2 ? 'up' : 'stable' as const
    },
    { 
      label: 'Racha Actual', 
      value: `${analytics.reading.currentStreak} días`, 
      icon: '🔥', 
      color: 'accent',
      change: `Máx: ${analytics.reading.maxStreak} días`,
      trend: analytics.reading.currentStreak > 7 ? 'up' : 'down' as const
    },
    { 
      label: 'Productividad', 
      value: `${analytics.productivity.score}/100`, 
      icon: '⚡', 
      color: 'success',
      change: `${analytics.productivity.efficiency.toFixed(1)} pág/hora`,
      trend: analytics.productivity.score > 70 ? 'up' : 'down' as const
    }
  ];

  const maxValue = Math.max(...weeklyData.map(d => d[selectedMetric]), 1);

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗︎';
    if (trend === 'down') return '↘︎';
    return '→';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-danger';
    return 'text-warning';
  };

  return (
    <main className="main-content p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <i className="fas fa-chart-line text-2xl"></i>
            </div>
            <div>
              <div className="text-sm text-tertiary flex items-center gap-2">
                <span>Analíticas Avanzadas</span>
                <span className={`text-xs px-2 py-1 rounded-full ${isCloudMode ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                  {isCloudMode ? '☁️ Cloud' : '💾 Local'}
                </span>
              </div>
              <h1 className="text-3xl font-bold mt-1">
                Hola, <span className="text-primary">{userName}</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-tertiary">Modo</div>
              <div className="font-semibold">
                {isCloudMode ? 'Conectado a la nube' : 'Modo offline'}
              </div>
            </div>
          </div>
        </div>

        <p className="text-tertiary text-lg max-w-3xl">
          {isCloudMode 
            ? 'Tus métricas en tiempo real desde la nube • Datos actualizados automáticamente'
            : 'Modo offline • Trabajando con datos locales'}
          <span className="block text-sm mt-2">
            Período: <strong>
              {timeRange === 'week' ? 'Última semana' : 
               timeRange === 'month' ? 'Último mes' : 
               timeRange === 'year' ? 'Este año' : 'Todos los tiempos'}
            </strong>
          </span>
        </p>
      </header>

      {/* Selector de rango temporal */}
      <div className="flex flex-wrap gap-3 mb-8">
        {(['week', 'month', 'year', 'all'] as const).map((range) => (
          <button
            key={range}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              timeRange === range 
                ? 'bg-primary text-white shadow-lg' 
                : 'bg-surface hover:bg-surface/80'
            }`}
            onClick={() => setTimeRange(range)}
          >
            {range === 'week' && '📅 Última semana'}
            {range === 'month' && '📊 Último mes'}
            {range === 'year' && '📈 Este año'}
            {range === 'all' && '🌟 Todos'}
          </button>
        ))}
        <button
          onClick={refreshAnalytics}
          className="px-4 py-3 rounded-xl bg-success text-white font-medium hover:bg-success/80 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Cargando...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt"></i>
              Actualizar
            </>
          )}
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="card hover:scale-[1.02] transition-all duration-300 shadow-lg border border-surface"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                stat.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                stat.color === 'accent' ? 'bg-accent/10 text-accent' :
                'bg-success/10 text-success'
              }`}>
                <div className="text-2xl">{stat.icon}</div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${getTrendColor(stat.trend)}/20 ${getTrendColor(stat.trend)}`}>
                {getTrendIcon(stat.trend)} {stat.change}
              </div>
            </div>
            
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-foreground">{stat.label}</div>
            <div className="text-xs text-tertiary mt-2">
              {stat.trend === 'up' && 'Tendencia positiva'}
              {stat.trend === 'down' && 'Necesita mejorar'}
              {stat.trend === 'stable' && 'Manteniéndose'}
            </div>
          </div>
        ))}
      </div>

      {/* Score de productividad destacado */}
      <div className="card mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-2 border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <div className="text-sm text-tertiary mb-2">SCORE DE PRODUCTIVIDAD GLOBAL</div>
            <div className="text-6xl font-bold text-primary mb-2">
              {analytics.productivity.score}
              <span className="text-2xl text-tertiary ml-2">/100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg ${getTrendColor(
                analytics.productivity.score > 70 ? 'up' : 
                analytics.productivity.score < 50 ? 'down' : 'stable'
              )}`}>
                {getTrendIcon(
                  analytics.productivity.score > 70 ? 'up' : 
                  analytics.productivity.score < 50 ? 'down' : 'stable'
                )}
              </span>
              <span className="text-sm text-secondary">
                {analytics.productivity.score > 80 ? '¡Excelente rendimiento! 🏆' :
                 analytics.productivity.score > 60 ? 'Buen progreso, sigue así 💪' :
                 analytics.productivity.score > 40 ? 'En el camino correcto 📈' :
                 'Es un buen comienzo 🌱'}
              </span>
            </div>
          </div>
          <div className="text-8xl opacity-20">🏆</div>
        </div>
      </div>

      {/* Gráfico semanal interactivo */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-semibold">Progreso Semanal</h3>
            <p className="text-tertiary text-sm">Últimos 7 días • Datos {isCloudMode ? 'en tiempo real' : 'locales'}</p>
          </div>
          <div className="flex gap-2">
            {(['pages', 'habits', 'hours'] as const).map((metric) => (
              <button
                key={metric}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedMetric === metric
                    ? metric === 'pages' ? 'bg-primary text-white shadow-lg' :
                      metric === 'habits' ? 'bg-secondary text-white shadow-lg' :
                      'bg-accent text-white shadow-lg'
                    : 'bg-surface hover:bg-surface/80'
                }`}
                onClick={() => setSelectedMetric(metric)}
              >
                {metric === 'pages' && '📖 Páginas'}
                {metric === 'habits' && '✅ Hábitos'}
                {metric === 'hours' && '⏱️ Horas'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64">
          <div className="flex items-end h-48 gap-2">
            {weeklyData.map((day, index) => {
              const value = day[selectedMetric];
              const percentage = (value / maxValue) * 100;
              const barColor = selectedMetric === 'pages' ? 'bg-primary' :
                              selectedMetric === 'habits' ? 'bg-secondary' : 'bg-accent';
              const hoverColor = selectedMetric === 'pages' ? 'hover:bg-primary/90' :
                                selectedMetric === 'habits' ? 'hover:bg-secondary/90' : 'hover:bg-accent/90';
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-tertiary mb-2 text-center">
                    <div className="font-medium">{day.day}</div>
                    <div className="text-xs opacity-75">{day.date.split('-')[2]}</div>
                  </div>
                  <div className="relative w-3/4 group">
                    <div 
                      className={`w-full rounded-t-lg ${barColor} ${hoverColor} transition-all duration-500 cursor-pointer`}
                      style={{ height: `${percentage}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-3 py-2 rounded-lg text-sm font-semibold shadow-lg z-10">
                        {value.toFixed(1)}
                        <span className="text-xs font-normal ml-1">
                          {selectedMetric === 'pages' ? 'págs' : 
                           selectedMetric === 'habits' ? 'háb' : 'hrs'}
                        </span>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-foreground rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Eje X */}
          <div className="flex justify-between mt-4 text-xs text-tertiary">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex-1 text-center">
                {day.date.split('-').slice(1).join('/')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hábitos */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-secondary">📊</span>
            Hábitos
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-tertiary">Tasa de completado</div>
                <div className="text-xs text-tertiary">Porcentaje de hábitos completados</div>
              </div>
              <div className="text-3xl font-bold text-secondary">
                {analytics.habits.completionRate}%
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface/50 rounded-xl p-4">
                <div className="text-sm text-tertiary mb-1">Consistencia</div>
                <div className="text-2xl font-bold">{analytics.habits.consistency}%</div>
              </div>
              <div className="bg-surface/50 rounded-xl p-4">
                <div className="text-sm text-tertiary mb-1">Racha actual</div>
                <div className="text-2xl font-bold text-accent">{analytics.habits.streak} días</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-tertiary mb-1">Mejor hábito</div>
                <div className="font-semibold text-success">{analytics.habits.bestHabit}</div>
              </div>
              <div>
                <div className="text-tertiary mb-1">A mejorar</div>
                <div className="font-semibold text-danger">{analytics.habits.worstHabit}</div>
              </div>
            </div>
            
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full transition-all duration-700"
                style={{ width: `${analytics.habits.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Productividad */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">⚡</span>
            Productividad
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-tertiary">Score total</div>
                <div className="text-xs text-tertiary">Basado en múltiples métricas</div>
              </div>
              <div className="text-3xl font-bold text-primary">
                {analytics.productivity.score}/100
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface/50 rounded-xl p-4">
                <div className="text-sm text-tertiary mb-1">Horas totales</div>
                <div className="text-2xl font-bold">{analytics.productivity.totalStudyHours}h</div>
              </div>
              <div className="bg-surface/50 rounded-xl p-4">
                <div className="text-sm text-tertiary mb-1">Eficiencia</div>
                <div className="text-2xl font-bold">{analytics.productivity.efficiency} pág/h</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-tertiary mb-2">Horario más productivo</div>
              <div className="text-lg font-semibold bg-primary/10 text-primary px-4 py-2 rounded-lg">
                {analytics.productivity.mostProductiveTime}
              </div>
            </div>
            
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${analytics.productivity.score}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Lectura */}
      <div className="card mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="text-accent">📚</span>
          Lectura
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface/50 rounded-xl p-4">
            <div className="text-sm text-tertiary mb-1">Páginas totales</div>
            <div className="text-2xl font-bold text-accent">{analytics.reading.totalPages.toLocaleString()}</div>
          </div>
          <div className="bg-surface/50 rounded-xl p-4">
            <div className="text-sm text-tertiary mb-1">Promedio diario</div>
            <div className="text-2xl font-bold">{analytics.reading.avgPagesPerDay} pág/día</div>
          </div>
          <div className="bg-surface/50 rounded-xl p-4">
            <div className="text-sm text-tertiary mb-1">Libros completados</div>
            <div className="text-2xl font-bold">{analytics.reading.totalBooks}</div>
          </div>
          <div className="bg-surface/50 rounded-xl p-4">
            <div className="text-sm text-tertiary mb-1">Velocidad</div>
            <div className="text-2xl font-bold">{analytics.reading.readingSpeed} pág/min</div>
          </div>
        </div>
        
        {/* Progreso de semanas */}
        <div>
          <div className="text-sm text-tertiary mb-3">Progreso por semana (últimas 4)</div>
          <div className="grid grid-cols-4 gap-3">
            {analytics.reading.pagesPerWeek.map((pages, index) => {
              const weekNames = ['Hace 3 sem', 'Hace 2 sem', 'Sem pasada', 'Esta sem'];
              const maxPages = Math.max(...analytics.reading.pagesPerWeek, 1);
              const percentage = (pages / maxPages) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-tertiary mb-2">{weekNames[index]}</div>
                  <div className="relative w-full h-32">
                    <div className="absolute bottom-0 left-0 right-0">
                      <div 
                        className="w-full bg-accent rounded-t-lg transition-all duration-700"
                        style={{ height: `${percentage}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold bg-foreground text-background px-2 py-1 rounded">
                          {pages}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Estado de conexión */}
      <div className={`p-4 rounded-xl ${
        isCloudMode 
          ? 'bg-success/10 border border-success/20' 
          : 'bg-warning/10 border border-warning/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isCloudMode 
                ? 'bg-success/20 text-success' 
                : 'bg-warning/20 text-warning'
            }`}>
              {isCloudMode 
                ? <i className="fas fa-cloud text-xl"></i>
                : <i className="fas fa-laptop text-xl"></i>}
            </div>
            <div>
              <div className="font-medium">
                {isCloudMode 
                  ? '✅ Datos sincronizados con la nube' 
                  : '💻 Modo offline - Datos locales'}
              </div>
              <div className="text-sm text-tertiary">
                Última actualización: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div className={`text-sm px-3 py-1 rounded-full ${
            isCloudMode 
              ? 'bg-success/20 text-success' 
              : 'bg-warning/20 text-warning'
          }`}>
            {isCloudMode 
              ? <><i className="fas fa-check-circle mr-1"></i> Online</>
              : <><i className="fas fa-laptop-house mr-1"></i> Local</>}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AnalyticsPage;