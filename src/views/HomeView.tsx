import React, { useState } from 'react';
import { Course } from '../types/course';

interface HomeViewProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
  onSelectCourse: (courseId: string) => void;
  onNavigateToLogin: () => void;
}

// Función auxiliar para clasificar los cursos por categorías de forma dinámica (si no está definida en la base de datos)
const obtenerCategoriaCurso = (c: Course): string => {
  if (c.category) return c.category;
  const titleL = c.title.toLowerCase();
  if (titleL.includes('química') || titleL.includes('quimica')) return 'Química';
  if (titleL.includes('biología') || titleL.includes('biologia')) return 'Biología';
  if (
    titleL.includes('matemát') ||
    titleL.includes('matemat') ||
    titleL.includes('cálculo') ||
    titleL.includes('calculo') ||
    titleL.includes('algebra') ||
    titleL.includes('álgebra')
  ) {
    return 'Matemáticas';
  }
  if (
    titleL.includes('progra') ||
    titleL.includes('android') ||
    titleL.includes('electron') ||
    titleL.includes('javascript') ||
    titleL.includes('python') ||
    titleL.includes('html') ||
    titleL.includes('css')
  ) {
    return 'Programación';
  }
  return 'Otros';
};

export const HomeView: React.FC<HomeViewProps> = ({
  courses,
  loading,
  error,
  onSelectCourse,
  onNavigateToLogin,
}) => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todos');

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

  // Filtrado de cursos dinámico por Categoría y Palabra Clave (Título del curso, Descripción del curso o Clases)
  const queryL = busqueda.trim().toLowerCase();
  const cursosFiltrados = courses.filter((course) => {
    // 1. Filtro por categoría
    const categoriaCurso = obtenerCategoriaCurso(course);
    const matchesCategory = categoriaSeleccionada === 'Todos' || categoriaCurso === categoriaSeleccionada;
    if (!matchesCategory) return false;

    // 2. Filtro por búsqueda de texto
    if (queryL === '') return true;

    const matchesCourseTitle = course.title.toLowerCase().includes(queryL);
    const matchesCourseDesc = course.description.toLowerCase().includes(queryL);
    const matchesLessons = course.lessons && course.lessons.some(
      (l) => l.title.toLowerCase().includes(queryL) || l.description.toLowerCase().includes(queryL)
    );

    return matchesCourseTitle || matchesCourseDesc || matchesLessons;
  });

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

      {/* Barra de Búsqueda y Filtros de Categorías */}
      {!error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          margin: '2.5rem 0',
          background: 'rgba(11, 17, 32, 0.45)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Campo de Búsqueda con Icono */}
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{
              position: 'absolute',
              left: '1.2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por curso, tema o palabras en clases (ej: REDOX, Boyle, Android, Bisección)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem 0.9rem 3.2rem',
                backgroundColor: 'rgba(3, 7, 18, 0.45)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                style={{
                  position: 'absolute',
                  right: '1.2rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Selector de Categorías (Pills) */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginRight: '0.5rem', fontWeight: 600 }}>Filtrar por:</span>
            {['Todos', 'Química', 'Biología', 'Matemáticas', 'Programación', 'Otros'].map((cat) => {
              const active = categoriaSeleccionada === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaSeleccionada(cat)}
                  style={{
                    padding: '0.5rem 1.2rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: active ? 'var(--primary-accent)' : 'var(--border-color)',
                    backgroundColor: active ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: active ? '#c7d2fe' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    }
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid de Cursos */}
      <div className="courses-grid">
        {cursosFiltrados.map((course) => {
          const numLecciones = course.lessons ? course.lessons.length : 0;
          const categoria = obtenerCategoriaCurso(course);

          // Buscar cuántas lecciones individuales coinciden con la palabra de búsqueda
          let clasesCoincidentes = 0;
          if (queryL !== '' && course.lessons) {
            clasesCoincidentes = course.lessons.filter(
              (l) => l.title.toLowerCase().includes(queryL) || l.description.toLowerCase().includes(queryL)
            ).length;
          }

          // Estilo de etiqueta dinámico por categoría
          let tagStyle = {};
          if (categoria === 'Química') {
            tagStyle = { backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#a5f3fc', borderColor: 'rgba(6, 182, 212, 0.2)' };
          } else if (categoria === 'Matemáticas') {
            tagStyle = { backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#c7d2fe', borderColor: 'rgba(99, 102, 241, 0.2)' };
          } else if (categoria === 'Programación') {
            tagStyle = { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#a7f3d0', borderColor: 'rgba(16, 185, 129, 0.2)' };
          } else {
            tagStyle = { backgroundColor: 'rgba(156, 163, 175, 0.1)', color: '#f3f4f6', borderColor: 'rgba(156, 163, 175, 0.2)' };
          }

          return (
            <div
              key={course.id}
              className="course-card"
              onClick={() => onSelectCourse(course.id)}
              id={`course-card-${course.id}`}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="course-card-tag" style={{ ...tagStyle, marginBottom: 0 }}>
                    {categoria}
                  </div>
                  {clasesCoincidentes > 0 && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--secondary-accent)',
                      fontWeight: 700,
                      backgroundColor: 'rgba(6, 182, 212, 0.08)',
                      border: '1px solid rgba(6, 182, 212, 0.15)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      🔍 {clasesCoincidentes} {clasesCoincidentes === 1 ? 'lección coincide' : 'lecciones coinciden'}
                    </span>
                  )}
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

        {cursosFiltrados.length === 0 && !error && (
          <div className="alert alert-warning" style={{ margin: '2rem 0', width: '100%', gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.8rem' }} id="no-results-home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div>
              No se encontraron cursos o temas que coincidan con la búsqueda <strong>"{busqueda}"</strong> en la categoría <strong>"{categoriaSeleccionada}"</strong>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
