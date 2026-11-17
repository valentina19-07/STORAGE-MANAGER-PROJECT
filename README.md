# ngx-storage-manager-uceva

Librería Angular para gestionar **LocalStorage** y **Cache Storage** con una API sencilla, tipada y consistente. Sin NgModules: los servicios son `providedIn: 'root'`.

## Instalación

```bash
npm install ngx-storage-manager-uceva
```

Requiere Angular 20 o superior.

## Configuración

No necesita configuración. Solo inyecta el servicio donde lo necesites:

```ts
import { Component, inject } from '@angular/core';
import { LocalStorageService, CacheStorageService } from 'ngx-storage-manager-uceva';

@Component({ selector: 'app-demo', template: '' })
export class Demo {
  private readonly local = inject(LocalStorageService);
  private readonly cache = inject(CacheStorageService);
}
```

## LocalStorageService

```ts
this.local.set('user', { id: 1, name: 'Ana' });   // guarda (primitivos u objetos)
const user = this.local.get<{ id: number; name: string }>('user'); // objeto o null
const theme = this.local.getOrDefault('theme', 'light');
this.local.update('user', { id: 1, name: 'Ana María' }); // error si no existe
this.local.has('user');   // true
this.local.keys();        // ['user']
this.local.remove('user');
this.local.clear();
```

| Método | Descripción |
|--------|-------------|
| `set(key, value)` | Guarda un valor serializado en JSON |
| `get<T>(key)` | Retorna el valor o `null` |
| `getOrDefault<T>(key, default)` | Retorna el valor o el valor por defecto |
| `has(key)` | Indica si la clave existe |
| `update(key, value)` | Actualiza una clave existente |
| `remove(key)` | Elimina una clave |
| `clear()` | Elimina todas las claves |
| `keys()` | Lista las claves |

## CacheStorageService

Todos los métodos retornan `Promise`.

```ts
await this.cache.create('mi-cache');
await this.cache.putJson('mi-cache', '/api/user', { id: 1 });
const data = await this.cache.getJson<{ id: number }>('mi-cache', '/api/user');
await this.cache.fetchAndStore('mi-cache', 'https://jsonplaceholder.typicode.com/todos/1');
const entries = await this.cache.entries('mi-cache'); // [{ url, method }]
await this.cache.remove('mi-cache', '/api/user');
await this.cache.removeCache('mi-cache');
await this.cache.clearAll();
```

| Método | Descripción |
|--------|-------------|
| `isSupported()` | Indica si el navegador soporta Cache Storage |
| `create(name)` / `hasCache(name)` / `listCaches()` | Administración de cachés |
| `put(name, request, response)` | Guarda una respuesta HTTP |
| `putJson(name, url, data)` | Guarda un objeto como JSON |
| `fetchAndStore(name, url)` | Descarga y guarda un recurso |
| `get(name, request)` / `getJson<T>(name, request)` | Consulta un recurso |
| `remove(name, request)` | Elimina un recurso |
| `entries(name)` | Lista los recursos de una caché |
| `removeCache(name)` / `clearAll()` | Elimina una o todas las cachés |

> Cache Storage solo funciona en contextos seguros (HTTPS o localhost).

## Manejo de errores

Todo fallo se lanza como `StorageError`, con las propiedades `operation` y `originalError`:

```ts
try {
  this.local.update('no-existe', 1);
} catch (e) {
  if (e instanceof StorageError) {
    console.error(e.operation, e.message);
  }
}
```

## Modelos exportados

`StorageError` y la interfaz `CacheEntry { url: string; method: string }`.

## Autores

Valentina González Mejia  y Juan Fernando Vargas — Arquitectura de Software, UCEVA.

## Licencia

MIT
