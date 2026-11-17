import { TestBed } from '@angular/core/testing';
import { StorageError } from '../models/storage-error.model';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  afterAll(() => localStorage.clear());

  it('guarda y obtiene primitivos', () => {
    service.set('num', 42);
    service.set('txt', 'hola');
    service.set('bool', false);
    expect(service.get<number>('num')).toBe(42);
    expect(service.get<string>('txt')).toBe('hola');
    expect(service.get<boolean>('bool')).toBeFalse();
  });

  it('guarda y obtiene objetos', () => {
    const user = { id: 1, tags: ['a', 'b'] };
    service.set('user', user);
    expect(service.get<typeof user>('user')).toEqual(user);
  });

  it('retorna null si la clave no existe', () => {
    expect(service.get('nada')).toBeNull();
  });

  it('getOrDefault retorna el valor guardado o el valor por defecto', () => {
    expect(service.getOrDefault('x', 'def')).toBe('def');
    service.set('x', 0);
    expect(service.getOrDefault('x', 99)).toBe(0);
  });

  it('has indica si la clave existe', () => {
    expect(service.has('k')).toBeFalse();
    service.set('k', 1);
    expect(service.has('k')).toBeTrue();
  });

  it('update modifica una clave existente', () => {
    service.set('k', 1);
    service.update('k', 2);
    expect(service.get<number>('k')).toBe(2);
  });

  it('update lanza StorageError si la clave no existe', () => {
    expect(() => service.update('nada', 1)).toThrowError(StorageError);
  });

  it('remove elimina una clave', () => {
    service.set('k', 1);
    service.remove('k');
    expect(service.has('k')).toBeFalse();
  });

  it('clear elimina todas las claves', () => {
    service.set('a', 1);
    service.set('b', 2);
    service.clear();
    expect(service.keys()).toEqual([]);
  });

  it('keys lista las claves', () => {
    service.set('a', 1);
    service.set('b', 2);
    expect(service.keys().sort()).toEqual(['a', 'b']);
  });

  it('get lanza StorageError si el contenido no es JSON válido', () => {
    localStorage.setItem('malo', '{no-json');
    expect(() => service.get('malo')).toThrowError(StorageError);
  });

  it('set lanza StorageError si el valor no es serializable', () => {
    expect(() => service.set('k', undefined)).toThrowError(StorageError);
  });

  describe('errores del navegador', () => {
    it('set', () => {
      spyOn(Storage.prototype, 'setItem').and.throwError('quota');
      expect(() => service.set('k', 1)).toThrowError(StorageError);
    });

    it('get', () => {
      spyOn(Storage.prototype, 'getItem').and.throwError('fail');
      expect(() => service.get('k')).toThrowError(StorageError);
    });

    it('has', () => {
      spyOn(Storage.prototype, 'getItem').and.throwError('fail');
      expect(() => service.has('k')).toThrowError(StorageError);
    });

    it('remove', () => {
      spyOn(Storage.prototype, 'removeItem').and.throwError('fail');
      expect(() => service.remove('k')).toThrowError(StorageError);
    });

    it('clear', () => {
      spyOn(Storage.prototype, 'clear').and.throwError('fail');
      expect(() => service.clear()).toThrowError(StorageError);
    });

    it('keys', () => {
      localStorage.setItem('a', '1');
      spyOn(Storage.prototype, 'key').and.throwError('fail');
      expect(() => service.keys()).toThrowError(StorageError);
    });
  });
});
