import {
  Component,
  ViewEncapsulation,
  Inject
} from '@angular/core';

import {
  Headers,
  Http,
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { config } from '../../../config/config';
import * as random from 'randomstring';

// services
import { AuthService } from '../auth.service';
const { remote } = require('electron');
let { BrowserWindow } = remote;

// TODO
// - relay tokens to server and bcrypt them with in session secret
// - make browserwindow forget the reddit session after close

@Component({
  template: `
    <h2>Accounts</h2>
    <a [routerLink]="['/main']">main</a>
    <a (click)="addAccount()">Add account</a>
  `,
  encapsulation: ViewEncapsulation.Native,
  styles: [
    require('./accounts.style.scss')
  ],
  providers: [
    { provide: 'Window',  useValue: window }
  ]
})
export class AccountsComponent {
  authWindow: any = null;
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: Http,
    @Inject('Window') private window: Window
  ) {}
  addAccount(): void {
    this.authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      'node-integration': false,
      // kiosk: true
      // webPreferences: {
      //   partition: 'tempsession'
      //   // session: {}
      // }
      // webPreferences: {
      //   partition: 'persist:xx'
      // }
    });
    let randomString = random.generate(); // reddit's oaith requires a random string to be passed as `state` in url
    let redditUrl = 'https://www.reddit.com/api/v1/authorize?';
    let authUrl = `
      ${redditUrl}client_id=${config.reddit.client_id}&response_type=code&state=${randomString}&redirect_uri=${config.reddit.uri}&duration=${config.reddit.duration}&scope=${config.reddit.scope}
    `;
    this.authWindow.loadURL(authUrl);
    this.authWindow.show();
    // listen for redirect requests
    this.authWindow.webContents.on('did-get-redirect-request', (event: any, oldUrl: string, newUrl: string) => {
      this.handleAuthCallback(newUrl, randomString);
    });
    // Reset the authWindow on close
    this.authWindow.on('close', () => {
      this.authWindow = null;
    }, false);
  }
  handleAuthCallback(url: string, randomString: string): void {
    // process code
    var raw_code = /code=([^&]*)/.exec(url) || null;
    var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    // process state
    var raw_state = /state=([^&]*)/.exec(url) || null;
    var state = (raw_state && raw_state.length > 1) ? raw_state[1] : null;
    // process error
    var error = /error=(.+)$/.exec(url);
    if (code || error) {
      // Close the auth window if code found or error
      this.authWindow.destroy();
    }
    // If there is a code, proceed to get token from github
    if (code) {
      // proceed only if the state matched the random string
      if (state !== randomString) {
        alert(`Oops! Something went wrong and we couldn't log you in to Reddit. Please try again.`);
        return;
      }
      this.authService.requestAuthToken(code)
        .flatMap((token) => {
          return this.authService.storeNewAuthToken(token);
        })
        .subscribe(() => {},
          (err) => {
            alert(err);
          }
        )
    } else if (error) {
      alert(`Oops! Something went wrong and we couldn't log you in to Reddit. Please try again.`);
    }
  }
}