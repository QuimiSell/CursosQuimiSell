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

interface EditorViewProps {
  course: Course;
  courses: Course[];
  onBackToDashboard: () => void;
  guardarCursos: (nuevosCursos: Course[]) => Promise<boolean>;
  guardando: boolean;
  errorGuardado: string | null;
  exitoGuardado: boolean;
}

export const EditorView: React.FC<EditorViewProps> = ({
  course,
  courses,
  onBackToDashboard,
  guardarCursos,
  guardando,
  errorGuardado,
  exitoGuardado,
}) => {
  const [tituloCurso, setTituloCurso] = useState<string>(course.title);
  const [descripcionCurso, setDescripcionCurso] = useState<string>(course.description);
  const [categoriaCurso, setCategoriaCurso] = useState<string>(course.category || 'Otros');
  const [lecciones, setLecciones] = useState<Lesson[]>(course.lessons || []);

  const [editandoLeccionId, setEditandoLeccionId] = useState<string | null>(null);
  const [tituloLeccion, setTituloLeccion] = useState<string>('');
  const [descripcionLeccion, setDescripcionLeccion] = useState<string>('');
  const [youtubeIdLeccion, setYoutubeIdLeccion] = useState<string>('');

  const [indiceArrastrado, setIndiceArrastrado] = useState<number | null>(null);
  const [indiceSobreElQueSeArrastra, setIndiceSobreElQueSeArrastra] = useState<number | null>(null);

  useEffect(() => {
    setTituloCurso(course.title);
    setDescripcionCurso(course.description);
    setCategoriaCurso(course.category || 'Otros');
    setLecciones(course.lessons || []);
    limpiarFormularioLeccion();
  }, [course]);

  const limpiarFormularioLeccion = () => {
    setEditandoLeccionId(null);
    setTituloLeccion('');
    setDescripcionLeccion('');
    setYoutubeIdLeccion('');
  };

  const seleccionarLeccionParaEditar = (leccion: Lesson) => {
    setEditandoLeccionId(leccion.id);
    setTituloLeccion(leccion.title);
    setDescripcionLeccion(leccion.description);
    setYoutubeIdLeccion(leccion.youtubeId);
  };

  const manejarGuardarLeccion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tituloLeccion.trim()) {
      alert('El título de la lección es obligatorio.');
      return;
    }

    const idLimpio = extraerYoutubeId(youtubeIdLeccion);

    if (editandoLeccionId) {
      const leccionesActualizadas = lecciones.map((l) =>
        l.id === editandoLeccionId
          ? {
              ...l,
              title: tituloLeccion.trim(),
              description: descripcionLeccion.trim(),
              youtubeId: idLimpio,
            }
          : l
      );
      setLecciones(leccionesActualizadas);
    } else {
      const nuevaLeccion: Lesson = {
        id: `leccion-${Date.now()}`,
        title: tituloLeccion.trim(),
        description: descripcionLeccion.trim(),
        youtubeId: idLimpio,
      };
      setLecciones([...lecciones, nuevaLeccion]);
    }

    limpiarFormularioLeccion();
  };

  const manejarEliminarLeccion = (id: string, titulo: string) => {
    const confirmar = window.confirm(`¿Deseas eliminar la lección "${titulo}" de la lista local?`);
    if (!confirmar) return;

    const leccionesFiltradas = lecciones.filter((l) => l.id !== id);
    setLecciones(leccionesFiltradas);

    if (editandoLeccionId === id) {
      limpiarFormularioLeccion();
    }
  };

  const moverArriba = (index: number) => {
    if (index === 0) return;
    const lista = [...lecciones];
    const item = lista[index];
    lista.splice(index, 1);
    lista.splice(index - 1, 0, item);
    setLecciones(lista);
  };

  const moverAbajo = (index: number) => {
    if (index === lecciones.length - 1) return;
    const lista = [...lecciones];
    const item = lista[index];
    lista.splice(index, 1);
    lista.splice(index + 1, 0, item);
    setLecciones(lista);
  };

  const alIniciarArrastre = (e: React.DragEvent, index: number) => {
    setIndiceArrastrado(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const alArrastrarSobre = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (indiceArrastrado === null || indiceArrastrado === index) return;
    setIndiceSobreElQueSeArrastra(index);
  };

  const alSoltar = (e: React.DragEvent, indexDestino: number) => {
    e.preventDefault();
    if (indiceArrastrado === null) return;

    const lista = [...lecciones];
    const itemArrastrado = lista[indiceArrastrado];
    
    lista.splice(indiceArrastrado, 1);
    lista.splice(indexDestino, 0, itemArrastrado);

    setLecciones(lista);
    setIndiceArrastrado(null);
    setIndiceSobreElQueSeArrastra(null);
  };

  const alTerminarArrastre = () => {
    setIndiceArrastrado(null);
    setIndiceSobreElQueSeArrastra(null);
  };

  const manejarGuardarEnGitHub = async () => {
    if (!tituloCurso.trim()) {
      alert('El título del curso es requerido.');
      return;
    }

    const cursoActualizado: Course = {
      ...course,
      title: tituloCurso.trim(),
      description: descripcionCurso.trim(),
      category: categoriaCurso,
      lessons: lecciones,
    };

    const nuevosCursos = courses.map((c) => (c.id === course.id ? cursoActualizado : c));
    await guardarCursos(nuevosCursos);
  };

  const youtubeIdExtraido = extraerYoutubeId(youtubeIdLeccion);
  const esValidoYoutubeId = youtubeIdExtraido.length === 11;

  return (
    <div className="editor-view-container">
      {/* Encabezado del Editor */}
      <div className="dashboard-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <button className="btn btn-secondary" onClick={onBackToDashboard} disabled={guardando} style={{ padding: '0.6rem 1.2rem', gap: '0.4rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </button>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '1rem 0 0 0', letterSpacing: '-0.02em' }}>
            Editor: {course.title}
          </h2>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={manejarGuardarEnGitHub}
          disabled={guardando}
          id="btn-save-to-github"
          style={{ padding: '0.8rem 1.8rem', gap: '0.5rem' }}
        >
          {guardando ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff', boxShadow: 'none' }}></div>
              Guardando Cambios...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Sincronizar en GitHub
            </>
          )}
        </button>
      </div>

      {/* Alertas */}
      {exitoGuardado && (
        <div className="alert alert-success" id="editor-save-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Los datos y el orden de las lecciones se guardaron correctamente en GitHub.</span>
        </div>
      )}
      {errorGuardado && (
        <div className="alert alert-danger" id="editor-save-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span><strong>Error de sincronización con la nube:</strong> {errorGuardado}</span>
        </div>
      )}

      {/* Grid Layout del Editor */}
      <div className="editor-layout">
        {/* Columna Izquierda: Ajustes del Curso y Ficha de Lección */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Ficha 1: Ajustes Básicos */}
          <div className="editor-panel">
            <h3 className="editor-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Información del Curso
            </h3>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-course-title">Título del Curso</label>
              <input
                id="edit-course-title"
                className="form-input"
                type="text"
                value={tituloCurso}
                onChange={(e) => setTituloCurso(e.target.value)}
                disabled={guardando}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-course-desc">Descripción General</label>
              <textarea
                id="edit-course-desc"
                className="form-textarea"
                value={descripcionCurso}
                onChange={(e) => setDescripcionCurso(e.target.value)}
                disabled={guardando}
              ></textarea>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="edit-course-category">Categoría / Género</label>
              <select
                id="edit-course-category"
                className="form-input"
                value={categoriaCurso}
                onChange={(e) => setCategoriaCurso(e.target.value)}
                disabled={guardando}
                style={{ backgroundColor: 'rgba(3, 7, 18, 0.45)', color: '#fff' }}
              >
                <option value="Química">Química</option>
                <option value="Biología">Biología</option>
                <option value="Matemáticas">Matemáticas</option>
                <option value="Programación">Programación</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          {/* Ficha 2: Creador / Editor de Lecciones */}
          <div className="editor-panel">
            <h3 className="editor-title" style={{ borderBottomColor: editandoLeccionId ? 'rgba(6, 182, 212, 0.2)' : 'var(--border-color)' }}>
              {editandoLeccionId ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--secondary-accent)' }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Editando Clase</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Nueva Clase</span>
                </>
              )}
            </h3>
            
            <form onSubmit={manejarGuardarLeccion}>
              <div className="form-group">
                <label className="form-label" htmlFor="lesson-title">Título de la Clase</label>
                <input
                  id="lesson-title"
                  className="form-input"
                  type="text"
                  placeholder="Ej: Clase 1: Límites y Continuidad"
                  value={tituloLeccion}
                  onChange={(e) => setTituloLeccion(e.target.value)}
                  required
                  disabled={guardando}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lesson-youtube-id">ID de Video de YouTube</label>
                <input
                  id="lesson-youtube-id"
                  className="form-input"
                  type="text"
                  placeholder="Ej: dQw4w9WgXcQ"
                  value={youtubeIdLeccion}
                  onChange={(e) => setYoutubeIdLeccion(e.target.value)}
                  disabled={guardando}
                />
                
                {/* Previsualización en Tiempo Real de YouTube (UX) */}
                {esValidoYoutubeId && (
                  <div className="video-preview-box">
                    <img
                      src={`https://img.youtube.com/vi/${youtubeIdExtraido}/mqdefault.jpg`}
                      alt="Previsualización de YouTube"
                      className="video-preview-thumb"
                    />
                    <div className="video-preview-meta">
                      <span style={{ fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--success)', borderRadius: '50%' }}></span>
                        Miniatura Encontrada
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ID: {youtubeIdExtraido}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lesson-desc">Notas y Contenido de la Clase</label>
                <textarea
                  id="lesson-desc"
                  className="form-textarea"
                  placeholder="Instrucciones, links de interés, fórmulas importantes o temario cubierto..."
                  value={descripcionLeccion}
                  onChange={(e) => setDescripcionLeccion(e.target.value)}
                  disabled={guardando}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                {editandoLeccionId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={limpiarFormularioLeccion}
                    disabled={guardando}
                  >
                    Descartar
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {editandoLeccionId ? 'Actualizar Lección' : 'Añadir a la Lista'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Syllabus y Reordenamiento por Arrastre */}
        <div className="editor-panel">
          <h3 className="editor-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Lecciones Cargadas ({lecciones.length})
          </h3>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.8rem', lineHeight: '1.5' }}>
            Arrastra cada elemento desde el icono <strong>☰</strong> o haz clic en las flechas <strong>▲ ▼</strong> para reordenar la secuencia de estudio. Una vez finalices, presiona el botón <strong>"Sincronizar en GitHub"</strong> en la parte superior.
          </p>

          {lecciones.length === 0 ? (
            <div className="alert alert-warning" id="no-lessons-editor">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Este curso no contiene clases aún. Utiliza el formulario de la izquierda para comenzar a poblar el temario.
            </div>
          ) : (
            <div className="reorder-list" id="reorder-list-lessons">
              {lecciones.map((lesson, index) => {
                const estaSiendoArrastrado = index === indiceArrastrado;
                const estaArrastradoSobre = index === indiceSobreElQueSeArrastra;
                const estaEditandose = editandoLeccionId === lesson.id;
                
                return (
                  <div
                    key={lesson.id}
                    className="reorder-item"
                    draggable={!guardando}
                    onDragStart={(e) => alIniciarArrastre(e, index)}
                    onDragOver={(e) => alArrastrarSobre(e, index)}
                    onDrop={(e) => alSoltar(e, index)}
                    onDragEnd={alTerminarArrastre}
                    style={{
                      opacity: estaSiendoArrastrado ? 0.3 : 1,
                      borderStyle: estaArrastradoSobre ? 'dashed' : 'solid',
                      borderColor: estaArrastradoSobre 
                        ? 'var(--primary-accent)' 
                        : estaEditandose 
                          ? 'var(--secondary-accent)' 
                          : 'var(--border-color)',
                      backgroundColor: estaEditandose ? 'rgba(6, 182, 212, 0.04)' : undefined,
                      transform: estaArrastradoSobre ? 'scale(1.015)' : 'none',
                    }}
                    id={`reorder-item-${lesson.id}`}
                  >
                    {/* Control Grip Handle y Título */}
                    <div className="reorder-handle">
                      <span
                        className="drag-icon"
                        style={{ cursor: guardando ? 'not-allowed' : 'grab' }}
                        title="Arrastrar para ordenar"
                      >
                        ☰
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                        <strong style={{ color: estaEditandose ? 'var(--secondary-accent)' : 'var(--text-muted)', marginRight: '0.4rem' }}>
                          {index + 1}.
                        </strong>
                        {lesson.title}
                      </span>
                    </div>

                    {/* Controles de Acción y Orden */}
                    <div className="reorder-controls">
                      {/* Mover Arriba */}
                      <button
                        type="button"
                        className="reorder-btn"
                        onClick={() => moverArriba(index)}
                        disabled={index === 0 || guardando}
                        title="Mover una posición hacia arriba"
                        id={`btn-move-up-${lesson.id}`}
                      >
                        ▲
                      </button>
                      
                      {/* Mover Abajo */}
                      <button
                        type="button"
                        className="reorder-btn"
                        onClick={() => moverAbajo(index)}
                        disabled={index === lecciones.length - 1 || guardando}
                        title="Mover una posición hacia abajo"
                        id={`btn-move-down-${lesson.id}`}
                      >
                        ▼
                      </button>

                      {/* Editar Ficha */}
                      <button
                        type="button"
                        className={`btn ${estaEditandose ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                        onClick={() => seleccionarLeccionParaEditar(lesson)}
                        disabled={guardando}
                        id={`btn-edit-lesson-${lesson.id}`}
                      >
                        {estaEditandose ? 'Editando' : 'Editar'}
                      </button>

                      {/* Eliminar Clase */}
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                        onClick={() => manejarEliminarLeccion(lesson.id, lesson.title)}
                        disabled={guardando}
                        id={`btn-delete-lesson-${lesson.id}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
