/**
 * Representa un recurso almacenado dentro de una caché.
 */
export interface CacheEntry {
  /** URL absoluta del recurso. */
  url: string;
  /** Método HTTP asociado al recurso. */
  method: string;
}
