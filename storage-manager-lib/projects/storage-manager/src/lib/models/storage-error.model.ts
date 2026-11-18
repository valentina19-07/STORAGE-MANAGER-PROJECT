/**
 * Error lanzado por los servicios de la librería cuando una operación falla.
 */
export class StorageError extends Error {
  /**
   * @param message Descripción del error.
   * @param operation Nombre de la operación que falló.
   * @param originalError Error original del navegador (si existe).
   */
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}
