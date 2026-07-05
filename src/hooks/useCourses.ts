import { useState, useEffect, useCallback } from 'react';
import { Course } from '../types/course';
import { useAuth } from '../context/AuthContext';

export const useCourses = () => {
  const { repoOwner, repoName, filePath, branch } = useAuth();
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
      const url = getRawUrl();
      // Agregamos un timestamp para evitar almacenamiento en caché del navegador (cache busting)
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
      
      const datos = await respuesta.json();
      if (Array.isArray(datos)) {
        setCourses(datos);
      } else {
        throw new Error('El archivo JSON no tiene un formato de lista válido.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error desconocido al conectar con GitHub Raw.');
      // En caso de error, podemos dejar los cursos como un arreglo vacío o mantener el estado previo
    } finally {
      setLoading(false);
    }
  }, [getRawUrl]);

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
