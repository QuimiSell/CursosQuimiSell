import { useState, useCallback } from 'react';
import { Course } from '../types/course';
import { useAuth } from '../context/AuthContext';

export const useAdminActions = () => {
  const { pat, repoOwner, repoName, filePath, branch } = useAuth();
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<boolean>(false);

  // Función auxiliar para codificar strings UTF-8 a Base64 sin romper caracteres especiales (como acentos o la 'ñ')
  const codificarBase64UTF8 = (str: string): string => {
    const bytes = new TextEncoder().encode(str);
    let binario = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binario += String.fromCharCode(bytes[i]);
    }
    return btoa(binario);
  };

  // 1. Obtener el 'sha' del archivo courses.json actual desde la API de GitHub
  const obtenerSHA = useCallback(async (): Promise<string | null> => {
    if (!pat) throw new Error('No se ha proporcionado un token de acceso (PAT).');

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;
    
    const respuesta = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (respuesta.status === 404) {
      // Si el archivo no existe, no tendrá SHA anterior (es una creación nueva)
      return null;
    }

    if (!respuesta.ok) {
      const errorDatos = await respuesta.json().catch(() => ({}));
      throw new Error(
        `Error al obtener el SHA del archivo: ${errorDatos.message || respuesta.statusText} (${respuesta.status})`
      );
    }

    const datos = await respuesta.json();
    return datos.sha;
  }, [pat, repoOwner, repoName, filePath, branch]);

  // 2. Enviar la actualización a GitHub mediante la API REST (PUT)
  const guardarCursos = useCallback(async (nuevosCursos: Course[]): Promise<boolean> => {
    if (!pat) {
      setError('Debes iniciar sesión con un Personal Access Token (PAT) de GitHub.');
      return false;
    }

    setGuardando(true);
    setError(null);
    setExito(false);

    try {
      // Obtenemos el SHA actual (obligatorio para actualizaciones en GitHub API)
      const shaActual = await obtenerSHA();
      
      // Convertimos los datos a JSON y los codificamos en Base64
      const jsonString = JSON.stringify(nuevosCursos, null, 2);
      const contenidoBase64 = codificarBase64UTF8(jsonString);

      const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
      
      const cuerpoPeticion = {
        message: 'Actualizar cursos.json desde la plataforma de administración',
        content: contenidoBase64,
        branch: branch,
        ...(shaActual ? { sha: shaActual } : {}) // Solo enviamos el SHA si el archivo ya existía
      };

      const respuesta = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${pat}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify(cuerpoPeticion)
      });

      if (!respuesta.ok) {
        const errorDatos = await respuesta.json().catch(() => ({}));
        throw new Error(
          `Error al guardar en GitHub: ${errorDatos.message || respuesta.statusText} (${respuesta.status})`
        );
      }

      setExito(true);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error desconocido al actualizar en GitHub API.');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [pat, obtenerSHA, repoOwner, repoName, filePath, branch]);

  return {
    guardarCursos,
    guardando,
    error,
    exito,
    limpiarEstado: () => {
      setError(null);
      setExito(false);
    }
  };
};
