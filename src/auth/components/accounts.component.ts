import {
  Component,
  ViewEncapsulation
} from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  // template: '<div>test</div>',
  template: `
    <h2>Accounts</h2>
    <a [routerLink]="['/main']">main</a>
  `,
  encapsulation: ViewEncapsulation.Native,
  styles: [
    require('./accounts.style.scss')
  ]
})
export class AccountsComponent {
  statusMessage: string;
  email: string;
  password: string;
  constructor(
    public authService: AuthService,
    public router: Router
  ) {}
  setStatusMessage(message: string) {
    this.statusMessage = message;
  }
}