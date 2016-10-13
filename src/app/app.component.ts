import { Component } from '@angular/core';
// import '../styles/styles.scss';

@Component({
  selector: 'rt',
  template: require('./app.component.html'),
  styles: [
    require('./app.component.scss')
  ]
})
export class AppComponent {
    constructor() {
        console.log('running')
    }
}
