import React, { useState } from 'react';
import { Course } from '../types/course';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  courses: Course[];
  onEditCourse: (courseId: string) => void;
  onLogout: () => void;
  guardarCursos: (nuevosCursos: Course[]) => Promise<boolean>;
  guardando: boolean;
  errorGuardado: string | null;
  exitoGuardado: boolean;
  refrescarCursos: () => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  onEditCourse,
  onLogout,
  guardarCursos,
  guardando,
  errorGuardado,
  exitoGuardado,
  refrescarCursos,
}) => {
  const { repoOwner, repoName, branch, filePath } = useAuth();
  
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState<boolean>(false);
  const [nuevoTitulo, setNuevoTitulo] = useState<string>('');
  const [nuevaDesc, setNuevaDesc] = useState<string>('');
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const manejarCrearCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError(null);

    if (!nuevoTitulo.trim() || !nuevaDesc.trim()) {
      setMensajeError('Por favor completa todos los campos requeridos.');
      return;
    }

    const nuevoCurso: Course = {
      id: `curso-${Date.now()}`,
      title: nuevoTitulo.trim(),
      description: nuevaDesc.trim(),
      lessons: [],
    };

    const nuevosCursos = [...courses, nuevoCurso];

    const exito = await guardarCursos(nuevosCursos);
    if (exito) {
      setNuevoTitulo('');
      setNuevaDesc('');
      setMostrarFormNuevo(false);
      refrescarCursos();
    }
  };

  const manejarEliminarCurso = async (id: string, titulo: string) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar el curso "${titulo}"? Los cambios se guardarán de inmediato en tu repositorio remoto.`);
    if (!confirmar) return;

    const nuevosCursos = courses.filter((c) => c.id !== id);
    const exito = await guardarCursos(nuevosCursos);
    if (exito) {
      refrescarCursos();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Cabecera del Panel */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Panel de Control</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }}></span>
            Conexión activa: <strong>{repoOwner}/{repoName}</strong> ({branch})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={refrescarCursos} disabled={guardando}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            Refrescar Nube
          </button>
          
          <button className="btn btn-danger" onClick={onLogout} disabled={guardando}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Salir
          </button>
        </div>
      </div>

      {/* Tarjeta de Metadatos del Archivo de Base de Datos */}
      <div className="stats-container" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1.2rem 1.5rem' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', width: '38px', height: '38px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>{filePath}</span>
            <span className="stat-label">Archivo de Datos</span>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem 1.5rem' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', width: '38px', height: '38px', color: 'var(--secondary-accent)', borderColor: 'rgba(6, 182, 212, 0.15)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="6" y1="3" x2="6" y2="15"></line>
              <circle cx="18" cy="6" r="3"></circle>
              <circle cx="6" cy="18" r="3"></circle>
              <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
          </div>
          <div className="stat-info">
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{branch}</span>
            <span className="stat-label">Rama Activa</span>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem 1.5rem' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', width: '38px', height: '38px', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Conectado</span>
            <span className="stat-label">Estado de Servidor</span>
          </div>
        </div>
      </div>

      {/* Alertas del Proceso */}
      {exitoGuardado && (
        <div className="alert alert-success" id="save-success-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Los cambios se guardaron y sincronizaron con éxito en el repositorio remoto de GitHub.</span>
        </div>
      )}
      {errorGuardado && (
        <div className="alert alert-danger" id="save-error-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span><strong>Error de sincronización con GitHub:</strong> {errorGuardado}</span>
        </div>
      )}
      {mensajeError && (
        <div className="alert alert-danger" id="form-error-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{mensajeError}</span>
        </div>
      )}

      {/* Botón de Creación / Formulario */}
      <div style={{ marginBottom: '2.5rem' }}>
        {!mostrarFormNuevo ? (
          <button
            className="btn btn-primary"
            onClick={() => setMostrarFormNuevo(true)}
            disabled={guardando}
            id="btn-show-new-course"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Crear Nuevo Curso
          </button>
        ) : (
          <div className="editor-panel" style={{ marginTop: '1rem', maxWidth: '650px', borderLeft: '4px solid var(--primary-accent)' }} id="new-course-panel">
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--primary-accent)' }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Crear Nuevo Curso
            </h3>
            
            <form onSubmit={manejarCrearCurso}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-course-title">
                  Título de la Materia / Curso
                </label>
                <input
                  id="new-course-title"
                  className="form-input"
                  type="text"
                  placeholder="Ej: Métodos Numéricos Avanzados"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  required
                  disabled={guardando}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-course-desc">
                  Sinopsis / Descripción
                </label>
                <textarea
                  id="new-course-desc"
                  className="form-textarea"
                  placeholder="Describe brevemente de qué tratará este curso y a quién está dirigido..."
                  value={nuevaDesc}
                  onChange={(e) => setNuevaDesc(e.target.value)}
                  required
                  disabled={guardando}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMostrarFormNuevo(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={guardando}
                  id="btn-save-new-course"
                >
                  {guardando ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff', boxShadow: 'none' }}></div>
                      Guardando en GitHub...
                    </>
                  ) : (
                    'Guardar y Crear'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Tabla / Listado de Cursos */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2rem 0 1rem 0', letterSpacing: '-0.015em' }}>
        Cursos Disponibles
      </h2>

      {courses.length === 0 ? (
        <div className="alert alert-warning" id="no-courses-admin">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          No hay cursos configurados en tu repositorio remoto. Crea uno para empezar.
        </div>
      ) : (
        <div className="courses-list-admin" id="courses-list-admin">
          {courses.map((course) => {
            const numLecciones = course.lessons ? course.lessons.length : 0;
            return (
              <div key={course.id} className="course-item-admin" id={`course-item-${course.id}`}>
                <div className="course-item-info">
                  <span className="course-item-title">{course.title}</span>
                  <span className="course-item-desc">{course.description}</span>
                  <div style={{ marginTop: '0.4rem' }}>
                    <span className="config-badge">
                      {numLecciones} {numLecciones === 1 ? 'lección cargada' : 'lecciones cargadas'}
                    </span>
                  </div>
                </div>
                
                <div className="course-item-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => onEditCourse(course.id)}
                    disabled={guardando}
                    id={`btn-edit-course-${course.id}`}
                    style={{ padding: '0.6rem 1.2rem', gap: '0.4rem' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Editar Contenido
                  </button>
                  
                  <button
                    className="btn btn-danger"
                    onClick={() => manejarEliminarCurso(course.id, course.title)}
                    disabled={guardando}
                    id={`btn-delete-course-${course.id}`}
                    style={{ padding: '0.6rem 1.2rem', gap: '0.4rem' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
