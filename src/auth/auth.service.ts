import {
  Injectable,
  Inject
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
// routing
import { Router } from '@angular/router';
// basic http services
import { Http, Headers } from '@angular/http';
// storage
const storage = require('electron-json-storage');
import { isEmpty, isArray } from 'lodash';

import { config } from '../../config/config';

// // Site access interface
// export interface SiteAccessInterface {
//   client: string;
//   lat: number;
//   long: number;
//   position: string;
//   sensor: string;
//   site: string;
//   LatLng: {
//     lat: number,
//     lng: number
//   };
// }
// // user info object
// export interface UserInfoInterface {
//   Email: string;
//   UserID: string;
//   Access: Array<SiteAccessInterface>;
// }

@Injectable()
export class AuthService {
  // private jwtDecode = JwtDecode;
  // public userInfo: UserInfoInterface = null; // public block of user info exposed by class methods
  public userInfoToken: string;
  // site info and change emitter
  // public currentSite: SiteAccessInterface = null;
  // public currentSiteChanged = new Subject();


  public currentAccount = null;
  // this will hold all the user account and token info
  public accounts = [];

  constructor(
    private http: Http,
    private router: Router,
    @Inject('Window') private window: Window
  ) {
    // pull tokens from the accounts object

    storage.get('accounts', function(error, data) {
      if (error) throw error;

      console.log(data);
    });


    // console.log(this.window)
//     storage.clear(function(error) {
//   if (error) throw error;
// });
    // this.setAccess().subscribe((d) => {
    //     console.log(d)
    // })
  }
  public getInfoToken () {
    return this.userInfoToken;
  }
  private setUserInfo(token: string) {
    // // let info = this.jwtDecode(token);
    // this.userInfo = info;
    // this.userInfoToken = token;
    // // we have to loop through any access values and put the lat and long
    // // into a LatLng key for leaflet to properly read
    // for (let i = 0, len = this.userInfo.Access.length; i < len; i++) {
    //     this.userInfo.Access[i].LatLng = {
    //         lat: this.userInfo.Access[i].lat,
    //         lng: this.userInfo.Access[i].long
    //     }
    // }
    // // when setting info get or set the current site info
    // this.setCurrentSite();
  }
  public siteInfoEdited(oldInfo:any, newInfo:any) {

  }
  public setCurrentSite(site) {
    // // TODO: pull from settings if there are any saved
    // if (!site) {
    //     this.currentSite = (this.userInfo.Access.length > 0) ? this.userInfo.Access[0] : null;
    // } else {
    //     this.currentSite = site;
    // }
    // this.currentSiteChanged.next(this.currentSite);
  }
  public login(email: string, password: string) {
    // let creds = "username=" + email + "&password=" + password;
    // let headers = new Headers();
    // headers.append('Content-Type', 'application/x-www-form-urlencoded');
    // return this.http.post(config.authentication+'/login', creds, { headers })
    // .map(res => res.json())
    // .map((res) => {
    //     // set 2fa status based on what is returned from server
    //     let twoFactor = (res['2FA']) ? true : false;
    //     if (res.hasOwnProperty('token') && twoFactor) {
    //         sessionStorage.setItem('tfa_token', res.token);
    //     } else {
    //         sessionStorage.setItem('auth_token', res.token);
    //     }
    //     return twoFactor;
    // })
  }
  public submitTfa(tfa: string) {
    // let creds = "totp="+tfa;
    // let headers = new Headers();
    // headers.append('Authentication', 'Bearer ' + sessionStorage.getItem('tfa_token'))
    // return this.http.post(config.authentication+'/login/2fa', creds, { headers })
    // .map(res => res.json())
    // .map((res) => {
    //     // if a token is sent back, delete the tfa token and set new auth token
    //     if (res.hasOwnProperty('token')) {
    //         sessionStorage.removeItem('tfa_token');
    //         sessionStorage.setItem('auth_token', res.token);
    //     }
    // })
  }
  public setAccess() {
    // let creds = `email=test@rapidphire.com&access=[{"client":"newClient","site":"newSite-Corp"}, {"client":"davita","site":"phirelight-dev"}]`
    // let headers = new Headers();
    // headers.append('Authorization', 'Bearer ' + sessionStorage.getItem('auth_token'));
    // headers.append('Content-Type', 'application/x-www-form-urlencoded');
    // return this.http.post(config.authorization+'/api/v1/user/access', creds, { headers })
    // .map(res => res.json())
    // .do((d) => {
    //     console.log(d)
    // })
  }
  private fetchUserInfo() {
    // let headers = new Headers();
    // headers.append('Authorization', 'Bearer ' + sessionStorage.getItem('auth_token'))
    // return this.http.get(config.authorization+'/api/v1/user/bootstrap', { headers })
    //     .map(res => res.json())
    //     .map((res) => {
    //         if (res.hasOwnProperty('token')) {
    //             this.setUserInfo(res.token);
    //             return true;
    //         } else {
    //             this.logout();
    //             return false;
    //         }
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //         this.logout();
    //         return Observable.of(false);
    //     })
  }
  // getAccess() {
  //     let headers = new Headers();
  //     headers.append('Authorization', 'Bearer ' + sessionStorage.getItem('auth_token'))
  //     return this.http.get(config.authorization+'/api/v1/user/access', { headers })
  //         .map(res => res.json())
  //         .catch((err) => {
  //             console.log(err);
  //             return Observable.of(false);
  //         })
  // }


  // *************
  // TODO
  // build http service that will refresh the token if its older than an hour
  // function to remove accounts - also changing current active account if needed
  // change current account dropdown selector and function
  // - sends broadcast out for listeners to refresh
  // dont forget to verify the random code generation when requesting token

  requestAuthToken(code: string): Observable<any> {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + this.window.btoa(config.reddit.client_id + ':'));
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let url = 'https://www.reddit.com/api/v1/access_token';
    let body = `grant_type=authorization_code&code=${code}&redirect_uri=${config.reddit.uri}`;
    return this.http.post(url, body, { headers }).map(res => res.json())
  }
  refreshToken(): Observable<any> {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + this.window.btoa(config.reddit.client_id + ':'));
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let url = 'https://www.reddit.com/api/v1/access_token';
    let body = `grant_type=refresh_token&refresh_token=${this.accounts[this.currentAccount].refresh_token}`;
    return this.http.post(url, body, { headers })
      .map(res => res.json())
      .do((token) => {
        // store the new token's refresh and barer info
        if (token) {
          // ***************
        }
      })
  }
  storeAuthToken(token) {
    // attach current unix time to the token
    token.time = Math.round(new Date().getTime() / 1000);
    // check to see if there is even an object to store the token in
    storage.get('accounts', function(error, accounts) {
      if (error) throw error;
      // *************
      // get info for specific token and keep it in session
      // do nothing if there is an existing account stored
      // if not, push to in session list
      // *************
      console.log(token)
      // if no tokens at all
      if ((isEmpty(accounts)) || (!accounts.hasOwnProperty('list')) || (!isArray(accounts.list))) {
        // store the token
        storage.set('accounts', { list: [ token ], current: 0 }, () => { // store current account index
          if (error) throw error;
          // set the current account to the only added index
          this.currentAccount = 0;
          // *********** also setup the session accounts list here
          // and by setup, just push it - it should already have been created when getting info
        })
      } else {
        accounts.push(token); // add new token to the list
        // TODO: check for duplicates
        // store the list
        let current = accounts.length-1; // get last index
        storage.set('accounts', { list: accounts, current: current }, () => {
          if (error) throw error;
          // do something
          // set current account to the one we just added
          this.currentAccount = current;
          // *********** also setup the session accounts list here
          // and by setup, just push it - it should already have been created when getting info
        })
      }
    });
  }
  getAccountInfo(token) {

  }
  // AUTH GUARDS
  public isAuthenticated() {
    let haskeyObservable:any = Observable.bindCallback(storage.has);
    let key = haskeyObservable('accounts');
    return key.map((d) => {
      let keyExists = d[1];
      // if token and no info, get info
      if (keyExists && (!this.accounts)) {
        return this.getAllAccountsInfo();
      // if token (imply that there is info), continue
      } else if (keyExists) {
        return true;
      } else {
        // else reject to accounts page
        this.router.navigate(['/accounts']);
        return false;
      }
    })
  }
  public getAllAccountsInfo() {
    // ************* TODO
    // get all accoutns info with tokens and push to values in session
    // ALSO set the current site (pull from storage)
    // *************
    console.log('getting accounts info')
    return true;
  }
  public isLoggedOut() {
    // // return true or false based on auth_token being present
    // if (!!sessionStorage.getItem('auth_token')) {
    //     this.router.navigate(['/live']);
    //     return false;
    // }
    return true;
  }
  public isTfa() {
    // if (!!sessionStorage.getItem('tfa_token')) {
    //   return true;
    // }
    this.router.navigate(['/main']);
    return false;
  }
}