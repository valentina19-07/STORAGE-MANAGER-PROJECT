import { deserialize, serialize } from './json.util';

describe('json.util', () => {
  it('serializa objetos y primitivos', () => {
    expect(serialize({ a: 1 })).toBe('{"a":1}');
    expect(serialize('hola')).toBe('"hola"');
  });

  it('lanza TypeError si el valor no es serializable', () => {
    expect(() => serialize(undefined)).toThrowError(TypeError);
  });

  it('deserializa JSON válido', () => {
    expect(deserialize<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it('lanza error con JSON inválido', () => {
    expect(() => deserialize('{x')).toThrow();
  });
});
