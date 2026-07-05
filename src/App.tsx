import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useCourses } from './hooks/useCourses';
import { useAdminActions } from './hooks/useAdminActions';
import { Course } from './types/course';

// Importación de las vistas
import { HomeView } from './views/HomeView';
import { CourseView } from './views/CourseView';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { EditorView } from './views/EditorView';

// Definición de las rutas posibles de la aplicación
type ActiveView =
  | { type: 'home' }
  | { type: 'course'; courseId: string }
  | { type: 'login' }
  | { type: 'dashboard' }
  | { type: 'editor'; courseId: string };

function App() {
  const { isAuthenticated, logout } = useAuth();
  
  // Consumo de datos públicos
  const { courses, loading, error, actualizarCursosLocales, refrescarCursos } = useCourses();
  
  // Acciones de administración
  const {
    guardarCursos: guardarCursosGitHub,
    guardando,
    error: errorGuardado,
    exito: exitoGuardado,
    limpiarEstado: limpiarEstadoAdmin,
  } = useAdminActions();

  // Función puente que sincroniza tanto el repositorio remoto (GitHub) como la interfaz de usuario local al instante
  const guardarCursos = async (nuevosCursos: Course[]) => {
    const exito = await guardarCursosGitHub(nuevosCursos);
    if (exito) {
      actualizarCursosLocales(nuevosCursos);
    }
    return exito;
  };

  // Estado del Enrutador Personalizado
  const [vista, setVista] = useState<ActiveView>({ type: 'home' });

  // Limpiar estados de alertas de guardado al cambiar de vista
  useEffect(() => {
    limpiarEstadoAdmin();
  }, [vista, limpiarEstadoAdmin]);

  // Protección de rutas: redirigir a Login si se intenta acceder a vistas de Admin sin estar autenticado
  useEffect(() => {
    if (!isAuthenticated && (vista.type === 'dashboard' || vista.type === 'editor')) {
      setVista({ type: 'login' });
    }
  }, [isAuthenticated, vista.type]);

  // Manejar el renderizado de la vista activa
  const renderizarVista = () => {
    switch (vista.type) {
      case 'home':
        return (
          <HomeView
            courses={courses}
            loading={loading}
            error={error}
            onSelectCourse={(id) => setVista({ type: 'course', courseId: id })}
            onNavigateToLogin={() => setVista(isAuthenticated ? { type: 'dashboard' } : { type: 'login' })}
          />
        );

      case 'course': {
        const cursoSeleccionado = courses.find((c) => c.id === vista.courseId);
        if (!cursoSeleccionado) {
          return (
            <div className="alert alert-danger">
              El curso seleccionado no existe.
              <button className="btn btn-secondary" onClick={() => setVista({ type: 'home' })} style={{ marginTop: '1rem' }}>
                Volver al Catálogo
              </button>
            </div>
          );
        }
        return (
          <CourseView
            course={cursoSeleccionado}
            onBackToHome={() => setVista({ type: 'home' })}
          />
        );
      }

      case 'login':
        return (
          <LoginView
            onLoginSuccess={() => setVista({ type: 'dashboard' })}
            onBackToHome={() => setVista({ type: 'home' })}
          />
        );

      case 'dashboard':
        return (
          <DashboardView
            courses={courses}
            onEditCourse={(id) => setVista({ type: 'editor', courseId: id })}
            onLogout={() => {
              logout();
              setVista({ type: 'home' });
            }}
            guardarCursos={guardarCursos}
            guardando={guardando}
            errorGuardado={errorGuardado}
            exitoGuardado={exitoGuardado}
            refrescarCursos={refrescarCursos}
          />
        );

      case 'editor': {
        const cursoParaEditar = courses.find((c) => c.id === vista.courseId);
        if (!cursoParaEditar) {
          return (
            <div className="alert alert-danger">
              El curso a editar no existe o fue eliminado.
              <button className="btn btn-secondary" onClick={() => setVista({ type: 'dashboard' })} style={{ marginTop: '1rem' }}>
                Volver al Dashboard
              </button>
            </div>
          );
        }
        return (
          <EditorView
            course={cursoParaEditar}
            courses={courses}
            onBackToDashboard={() => setVista({ type: 'dashboard' })}
            guardarCursos={guardarCursos}
            guardando={guardando}
            errorGuardado={errorGuardado}
            exitoGuardado={exitoGuardado}
          />
        );
      }

      default:
        return <HomeView courses={courses} loading={loading} error={error} onSelectCourse={(id) => setVista({ type: 'course', courseId: id })} onNavigateToLogin={() => setVista({ type: 'login' })} />;
    }
  };

  return (
    <div className="app-container">
      {/* Barra de Navegación Global */}
      <header className="header">
        <div className="brand" onClick={() => setVista({ type: 'home' })} id="app-logo">
          <span>⚗️ QuimiSell Cursos</span>
        </div>
        <nav className="nav-links">
          <button
            className={`nav-btn ${vista.type === 'home' || vista.type === 'course' ? 'active' : ''}`}
            onClick={() => setVista({ type: 'home' })}
            id="nav-catalog"
          >
            Catálogo
          </button>
          
          {isAuthenticated ? (
            <>
              <button
                className={`nav-btn ${vista.type === 'dashboard' || vista.type === 'editor' ? 'active' : ''}`}
                onClick={() => setVista({ type: 'dashboard' })}
                id="nav-admin"
              >
                Panel Admin
              </button>
              <button
                className="nav-btn"
                onClick={() => {
                  logout();
                  setVista({ type: 'home' });
                }}
                id="nav-logout"
                style={{ color: 'var(--error-color)' }}
              >
                Salir
              </button>
            </>
          ) : (
            <button
              className={`nav-btn ${vista.type === 'login' ? 'active' : ''}`}
              onClick={() => setVista({ type: 'login' })}
              id="nav-login"
            >
              Acceso Admin
            </button>
          )}
        </nav>
      </header>

      {/* Contenido Principal de las Vistas */}
      <main className="main-content">
        {renderizarVista()}
      </main>

      {/* Pie de Página (Footer) Global */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.88rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        background: 'rgba(3, 7, 18, 0.2)'
      }}>
        <div>
          &copy; {new Date().getFullYear()} <strong>QuimiSell Cursos</strong>. Todos los derechos reservados.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--primary-accent)', flexShrink: 0 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>¿Tienes dudas o consultas? Escríbenos a:</span>
          <a href="mailto:quimicabless2020@gmail.com" style={{ color: 'var(--secondary-accent)', textDecoration: 'none', fontWeight: 700 }}>quimicabless2020@gmail.com</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
