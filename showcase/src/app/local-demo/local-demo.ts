import { Component, inject, signal } from '@angular/core';
import { LocalStorageService, StorageError } from 'ngx-storage-manager-uceva';

@Component({
  selector: 'app-local-demo',
  templateUrl: './local-demo.html',
  styleUrl: './local-demo.css',
})
export class LocalDemo {
  private readonly storage = inject(LocalStorageService);

  readonly defaultValue = '{"nombre":"Valen","rol":"dev"}';
  readonly message = signal('');
  readonly result = signal('');
  readonly keys = signal<string[]>([]);

  constructor() {
    this.keys.set(this.storage.keys());
  }

  save(key: string, raw: string): void {
    this.exec(() => {
      this.storage.set(key, this.parse(raw));
      return `Guardado '${key}'`;
    });
  }

  read(key: string): void {
    this.exec(() => {
      const value = this.storage.get<unknown>(key);
      this.result.set(JSON.stringify(value, null, 2));
      return value === null ? `La clave '${key}' no existe` : `Leído '${key}'`;
    });
  }

  update(key: string, raw: string): void {
    this.exec(() => {
      this.storage.update(key, this.parse(raw));
      return `Actualizado '${key}'`;
    });
  }

  remove(key: string): void {
    this.exec(() => {
      this.storage.remove(key);
      return `Eliminado '${key}'`;
    });
  }

  clear(): void {
    this.exec(() => {
      this.storage.clear();
      return 'LocalStorage vaciado';
    });
  }

  private exec(action: () => string): void {
    try {
      this.message.set(action());
    } catch (error) {
      this.message.set(
        error instanceof StorageError ? `Error: ${error.message}` : `Error: ${String(error)}`,
      );
    }
    this.keys.set(this.storage.keys());
  }

  private parse(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
}
