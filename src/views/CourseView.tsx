import React, { useState, useEffect } from 'react';
import { Course, Lesson } from '../types/course';

interface CourseViewProps {
  course: Course;
  onBackToHome: () => void;
}

export const CourseView: React.FC<CourseViewProps> = ({ course, onBackToHome }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Seleccionar la primera lección por defecto cuando cambie el curso
  useEffect(() => {
    if (course && course.lessons && course.lessons.length > 0) {
      setSelectedLesson(course.lessons[0]);
    } else {
      setSelectedLesson(null);
    }
  }, [course]);

  const sinLecciones = !course.lessons || course.lessons.length === 0;

  // Encontrar el índice de la lección seleccionada actualmente para la navegación siguiente/anterior
  const indiceLeccionActual = selectedLesson && course.lessons 
    ? course.lessons.findIndex(l => l.id === selectedLesson.id) 
    : -1;

  // Funciones de navegación para mejorar la experiencia de aprendizaje (UX)
  const irALeccionAnterior = () => {
    if (indiceLeccionActual > 0 && course.lessons) {
      setSelectedLesson(course.lessons[indiceLeccionActual - 1]);
      document.getElementById('youtube-player')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const irALeccionSiguiente = () => {
    if (indiceLeccionActual < course.lessons.length - 1 && course.lessons) {
      setSelectedLesson(course.lessons[indiceLeccionActual + 1]);
      document.getElementById('youtube-player')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      {/* Botón de Retorno y Cabecera del Curso */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onBackToHome} id="btn-course-back" style={{ padding: '0.6rem 1.2rem', gap: '0.4rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver al Catálogo
        </button>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{course.title}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '1rem' }}>{course.description}</p>
        </div>
      </div>

      {sinLecciones ? (
        <div className="alert alert-warning" id="course-empty-lessons" style={{ margin: '2rem 0' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Este curso no contiene lecciones todavía. Vuelve más tarde o inicia sesión como administrador para añadir clases.
        </div>
      ) : (
        <div className="course-view-layout">
          {/* Columna Izquierda: Temario / Lista de Lecciones */}
          <aside className="course-sidebar">
            <div className="sidebar-header">
              <h3 className="sidebar-course-title">Syllabus del Curso</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                {course.lessons.length} {course.lessons.length === 1 ? 'lección estructurada' : 'lecciones estructuradas'}
              </p>
            </div>
            
            <ul className="lessons-list">
              {course.lessons.map((lesson, index) => {
                const isActive = selectedLesson?.id === lesson.id;
                return (
                  <li key={lesson.id}>
                    <button
                      className={`lesson-item ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedLesson(lesson)}
                      id={`lesson-btn-${lesson.id}`}
                    >
                      <span className="lesson-number">{index + 1}</span>
                      <div className="lesson-info" style={{ flexGrow: 1 }}>
                        <span className="lesson-info-title">{lesson.title}</span>
                      </div>
                      {isActive && (
                        <span style={{ color: 'var(--primary-accent)', display: 'flex', alignItems: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Columna Derecha: Reproductor de Video y Contenido de la Clase */}
          <main className="course-player-container">
            {selectedLesson ? (
              <>
                {/* Contenedor del Reproductor con Efecto de Retroiluminación */}
                <div className="video-player-wrapper">
                  <div className="video-player-aspect">
                    {selectedLesson.youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedLesson.youtubeId}?rel=0&autoplay=0`}
                        title={selectedLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        id="youtube-player"
                      ></iframe>
                    ) : (
                      <div className="video-placeholder">
                        <div className="video-placeholder-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          </svg>
                        </div>
                        <span style={{ fontWeight: 600 }}>Video no configurado</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>El administrador del curso aún no ha cargado el identificador de YouTube para esta clase.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controles de Navegación de Clases (Anterior / Siguiente) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={irALeccionAnterior}
                    disabled={indiceLeccionActual <= 0}
                    style={{ padding: '0.6rem 1.2rem', gap: '0.4rem' }}
                  >
                    &larr; Clase Anterior
                  </button>
                  
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Clase {indiceLeccionActual + 1} de {course.lessons.length}
                  </span>
                  
                  <button
                    className="btn btn-primary"
                    onClick={irALeccionSiguiente}
                    disabled={indiceLeccionActual >= course.lessons.length - 1}
                    style={{ padding: '0.6rem 1.2rem', gap: '0.4rem' }}
                  >
                    Siguiente Clase &rarr;
                  </button>
                </div>

                {/* Ficha de Detalles de la Clase */}
                <div className="video-info-card" id={`lesson-info-${selectedLesson.id}`}>
                  <h3 className="video-info-title">{selectedLesson.title}</h3>
                  <div className="video-info-description">
                    {selectedLesson.description || 'No hay notas ni descripción detallada disponible para esta clase.'}
                  </div>
                </div>
              </>
            ) : (
              <div className="video-placeholder" style={{ position: 'relative', height: '400px', borderRadius: 'var(--radius-lg)' }}>
                <span style={{ fontWeight: 600 }}>Selecciona una lección</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Utiliza el menú lateral izquierdo para elegir la clase que deseas reproducir.</span>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
