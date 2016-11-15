import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Headers } from '@angular/http';
import { AuthService, AccountTokenInterface } from '../../auth/auth.service';

@Injectable()
export class HttpService {
  constructor(
    private http: Http,
    private authService: AuthService
  ) {}
  public get(url: string, tokenObj?: AccountTokenInterface): Observable<any> {
    // set current token object if it's not explicitly passed
    tokenObj = (tokenObj) ? tokenObj : this.authService.accounts[this.authService.currentAccount];
    if (this.authService.bearerIsExpired(tokenObj)) {
      // refresh the token
      return this.authService.refreshToken(tokenObj)
        .flatMap((token) => {
          // continue with request after fetching new token
          let headers = new Headers();
          this.authService.createGETHeader(headers, token);
          return this.http.get(url, { headers })
        })
    } else {
      let headers = new Headers();
      this.authService.createGETHeader(headers, tokenObj);
      return this.http.get(url, { headers })
    }
  }
  public post(url: string, data: any, tokenObj?: AccountTokenInterface): Observable<any> {
    // set current token object if it's not explicitly passed
    tokenObj = (tokenObj) ? tokenObj : this.authService.accounts[this.authService.currentAccount];
    if (this.authService.bearerIsExpired(tokenObj)) {
      // refresh the token
      return this.authService.refreshToken(tokenObj)
        .flatMap((token) => {
          // continue with request after fetching new token
          let headers = new Headers();
          this.authService.createGETHeader(headers, token);
          return this.http.post(url, { headers })
        })
    } else {
      let headers = new Headers();
      this.authService.createGETHeader(headers, tokenObj);
      return this.http.post(url, data, { headers });
    }
  }
}