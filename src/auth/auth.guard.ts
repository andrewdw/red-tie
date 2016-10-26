import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';
import { AuthService } from './auth.service';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService
  ) {}
  canActivate() {
    return this.authService.isAuthenticated();
  }
}

// LoginGuard is a simple CanActivate class to block access to the login page
// if the user has already logged in
@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService
  ) {
    // delete tfa token if it exists when going to login page
    if (!!sessionStorage.getItem('tfa_token')) {
      sessionStorage.removeItem('tfa_token');
    }
  }
  canActivate() {
    return this.authService.isLoggedOut();
  }
}

// block access to tfa page if the user does not have a token
@Injectable()
export class TwoFactorGuard implements CanActivate {
  constructor(
    private authService: AuthService
  ) {}
  canActivate() {
    return this.authService.isTfa();
  }
}