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
import { isEmpty, isArray, isNumber } from 'lodash';

import { config } from '../../config/config';

@Injectable()
export class AuthService {
  // private jwtDecode = JwtDecode;
  // public userInfo: UserInfoInterface = null; // public block of user info exposed by class methods
  public userInfoToken: string;
  // site info and change emitter
  // public currentSite: SiteAccessInterface = null;

  public accountsUpdated = new Subject();
  // this will hold all the user account and token info
  public accounts = [];
  // index of accounts array
  public currentAccount: number = null;
  constructor(
    // basic http service
    private http: Http,
    // http service that requires a current account token
    private router: Router,
    @Inject('Window') private window: Window
  ) {
    // // console.log(this.window)
    // storage.clear(function(error) {
    //   if (error) throw error;
    // });
    // this.setAccess().subscribe((d) => {
    //     console.log(d)
    // })
  }

  // *************
  // TODO
  // build http service that will refresh the token if its older than an hour
  // function to remove accounts - also changing current active account if needed
  // change current account dropdown selector and function
  // - sends broadcast out for listeners to refresh
  // dont forget to verify the random code generation when requesting token
  // close all windows on startup and exit
  // - don't store session in account windows

  requestAuthToken(code: string): Observable<any> {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + this.window.btoa(config.reddit.client_id + ':'));
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let url = 'https://www.reddit.com/api/v1/access_token';
    let body = `grant_type=authorization_code&code=${code}&redirect_uri=${config.reddit.uri}`;
    return this.http.post(url, body, { headers }).retry(3).map(res => res.json())
  }
  refreshToken(): Observable<any> {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + this.window.btoa(config.reddit.client_id + ':'));
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let url = 'https://www.reddit.com/api/v1/access_token';
    let body = `grant_type=refresh_token&refresh_token=${this.accounts[this.currentAccount].refresh_token}`;
    return this.http.post(url, body, { headers }).retry(3).map(res => res.json())
      // .do((token) => {
      //   console.log('token', token)
      //   // store the new token's refresh and barer info
      //   if (token) {
      //     // ***************
      //   }
      // })
  }
  public storeAuthToken(token) {
    // attach current unix time to the token
    token.time = Math.round(new Date().getTime() / 1000);

    // get info for specific token and keep it in session
    this.getAccountInfo(token).subscribe((accountInfo:any) => { // ********** add interface for info object
      // do nothing if the account already exists in the accounts array
      let accountExists = false;
      for (let i = 0, len = this.accounts.length; i < len; i++) {
        if (this.accounts[i].info.name === accountInfo.name) {
          accountExists = true;
          break;
        }
      }
      if (accountExists) {
        alert(`${accountInfo.name} is already in your list of accounts.`);
        return; // do nothing after alert
      }

      // pull from accounts settings, where this token will be stored
      storage.get('accounts', (error, accountSettings) => {
        let settingsToSave = { list: [], current: 0 } // our default save object
        // if the settings aren't there alreadt
        if ((isEmpty(accountSettings)) || (!accountSettings.hasOwnProperty('list')) || (!isArray(accountSettings.list))) {
          accountSettings = settingsToSave;
        }
        accountSettings.list.push(token); // push the new token to settings that we'll save
        accountSettings.current = accountSettings.list.length - 1; // set current to the last item added
        // store the values
        storage.set('accounts', accountSettings, () => {
          if (error) throw error;
          // now that the token is saved to memory, add the user info to the token
          token.info = accountInfo;
          // push to session accounts list
          this.accounts.push(token);
          // set current account to the one we just added
          this.currentAccount = this.accounts.length - 1;
        })
      })
    }, (err) => {
      // error getting account info from reddit
      if (err) {
        alert('Something went wrong, please try again.');
      }
    })
  }
  public getAllAccountsInfo() {
    // pull account info from store
    storage.get('accounts', (error, accountSettings) => { // *********** add interface
      // if ((!isArray(accounts.list)) || (!isNumber(accounts.current))) {
      //   // do something if the fetched values are not correct
      //   // ***********
      // } else {
      if (error) {
        // do something
        return;
      }
      let arr = [];
      for (let i = 0, len = accountSettings.list.length; i < len; i++) {
        arr.push(this.getAccountInfo(accountSettings.list[i]))
      }
      // get array of all accounts' info concurrently
      Observable.forkJoin(arr)
      .subscribe((infoArray) => {
        // loop through info array and push the accountSettings to the session object with the tokens
        for (let i = 0, len = infoArray.length; i < len; i++) {
          let obj = accountSettings.list[i];
          obj.info = infoArray[i];
          this.accounts.push(obj);
        }
        // also set the current account index
        this.currentAccount = accountSettings.current;
        // broadcast the complete event now
        this.accountsUpdated.next();
      }, (error) => {
        // do something
      });
    });
    // ************* TODO
    // get all accoutns info with tokens and push to values in session
    // ALSO set the current site (pull from storage)
    // *************
  }
  private getAccountInfo(tokenObj) {
    // call http service with token defined
    return this.get('https://oauth.reddit.com/api/v1/me', tokenObj)
      .map(res => res.json());
  }
  ////////////////
  // HTTP STUFF //
  ////////////////
  // NOTE: the HttpService exists in 'shared' with very similar methods.
  // We can't use that here because that requires AuthService (this) as a dependancy
  // and this is not fully initalized if we injected the HttpService in the constructor.
  private bearerIsExpired(tokenObj) {
    let currentTime = Math.round(new Date().getTime() / 1000);
    if (currentTime >= (tokenObj.time + tokenObj.expires_in)) {
      // the token has expired
      return true;
    } else {
      // coninue
      return false;
    }
  }
  protected createGETHeader(headers: Headers, tokenObj) {
    headers.append('Authorization', `Bearer ${tokenObj.access_token}`);
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
  }
  private get(url, tokenObj?) {
    // set current token object if it's not explicitly passed
    tokenObj = (tokenObj) ? tokenObj : this.accounts[this.currentAccount];
    if (this.bearerIsExpired(tokenObj)) {
      console.log('BARER expired')
      // refresh the token
      // run the query
      // this.refreshToken()
      //   .subscribe()
      // ***********
    } else {
      let headers = new Headers();
      this.createGETHeader(headers, tokenObj);
      return this.http.get(url, { headers }).retry(3);
    }
  }
  /////////////////
  // AUTH GUARDS //
  /////////////////
  public isAuthenticated() {
    console.log(this.accounts, this.currentAccount)
    let haskeyObservable:any = Observable.bindCallback(storage.has);
    let key = haskeyObservable('accounts');
    return key.map((d) => {
      let keyExists = d[1];
      // if token and no info, get info
      if (keyExists && (this.accounts.length === 0)) {
        // run the function that will collect user info for tokens
        // main component should run loading sequence till this function fires a finished event
        this.getAllAccountsInfo();
        return true
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

}