import { Component, inject, signal } from '@angular/core';
import { CacheEntry, CacheStorageService, StorageError } from 'ngx-storage-manager-uceva';

@Component({
  selector: 'app-cache-demo',
  templateUrl: './cache-demo.html',
  styleUrl: './cache-demo.css',
})
export class CacheDemo {
  private readonly cache = inject(CacheStorageService);

  readonly defaultJson = '{"id":1,"nombre":"Demo"}';
  readonly message = signal('');
  readonly result = signal('');
  readonly caches = signal<string[]>([]);
  readonly entries = signal<CacheEntry[]>([]);

  constructor() {
    void this.refresh('demo-cache');
  }

  create(name: string): Promise<void> {
    return this.exec(name, async () => {
      await this.cache.create(name);
      return `Caché '${name}' creada`;
    });
  }

  saveJson(name: string, url: string, raw: string): Promise<void> {
    return this.exec(name, async () => {
      await this.cache.putJson(name, url, JSON.parse(raw));
      return `JSON guardado en '${url}'`;
    });
  }

  download(name: string, url: string): Promise<void> {
    return this.exec(name, async () => {
      const response = await this.cache.fetchAndStore(name, url);
      return `Recurso descargado y guardado (HTTP ${response.status})`;
    });
  }

  read(name: string, url: string): Promise<void> {
    return this.exec(name, async () => {
      const data = await this.cache.getJson<unknown>(name, url);
      this.result.set(JSON.stringify(data, null, 2));
      return data === null ? 'Recurso no encontrado' : 'Recurso leído';
    });
  }

  removeEntry(name: string, url: string): Promise<void> {
    return this.exec(name, async () => {
      const removed = await this.cache.remove(name, url);
      return removed ? 'Recurso eliminado' : 'El recurso no existía';
    });
  }

  removeCache(name: string): Promise<void> {
    return this.exec(name, async () => {
      const removed = await this.cache.removeCache(name);
      return removed ? `Caché '${name}' eliminada` : 'La caché no existía';
    });
  }

  clearAll(name: string): Promise<void> {
    return this.exec(name, async () => {
      await this.cache.clearAll();
      return 'Todas las cachés eliminadas';
    });
  }

  private async exec(name: string, action: () => Promise<string>): Promise<void> {
    try {
      this.message.set(await action());
    } catch (error) {
      this.message.set(
        error instanceof StorageError ? `Error: ${error.message}` : `Error: ${String(error)}`,
      );
    }
    await this.refresh(name);
  }

  private async refresh(name: string): Promise<void> {
    this.caches.set(await this.cache.listCaches());
    this.entries.set(await this.cache.entries(name));
  }
}
