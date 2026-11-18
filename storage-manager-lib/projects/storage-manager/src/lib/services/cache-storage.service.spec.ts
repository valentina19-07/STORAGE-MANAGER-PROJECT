import { TestBed } from '@angular/core/testing';
import { StorageError } from '../models/storage-error.model';
import { CacheStorageService } from './cache-storage.service';

describe('CacheStorageService', () => {
  const CACHE = 'test-cache';
  const URL_ITEMS = '/api/items';
  let service: CacheStorageService;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheStorageService);
    await service.clearAll();
  });

  afterAll(async () => {
    for (const name of await caches.keys()) {
      await caches.delete(name);
    }
  });

  it('detecta soporte de Cache Storage', () => {
    expect(service.isSupported()).toBeTrue();
  });

  it('crea, verifica y lista cachés', async () => {
    await service.create(CACHE);
    expect(await service.hasCache(CACHE)).toBeTrue();
    expect(await service.hasCache('otra')).toBeFalse();
    expect(await service.listCaches()).toContain(CACHE);
  });

  it('guarda y consulta una respuesta', async () => {
    await service.put(CACHE, URL_ITEMS, new Response('hola'));
    const response = await service.get(CACHE, URL_ITEMS);
    expect(await response?.text()).toBe('hola');
  });

  it('get retorna undefined si la caché o el recurso no existen', async () => {
    expect(await service.get(CACHE, URL_ITEMS)).toBeUndefined();
    await service.create(CACHE);
    expect(await service.get(CACHE, URL_ITEMS)).toBeUndefined();
  });

  it('guarda y consulta JSON', async () => {
    await service.putJson(CACHE, URL_ITEMS, { id: 1 });
    expect(await service.getJson<{ id: number }>(CACHE, URL_ITEMS)).toEqual({ id: 1 });
  });

  it('getJson retorna null si no existe', async () => {
    expect(await service.getJson(CACHE, URL_ITEMS)).toBeNull();
  });

  it('getJson lanza StorageError si el contenido no es JSON', async () => {
    await service.put(CACHE, URL_ITEMS, new Response('no-json'));
    await expectAsync(service.getJson(CACHE, URL_ITEMS)).toBeRejectedWithError(StorageError);
  });

  it('putJson lanza StorageError si el valor no es serializable', async () => {
    await expectAsync(service.putJson(CACHE, URL_ITEMS, undefined)).toBeRejectedWithError(
      StorageError,
    );
  });

  it('fetchAndStore descarga y guarda el recurso', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response('data'));
    const response = await service.fetchAndStore(CACHE, URL_ITEMS);
    expect(await response.text()).toBe('data');
    const cached = await service.get(CACHE, URL_ITEMS);
    expect(await cached?.text()).toBe('data');
  });

  it('fetchAndStore lanza StorageError si la respuesta no es exitosa', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response('x', { status: 404 }));
    await expectAsync(service.fetchAndStore(CACHE, URL_ITEMS)).toBeRejectedWithError(StorageError);
  });

  it('remove elimina un recurso', async () => {
    await service.put(CACHE, URL_ITEMS, new Response('hola'));
    expect(await service.remove(CACHE, URL_ITEMS)).toBeTrue();
    expect(await service.remove(CACHE, URL_ITEMS)).toBeFalse();
    expect(await service.remove('inexistente', URL_ITEMS)).toBeFalse();
  });

  it('entries lista los recursos de una caché', async () => {
    expect(await service.entries('inexistente')).toEqual([]);
    await service.put(CACHE, URL_ITEMS, new Response('hola'));
    expect(await service.entries(CACHE)).toEqual([
      { url: `${location.origin}${URL_ITEMS}`, method: 'GET' },
    ]);
  });

  it('removeCache elimina una caché completa', async () => {
    await service.create(CACHE);
    expect(await service.removeCache(CACHE)).toBeTrue();
    expect(await service.removeCache(CACHE)).toBeFalse();
  });

  it('clearAll elimina todas las cachés', async () => {
    await service.create('a');
    await service.create('b');
    await service.clearAll();
    expect(await service.listCaches()).toEqual([]);
  });

  it('lanza StorageError si el navegador no soporta Cache Storage', async () => {
    spyOn(service, 'isSupported').and.returnValue(false);
    await expectAsync(service.create(CACHE)).toBeRejectedWithError(StorageError);
  });

  it('envuelve los errores del navegador en StorageError', async () => {
    spyOn(CacheStorage.prototype, 'open').and.rejectWith(new Error('boom'));
    await expectAsync(service.create(CACHE)).toBeRejectedWithError(StorageError);
  });
});
