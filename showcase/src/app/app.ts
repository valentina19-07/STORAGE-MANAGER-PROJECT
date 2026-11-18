import { Component } from '@angular/core';
import { CacheDemo } from './cache-demo/cache-demo';
import { LocalDemo } from './local-demo/local-demo';

@Component({
  selector: 'app-root',
  imports: [LocalDemo, CacheDemo],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
