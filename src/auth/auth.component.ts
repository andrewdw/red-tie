import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  // encapsulation: ViewEncapsulation.Native,
  template: require('./auth.component.html'),
  styles: [require('./auth.component.scss')]
})
export class AuthComponent {
  constructor(){
    console.log('auth is starting')
  }
}