import {
  Injectable
} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

import { Router } from '@angular/router';

// basic http services
import { Http, Headers } from '@angular/http';

// import { config } from '../../config';


// Site access interface
export interface SiteAccessInterface {
  client: string;
  lat: number;
  long: number;
  position: string;
  sensor: string;
  site: string;
  LatLng: {
    lat: number,
    lng: number
  };
}
// user info object
export interface UserInfoInterface {
  Email: string;
  UserID: string;
  Access: Array<SiteAccessInterface>;
}

@Injectable()
export class AuthService {
  // private jwtDecode = JwtDecode;
  public userInfo: UserInfoInterface = null; // public block of user info exposed by class methods
  public userInfoToken: string;
  // site info and change emitter
  public currentSite: SiteAccessInterface = null;
  public currentSiteChanged = new Subject();
  constructor(
    private http: Http,
    private router: Router
  ) {
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
  public setCurrentSite(site?:SiteAccessInterface) {
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
  public logout() {
    // clear local and session vars then redirect
    // this.userInfo = null;
    // // remove auth token
    // sessionStorage.removeItem('auth_token');
    // // redirect user to login page
    // this.router.navigate(['/login']);
  }
  // AUTH GUARDS
  public isLoggedIn() {
    // // fetch user info before returning true if auth_token is present
    // if ((!this.userInfo) && (!!sessionStorage.getItem('auth_token'))) {
    //     return this.fetchUserInfo();
    // // if both info and token exist, return true
    // } else if (!!sessionStorage.getItem('auth_token')) {
    //     return Observable.of(true);
    // // otherwise reject access
    // } else {
    //     this.router.navigate(['/login']);
    //     return Observable.of(false);
    // }
    return true
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