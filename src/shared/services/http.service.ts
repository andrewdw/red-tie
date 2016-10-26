import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class HttpService {
    constructor(
        private http: Http,
        private authService: AuthService
    ) {}
    protected createAuthHeader(headers: Headers) {
        // ************* need token in header
        headers.append('Authorization', 'Bearer '+ this.authService.userInfoToken);
        // headers.append('site', JSON.stringify(this.authService.currentSite));
    }
    barerIsExpired() {
        // grab token time and current time and check if the token is expired
        let token = this.authService.accounts[this.authService.currentAccount];
        let currentTime = Math.round(new Date().getTime() / 1000);
        if ((token.time + token.expires_in) >= currentTime) {
            // the token has expired
            return true;
        } else {
            // coninue
            return false;
        }
    }
    public get(url) {
        if (this.barerIsExpired()) {
            // refresh the token
            // run the query
            // ***********
        } else {
            let headers = new Headers();
            this.createAuthHeader(headers);
            return this.http.get(url, { headers })
        }
    }
    public post(url, data) {
        if (this.barerIsExpired()) {
            // refresh the token
            // run the query
            // ***********
        } else {
            let headers = new Headers();
            this.createAuthHeader(headers);
            return this.http.post(url, data, { headers });
        }
    }
}