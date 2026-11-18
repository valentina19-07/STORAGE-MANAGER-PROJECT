import { Injectable } from '@angular/core';
import { serialize } from '../internal/json.util';
import { CacheEntry } from '../models/cache-entry.model';
import { StorageError } from '../models/storage-error.model';

/**
 * Servicio para administrar recursos con Cache Storage del navegador.
 * Todos los métodos son asíncronos y reportan fallos como {@link StorageError}.
 */
@Injectable({ providedIn: 'root' })
export class CacheStorageService {
  /** Indica si el navegador soporta Cache Storage. */
  isSupported(): boolean {
    return typeof caches !== 'undefined';
  }

  /**
   * Crea una caché (si ya existe, no hace nada).
   * @param cacheName Nombre de la caché.
   */
  async create(cacheName: string): Promise<void> {
    await this.run('create', async (storage) => {
      await storage.open(cacheName);
    });
  }

  /**
   * Indica si existe una caché.
   * @param cacheName Nombre de la caché.
   */
  hasCache(cacheName: string): Promise<boolean> {
    return this.run('hasCache', (storage) => storage.has(cacheName));
  }

  /** Lista los nombres de todas las cachés. */
  listCaches(): Promise<string[]> {
    return this.run('listCaches', (storage) => storage.keys());
  }

  /**
   * Guarda una respuesta HTTP en una caché (la crea si no existe).
   * @param cacheName Nombre de la caché.
   * @param request URL o Request que actúa como clave.
   * @param response Respuesta a almacenar.
   */
  put(cacheName: string, request: RequestInfo | URL, response: Response): Promise<void> {
    return this.run('put', async (storage) => {
      const cache = await storage.open(cacheName);
      await cache.put(request, response);
    });
  }

  /**
   * Guarda un objeto como respuesta JSON.
   * @param cacheName Nombre de la caché.
   * @param url URL que actúa como clave.
   * @param data Datos a almacenar.
   */
  putJson<T>(cacheName: string, url: string, data: T): Promise<void> {
    return this.run('putJson', async (storage) => {
      const cache = await storage.open(cacheName);
      const response = new Response(serialize(data), {
        headers: { 'Content-Type': 'application/json' },
      });
      await cache.put(url, response);
    });
  }

  /**
   * Descarga un recurso con `fetch` y lo guarda en la caché.
   * @param cacheName Nombre de la caché.
   * @param url URL a descargar.
   * @returns La respuesta descargada.
   * @throws StorageError si la respuesta no es exitosa.
   */
  fetchAndStore(cacheName: string, url: string): Promise<Response> {
    return this.run('fetchAndStore', async (storage) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const cache = await storage.open(cacheName);
      await cache.put(url, response.clone());
      return response;
    });
  }

  /**
   * Consulta un recurso almacenado.
   * @param cacheName Nombre de la caché.
   * @param request URL o Request a consultar.
   * @returns La respuesta o `undefined` si la caché o el recurso no existen.
   */
  get(cacheName: string, request: RequestInfo | URL): Promise<Response | undefined> {
    return this.run<Response | undefined>('get', async (storage) => {
      if (!(await storage.has(cacheName))) {
        return undefined;
      }
      const cache = await storage.open(cacheName);
      return cache.match(request);
    });
  }

  /**
   * Consulta un recurso y lo convierte desde JSON.
   * @param cacheName Nombre de la caché.
   * @param request URL o Request a consultar.
   * @returns El objeto o `null` si no existe.
   */
  getJson<T>(cacheName: string, request: RequestInfo | URL): Promise<T | null> {
    return this.run('getJson', async () => {
      const response = await this.get(cacheName, request);
      return response ? ((await response.json()) as T) : null;
    });
  }

  /**
   * Elimina un recurso de una caché.
   * @param cacheName Nombre de la caché.
   * @param request URL o Request a eliminar.
   * @returns `true` si se eliminó, `false` si no existía.
   */
  remove(cacheName: string, request: RequestInfo | URL): Promise<boolean> {
    return this.run('remove', async (storage) => {
      if (!(await storage.has(cacheName))) {
        return false;
      }
      const cache = await storage.open(cacheName);
      return cache.delete(request);
    });
  }

  /**
   * Lista los recursos de una caché.
   * @param cacheName Nombre de la caché.
   * @returns Arreglo de {@link CacheEntry} (vacío si la caché no existe).
   */
  entries(cacheName: string): Promise<CacheEntry[]> {
    return this.run('entries', async (storage) => {
      if (!(await storage.has(cacheName))) {
        return [];
      }
      const cache = await storage.open(cacheName);
      const requests = await cache.keys();
      return requests.map((r) => ({ url: r.url, method: r.method }));
    });
  }

  /**
   * Elimina una caché completa.
   * @param cacheName Nombre de la caché.
   * @returns `true` si se eliminó, `false` si no existía.
   */
  removeCache(cacheName: string): Promise<boolean> {
    return this.run('removeCache', (storage) => storage.delete(cacheName));
  }

  /** Elimina todas las cachés del origen. */
  async clearAll(): Promise<void> {
    await this.run('clearAll', async (storage) => {
      const names = await storage.keys();
      await Promise.all(names.map((name) => storage.delete(name)));
    });
  }

  private async run<T>(
    operation: string,
    action: (storage: CacheStorage) => Promise<T>,
  ): Promise<T> {
    if (!this.isSupported()) {
      throw new StorageError('Cache Storage no está soportado en este navegador', operation);
    }
    try {
      return await action(caches);
    } catch (error) {
      throw new StorageError(
        `Error en Cache Storage durante '${operation}'`,
        operation,
        error,
      );
    }
  }
}
