import { Injectable } from '@angular/core';
import { deserialize, serialize } from '../internal/json.util';
import { StorageError } from '../models/storage-error.model';

/**
 * Servicio para administrar datos en LocalStorage.
 * Soporta primitivos y objetos mediante serialización JSON.
 * Cualquier fallo se reporta como {@link StorageError}.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  /**
   * Guarda un valor (primitivo u objeto).
   * @param key Clave de almacenamiento.
   * @param value Valor a guardar.
   * @throws StorageError si el valor no es serializable o no hay espacio.
   */
  set<T>(key: string, value: T): void {
    this.run('set', () => localStorage.setItem(key, serialize(value)));
  }

  /**
   * Obtiene un valor almacenado.
   * @param key Clave a consultar.
   * @returns El valor o `null` si la clave no existe.
   * @throws StorageError si el contenido guardado no es JSON válido.
   */
  get<T>(key: string): T | null {
    return this.run('get', () => {
      const raw = localStorage.getItem(key);
      return raw === null ? null : deserialize<T>(raw);
    });
  }

  /**
   * Obtiene un valor o, si no existe, el valor por defecto.
   * @param key Clave a consultar.
   * @param defaultValue Valor a retornar si la clave no existe.
   */
  getOrDefault<T>(key: string, defaultValue: T): T {
    return this.get<T>(key) ?? defaultValue;
  }

  /**
   * Indica si una clave existe.
   * @param key Clave a consultar.
   */
  has(key: string): boolean {
    return this.run('has', () => localStorage.getItem(key) !== null);
  }

  /**
   * Actualiza el valor de una clave existente.
   * @param key Clave a actualizar.
   * @param value Nuevo valor.
   * @throws StorageError si la clave no existe.
   */
  update<T>(key: string, value: T): void {
    if (!this.has(key)) {
      throw new StorageError(`La clave '${key}' no existe`, 'update');
    }
    this.set(key, value);
  }

  /**
   * Elimina una clave (si no existe, no hace nada).
   * @param key Clave a eliminar.
   */
  remove(key: string): void {
    this.run('remove', () => localStorage.removeItem(key));
  }

  /** Elimina todas las claves de LocalStorage. */
  clear(): void {
    this.run('clear', () => localStorage.clear());
  }

  /**
   * Lista todas las claves almacenadas.
   * @returns Arreglo de claves.
   */
  keys(): string[] {
    return this.run('keys', () => {
      const result: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        result.push(localStorage.key(i) as string);
      }
      return result;
    });
  }

  private run<T>(operation: string, action: () => T): T {
    try {
      return action();
    } catch (error) {
      throw new StorageError(
        `Error en LocalStorage durante '${operation}'`,
        operation,
        error,
      );
    }
  }
}
