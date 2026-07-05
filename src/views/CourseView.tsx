import React, { useState, useEffect } from 'react';
import { Course, Lesson } from '../types/course';

// Función auxiliar para extraer el ID de 11 caracteres de cualquier formato de URL de YouTube
const extraerYoutubeId = (urlOId: string): string => {
  if (!urlOId) return '';
  const limpio = urlOId.trim();
  // Si ya es un ID de 11 caracteres sin diagonales ni caracteres de query
  if (limpio.length === 11 && !limpio.includes('/') && !limpio.includes('?') && !limpio.includes('=')) {
    return limpio;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/)([^#\&\?]*).*/;
  const match = limpio.match(regExp);
  return (match && match[2].length === 11) ? match[2] : limpio;
};

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
                      style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}
                    >
                      <div style={{ position: 'relative', width: '80px', height: '48px', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        {lesson.youtubeId ? (
                          <img
                            src={`https://img.youtube.com/vi/${extraerYoutubeId(lesson.youtubeId)}/mqdefault.jpg`}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-muted)' }}>
                              <path d="M23 7l-7 5 7 5V7z" />
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                          </div>
                        )}
                        <div style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          backgroundColor: 'rgba(0, 0, 0, 0.85)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 4px',
                          borderRadius: '3px',
                          lineHeight: 1
                        }}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="lesson-info" style={{ flexGrow: 1, minWidth: 0 }}>
                        <span className="lesson-info-title" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.9rem'
                        }}>{lesson.title}</span>
                      </div>
                      {isActive && (
                        <span style={{ color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
                {/* Contenedor de Previsualización y Enlace de YouTube */}
                {selectedLesson.youtubeId ? (
                  <div className="video-player-wrapper" id="youtube-player">
                    <div className="video-player-aspect">
                      <img
                        src={`https://img.youtube.com/vi/${extraerYoutubeId(selectedLesson.youtubeId)}/hqdefault.jpg`}
                        alt={selectedLesson.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      
                      {/* Capa oscura superpuesta y el gran botón de enlace real */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(3, 7, 18, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}>
                        <a
                          href={`https://www.youtube.com/watch?v=${extraerYoutubeId(selectedLesson.youtubeId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{
                            padding: '1.2rem 2.4rem',
                            fontSize: '1.15rem',
                            fontWeight: 800,
                            backgroundColor: '#ef4444',
                            borderColor: '#dc2626',
                            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            textDecoration: 'none',
                            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ff0000';
                            e.currentTarget.style.transform = 'scale(1.06)';
                            e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 0, 0, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.4)';
                          }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                            <polygon points="6 3 20 12 6 21 6 3" />
                          </svg>
                          Ver Clase en YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="video-player-wrapper">
                    <div className="video-player-aspect">
                      <div className="video-placeholder">
                        <div className="video-placeholder-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          </svg>
                        </div>
                        <span style={{ fontWeight: 600 }}>Video no configurado</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>El administrador del curso aún no ha cargado el identificador de YouTube para esta clase.</span>
                      </div>
                    </div>
                  </div>
                )}

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
                  <h3 className="video-info-title" style={{ marginBottom: '1.2rem' }}>{selectedLesson.title}</h3>
                  <div className="video-info-description" style={{ marginBottom: '1.8rem' }}>
                    {selectedLesson.description || 'No hay notas ni descripción detallada disponible para esta clase.'}
                  </div>
                  
                  {/* Banner de soporte de YouTube */}
                  <div style={{
                    border: '1px dashed rgba(239, 68, 68, 0.25)',
                    backgroundColor: 'rgba(239, 68, 68, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.2rem',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ef4444', flexShrink: 0 }}>
                        <path d="M23.498 6.163c-.272-1.022-1.074-1.826-2.099-2.098C19.53 3.53 12 3.53 12 3.53s-7.53 0-9.399.497c-1.025.272-1.827 1.076-2.1 2.098C0 8.033 0 12 0 12s0 3.967.502 5.837c.272 1.022 1.074 1.826 2.099 2.098C6.47 20.47 12 20.47 12 20.47s7.53 0 9.399-.497c1.025-.272 1.827-1.076 2.1-2.098C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <div>
                        <strong>¡Apoya a QuimiSell en YouTube!</strong> Al ver el video en YouTube nos ayudas a acumular horas de reproducción. Deja tu me gusta, haz tus preguntas en los comentarios y suscríbete para apoyarnos a seguir creando contenido gratuito.
                      </div>
                    </div>

                    {selectedLesson.youtubeId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${extraerYoutubeId(selectedLesson.youtubeId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{
                          padding: '0.7rem 1.4rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          borderRadius: 'var(--radius-md)',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          border: '1px solid #dc2626'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.163c-.272-1.022-1.074-1.826-2.099-2.098C19.53 3.53 12 3.53 12 3.53s-7.53 0-9.399.497c-1.025.272-1.827 1.076-2.1 2.098C0 8.033 0 12 0 12s0 3.967.502 5.837c.272 1.022 1.074 1.826 2.099 2.098C6.47 20.47 12 20.47 12 20.47s7.53 0 9.399-.497c1.025-.272 1.827-1.076 2.1-2.098C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        Ver Video en YouTube
                      </a>
                    )}
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
