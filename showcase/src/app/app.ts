import { Component } from '@angular/core';
import { LocalDemo } from './local-demo/local-demo';

@Component({
  selector: 'app-root',
  imports: [LocalDemo],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
