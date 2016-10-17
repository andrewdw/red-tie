import {
  Component,
  ViewEncapsulation
} from '@angular/core';

@Component({
  template: `
    <h2>Main Component</h2>
    <a [routerLink]="['/accounts']">accounts</a>
  `,
  // encapsulation: ViewEncapsulation.Emulated,
  styles: [
    require('./main.component.scss')
  ]
})
export class MainComponent {
  constructor() {
    console.log('testing1')
    console.log('MAIN COMPONENT ACTIVATE')
  }
}