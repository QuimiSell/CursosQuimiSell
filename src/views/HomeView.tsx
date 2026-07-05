import React from 'react';
import { Course } from '../types/course';

interface HomeViewProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
  onSelectCourse: (courseId: string) => void;
  onNavigateToLogin: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  courses,
  loading,
  error,
  onSelectCourse,
  onNavigateToLogin,
}) => {
  if (loading) {
    return (
      <div className="loading-container" id="loading-home">
        <div className="spinner"></div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Conectando con QuimiSell Cloud...</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cargando catálogo educativo y recursos multimedia.</p>
      </div>
    );
  }

  // Cálculos estadísticos para mostrar en la interfaz
  const totalCursos = courses.length;
  const totalLecciones = courses.reduce((acc, c) => acc + (c.lessons ? c.lessons.length : 0), 0);

  return (
    <div className="home-view-container">
      {/* Sección Hero con Estilo Moderno */}
      <div className="home-section-header">
        <div className="home-section-info">
          <h1>Plataforma de Aprendizaje</h1>
          <p>
            Domina Métodos Numéricos, Estequiometría y Ciencias con clases en video estructuradas de QuimiSell.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onNavigateToLogin} id="btn-goto-login">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Área de Administración
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" id="error-home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <strong>Error de conexión:</strong> {error}
            <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'rgba(239, 68, 68, 0.9)' }}>
              Verifica las credenciales de GitHub del administrador y asegúrate de que el archivo JSON exista en la rama configurada.
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de Estadísticas del Dashboard */}
      {!error && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalCursos}</span>
              <span className="stat-label">Cursos Activos</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--secondary-accent)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalLecciones}</span>
              <span className="stat-label">Lecciones en Video</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Acceso Flexible</span>
            </div>
          </div>
        </div>
      )}

      {!error && courses.length === 0 && (
        <div className="alert alert-warning" id="empty-home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          No hay cursos cargados en la base de datos de GitHub. Si eres administrador, inicia sesión para añadir contenido.
        </div>
      )}

      {/* Grid de Cursos */}
      <div className="courses-grid">
        {courses.map((course) => {
          const numLecciones = course.lessons ? course.lessons.length : 0;
          // Asigna un tag temático según el título
          const esQuimica = course.title.toLowerCase().includes('química') || course.title.toLowerCase().includes('quimica');
          const tagTexto = esQuimica ? 'Química' : 'Matemáticas / Métodos';

          return (
            <div
              key={course.id}
              className="course-card"
              onClick={() => onSelectCourse(course.id)}
              id={`course-card-${course.id}`}
            >
              <div>
                <div className="course-card-tag" style={esQuimica ? { backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#a5f3fc', borderColor: 'rgba(6, 182, 212, 0.2)' } : {}}>
                  {tagTexto}
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
              </div>
              
              <div className="course-card-footer">
                <div className="lessons-indicator">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                  <span>
                    {numLecciones} {numLecciones === 1 ? 'Clase en video' : 'Clases en video'}
                  </span>
                </div>
                
                <span className="course-action-trigger">
                  Comenzar 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
