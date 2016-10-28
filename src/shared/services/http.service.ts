import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../../auth/auth.service';

 // ******** write interface for token object

@Injectable()
export class HttpService {
  constructor(
    private http: Http,
    private authService: AuthService
  ) {}
  protected createAuthHeader(headers: Headers, tokenObj) {
    headers.append('Authorization', `Bearer ${tokenObj.access_token}`);
  }
  private bearerIsExpired(tokenObj) {
    let currentTime = Math.round(new Date().getTime() / 1000);
    if (currentTime >= (tokenObj.time + tokenObj.expires_in)) {
      // the token has expired
      return true;
    } else {
      // continue
      return false;
    }
  }
  public get(url, tokenObj?) {
    // set current token object if it's not explicitly passed
    tokenObj = (tokenObj) ? tokenObj : this.authService.accounts[this.authService.currentAccount];
    if (this.bearerIsExpired(tokenObj)) {
      // refresh the token
      // run the query
      // ***********
    } else {
      let headers = new Headers();
      this.createAuthHeader(headers, tokenObj);
      return this.http.get(url, { headers })
    }
  }
  public post(url, data, tokenObj?) {
    // set current token object if it's not explicitly passed
    tokenObj = (tokenObj) ? tokenObj : this.authService.accounts[this.authService.currentAccount];
    if (this.bearerIsExpired(tokenObj)) {
      // refresh the token
      // run the query
      // ***********
    } else {
      let headers = new Headers();
      this.createAuthHeader(headers, tokenObj);
      return this.http.post(url, data, { headers });
    }
  }
}