import { useState, useEffect, useCallback } from 'react';
import { Course } from '../types/course';
import { useAuth } from '../context/AuthContext';

export const useCourses = () => {
  const { pat, repoOwner, repoName, filePath, branch } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // URL Raw de GitHub para acceder al JSON públicamente sin autenticación
  const getRawUrl = useCallback(() => {
    return `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${filePath}`;
  }, [repoOwner, repoName, filePath, branch]);

  // Función para realizar la petición y obtener los cursos
  const obtenerCursos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let datos;
      let cargadoPorApi = false;

      // Si el administrador ha iniciado sesión, consultar la API REST de GitHub para evitar
      // el lag de almacenamiento en caché del CDN público de GitHub Raw
      if (pat) {
        try {
          const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}&t=${new Date().getTime()}`;
          const respuesta = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${pat}`,
              'Accept': 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

          if (respuesta.ok) {
            const jsonRes = await respuesta.json();
            const base64Content = jsonRes.content.replace(/\s/g, '');
            const binario = atob(base64Content);
            const bytes = new Uint8Array(binario.length);
            for (let i = 0; i < binario.length; i++) {
              bytes[i] = binario.charCodeAt(i);
            }
            const textoDecodificado = new TextDecoder().decode(bytes);
            datos = JSON.parse(textoDecodificado);
            cargadoPorApi = true;
          } else if (respuesta.status === 404) {
            setCourses([]);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn('Fallo al obtener datos vía API de GitHub, reintentando vía Raw URL:', apiErr);
        }
      }

      if (!cargadoPorApi) {
        const url = getRawUrl();
        const urlConCacheBuster = `${url}?t=${new Date().getTime()}`;
        const respuesta = await fetch(urlConCacheBuster);
        
        if (!respuesta.ok) {
          if (respuesta.status === 404) {
            // Si el archivo no existe aún, inicializamos con una lista vacía
            setCourses([]);
            setLoading(false);
            return;
          }
          throw new Error(`Error al obtener los cursos: ${respuesta.statusText} (${respuesta.status})`);
        }
        
        datos = await respuesta.json();
      }
      
      if (Array.isArray(datos)) {
        setCourses(datos);
      } else {
        throw new Error('El archivo JSON no tiene un formato de lista válido.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error desconocido al conectar con GitHub.');
    } finally {
      setLoading(false);
    }
  }, [pat, getRawUrl, repoOwner, repoName, filePath, branch]);

  // Ejecutar el fetch inicial cuando cambie la configuración del repositorio
  useEffect(() => {
    obtenerCursos();
  }, [obtenerCursos]);

  return {
    courses,
    loading,
    error,
    actualizarCursosLocales: setCourses,
    refrescarCursos: obtenerCursos,
  };
};
