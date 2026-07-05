import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBackToHome }) => {
  const { login, repoOwner, repoName, filePath, branch } = useAuth();
  
  const [tokenInput, setTokenInput] = useState<string>('');
  const [ownerInput, setOwnerInput] = useState<string>(repoOwner);
  const [repoInput, setRepoInput] = useState<string>(repoName);
  const [pathInput, setPathInput] = useState<string>(filePath);
  const [branchInput, setBranchInput] = useState<string>(branch);

  const [verificando, setVerificando] = useState<boolean>(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorLocal('El token de acceso de GitHub (PAT) es requerido.');
      return;
    }

    setVerificando(true);
    setErrorLocal(null);

    try {
      const url = `https://api.github.com/repos/${ownerInput}/${repoInput}`;
      const respuesta = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenInput.trim()}`,
          'Accept': 'application/vnd.github+json',
        },
      });

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          throw new Error('Token inválido o expirado. Verifica las credenciales introducidas.');
        } else if (respuesta.status === 404) {
          throw new Error(`Repositorio no encontrado: "${ownerInput}/${repoInput}". Asegúrate de que el propietario y el nombre sean exactos.`);
        } else {
          throw new Error(`Error de conexión con la API de GitHub: ${respuesta.statusText} (${respuesta.status})`);
        }
      }

      login(
        tokenInput.trim(),
        ownerInput.trim(),
        repoInput.trim(),
        pathInput.trim(),
        branchInput.trim()
      );
      
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorLocal(err.message || 'Error inesperado de comunicación con la API de GitHub.');
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-view-container" id="login-container">
        <div className="login-header">
          <div className="login-header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 className="login-title">Acceso Seguro</h2>
          <p className="login-subtitle">Introduce las credenciales de GitHub para administrar los cursos.</p>
        </div>

        {/* Mensaje aclaratorio para los estudiantes (UX) */}
        <div className="alert alert-warning" style={{ fontSize: '0.88rem', margin: '0.5rem 0 1.8rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <strong>¿Eres estudiante?</strong> No necesitas iniciar sesión. Puedes acceder y reproducir todas las lecciones de forma gratuita desde la pestaña <strong>Catálogo</strong> en el menú superior. Este panel es exclusivo para el administrador.
          </div>
        </div>

        {errorLocal && (
          <div className="alert alert-danger" id="login-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorLocal}</span>
          </div>
        )}

        <form onSubmit={manejarEnvio}>
          {/* GitHub PAT */}
          <div className="form-group">
            <label className="form-label" htmlFor="github-token">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
              </svg>
              GitHub Personal Access Token (PAT)
            </label>
            <input
              id="github-token"
              className="form-input"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx o github_pat_..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              El token requiere permisos de contenidos y metadatos con privilegios de lectura y escritura.
            </span>
          </div>

          {/* Propietario y Repositorio */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="repo-owner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Propietario / Org
              </label>
              <input
                id="repo-owner"
                className="form-input"
                type="text"
                placeholder="Ej: QuimiSell"
                value={ownerInput}
                onChange={(e) => setOwnerInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="repo-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                Repositorio
              </label>
              <input
                id="repo-name"
                className="form-input"
                type="text"
                placeholder="Ej: Cursos"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Ruta de Archivo y Rama */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="file-path">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Ruta del JSON
              </label>
              <input
                id="file-path"
                className="form-input"
                type="text"
                placeholder="Ej: courses.json"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="repo-branch">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="6" y1="3" x2="6" y2="15"></line>
                  <circle cx="18" cy="6" r="3"></circle>
                  <circle cx="6" cy="18" r="3"></circle>
                  <path d="M18 9a9 9 0 0 1-9 9"></path>
                </svg>
                Rama
              </label>
              <input
                id="repo-branch"
                className="form-input"
                type="text"
                placeholder="Ej: main"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botones de Envío */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={verificando}
              id="btn-login-submit"
              style={{ width: '100%' }}
            >
              {verificando ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: '#fff', boxShadow: 'none' }}></div>
                  Estableciendo Enlace GitHub...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Establecer Conexión
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBackToHome}
              disabled={verificando}
              style={{ width: '100%' }}
            >
              Volver al Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
