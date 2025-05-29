import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `<div
    class="my-icon"
    aria-label="My icon"
    [inlineSVG]="'/assets/cycle-loader.svg'"
  ></div>`,
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent {}
