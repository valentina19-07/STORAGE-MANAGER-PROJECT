/**
 * Serializa un valor a JSON.
 * @param value Valor a serializar.
 * @returns Cadena JSON.
 * @throws TypeError si el valor no es serializable (por ejemplo `undefined`).
 */
export function serialize(value: unknown): string {
  const result = JSON.stringify(value);
  if (result === undefined) {
    throw new TypeError('El valor no es serializable a JSON');
  }
  return result;
}

/**
 * Convierte una cadena JSON en un valor tipado.
 * @param raw Cadena JSON.
 * @returns Valor deserializado.
 */
export function deserialize<T>(raw: string): T {
  return JSON.parse(raw) as T;
}
