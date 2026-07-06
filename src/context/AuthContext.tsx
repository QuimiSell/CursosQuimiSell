import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaz para definir el tipo de datos que maneja nuestro contexto de autenticación
interface AuthContextType {
  pat: string | null; // Personal Access Token de GitHub
  isAuthenticated: boolean;
  repoOwner: string;
  repoName: string;
  filePath: string;
  branch: string;
  login: (token: string, owner: string, repo: string, path: string, branchName: string) => void;
  logout: () => void;
  updateRepoConfig: (owner: string, repo: string, path: string, branchName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pat, setPat] = useState<string | null>(localStorage.getItem('qs_github_pat'));
  const [repoOwner, setRepoOwner] = useState<string>(localStorage.getItem('qs_repo_owner') || 'QuimiSell');
  const [repoName, setRepoName] = useState<string>(localStorage.getItem('qs_repo_name') || 'CursosQuimiSell');
  const [filePath, setFilePath] = useState<string>(localStorage.getItem('qs_file_path') || 'courses.json');
  const [branch, setBranch] = useState<string>(localStorage.getItem('qs_branch') || 'main');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!pat);

  useEffect(() => {
    setIsAuthenticated(!!pat);
  }, [pat]);

  // Función para iniciar sesión (guardar el token y la configuración del repositorio)
  const login = (token: string, owner: string, repo: string, path: string, branchName: string) => {
    localStorage.setItem('qs_github_pat', token);
    localStorage.setItem('qs_repo_owner', owner);
    localStorage.setItem('qs_repo_name', repo);
    localStorage.setItem('qs_file_path', path);
    localStorage.setItem('qs_branch', branchName);
    
    setPat(token);
    setRepoOwner(owner);
    setRepoName(repo);
    setFilePath(path);
    setBranch(branchName);
  };

  // Función para cerrar sesión y limpiar localStorage
  const logout = () => {
    localStorage.removeItem('qs_github_pat');
    localStorage.removeItem('qs_repo_owner');
    localStorage.removeItem('qs_repo_name');
    localStorage.removeItem('qs_file_path');
    localStorage.removeItem('qs_branch');
    
    setPat(null);
    setIsAuthenticated(false);
  };

  // Permite actualizar la configuración del repositorio sin reiniciar sesión
  const updateRepoConfig = (owner: string, repo: string, path: string, branchName: string) => {
    localStorage.setItem('qs_repo_owner', owner);
    localStorage.setItem('qs_repo_name', repo);
    localStorage.setItem('qs_file_path', path);
    localStorage.setItem('qs_branch', branchName);
    
    setRepoOwner(owner);
    setRepoName(repo);
    setFilePath(path);
    setBranch(branchName);
  };

  return (
    <AuthContext.Provider
      value={{
        pat,
        isAuthenticated,
        repoOwner,
        repoName,
        filePath,
        branch,
        login,
        logout,
        updateRepoConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto de autenticación de forma segura
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
