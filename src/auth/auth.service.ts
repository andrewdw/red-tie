import {
  Injectable,
  Inject
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
const Rx = require('rxjs/Rx')
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

// import { test } from '../../../observable-json-storage';

const ojs = require("observable-json-storage");
console.log('json store module', ojs)


// var test2 = require('observable-json-storage')
// console.log(test2)

interface AccountToken {
  access_token: string;
  device_id?: string; // only present in refresh response, not ofiginal request
  expires_in: number;
  scope: string;
  time: number;
  token_type: string;
  refresh_token?: string; // only present in original request
  info?: any; // account info sent back from reddit
}

@Injectable()
export class AuthService {
  // private jwtDecode = JwtDecode;
  // public userInfo: UserInfoInterface = null; // public block of user info exposed by class methods
  public userInfoToken: string;
  // site info and change emitter
  public accountsUpdated = new Subject();
  // this will hold all the user account and token info
  public accounts = [];
  // index of accounts array
  public currentAccount: number = null;
  constructor(
    private http: Http,
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
    console.log('running get')
    // ojs.set('accounts', { key: 'value' }).subscribe(() => {
    //   console.log('SUCCESS save')
    // })

    // ojs.keys().subscribe((keys) => {
    //   console.log('KEYS')
    //   console.log(keys)
    // }, (err) => {
    //   console.log('KEYS ERR')
    //   console.log(err)
    // })

    // ojs.has('accounts').subscribe((data) => {
    //   console.log('HAS')
    //   console.log(data)
    // }, (err) => {
    //   console.log('HAS ERR')
    //   console.log(err)
    // })

    // ojs.set('accounts', {'key': 'value'}).subscribe((data) => {
    //   console.log('SET')
    //   console.log(data)
    // }, (err) => {
    //   console.log('SET ERR')
    //   console.log(err)
    // })

    // ojs.remove('test').subscribe((data) => {
    //   console.log('HAS')
    //   console.log(data)
    // }, (err) => {
    //   console.log('HAS ERR')
    //   console.log(err)
    // })

    // ojs.clear().subscribe(() => {
    //   console.log('cleared')
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
    return this.http.post(url, body, { headers }).retry(3).map(res => res.json());
  }
  refreshSpecificToken(tokenObj): any {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + this.window.btoa(config.reddit.client_id + ':'));
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let url = 'https://www.reddit.com/api/v1/access_token';
    let body = `grant_type=refresh_token&refresh_token=${tokenObj.refresh_token}`;
    console.log('pausing token refresh here')
    return
    return this.http.post(url, body, { headers }).retry(3).map(res => res.json());
  }
  storeRefreshToken(token) {
    // take refresh token and put it in the current
  }
  public storeNewAuthToken(token:AccountToken) {
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
  public getAllAccountsInfo(): void {
    return ojs.get('accounts')
      .map((accounts) {
        console.log('accounts', accounts)
      })

    // return Observable.create((observer) => {

    // }).first()

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
  }
  private getAccountInfo(tokenObj:AccountToken) {
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
  private get(url, tokenObj?): Observable<any> {
    // set current token object if it's not explicitly passed
    tokenObj = (tokenObj) ? tokenObj : this.accounts[this.currentAccount];
    console.log('is barer expired', this.bearerIsExpired(tokenObj), tokenObj)
    if (this.bearerIsExpired(tokenObj)) {
      console.log('THIS BEARER expired')
      // we need to chain the refresh function to the get request
      let oldTokenObj = tokenObj; // rename it to limit confusion later
      let accountSettings, tokenIndex = 0;
      let getSettingsObservable:any = Observable.bindCallback(storage.get);
      let setSettingsObservable:any = Observable.bindCallback(storage.set);
      return getSettingsObservable('accounts').flatMap((d) => {
        // TODO: do something with the error (d[0])
        // store the account settings into our local variable declared above
        accountSettings = d[1];
        // now look for refresh the token also declared above
        return this.refreshSpecificToken(oldTokenObj);
      })
      .flatMap((token) => {
        // when we store the token later we need to know which index item it is.. so lets search here
        for (let i = 0, len = accountSettings.list.length; i < len; i++) {
          // compare the old token with the access settings
          if (accountSettings.list[i].access_token === oldTokenObj.access_token) {
            console.log('found index')
            tokenIndex = i; // set index
            break; // end loop
          }
        }
        // store token in local variable
        // attach current unix time to the new token
        token.time = Math.round(new Date().getTime() / 1000);
        // NOTE: The new token is identical to the user token except it does NOT have the `refresh_token` key present...
        // so we'll add it to the new token from the old
        token.refresh_token = oldTokenObj.refresh_token;
        // put the new token back to our accounts list
        accountSettings.list[tokenIndex] = token;
        // if the session accounts list is built, also put the relevant info there
        if (this.accounts.length > 0) {
          let tempOldObj = this.accounts[tokenIndex];
          // we create a temp new object because we dont't want the account info (username, etc..) stored in the localSorage
          let tempNewObj = Object.create(token);
          tempNewObj.info = tempOldObj.info;
          this.accounts[tokenIndex] = tempNewObj;
        }
        console.log('----------')
        console.log('new token object', token)
        console.log('settings to save', accountSettings)
        console.log('this token index', tokenIndex)
        console.log('session accounts', this.accounts)
        console.log('----------')
        // save the token
        // return setSettingsObservable('accounts', accountSettings);
      })
      .map((d) => {
        // continue with data request
        console.log('---------------')
        console.log('saved', d);
        console.log(accountSettings.list[tokenIndex])
        console.log('---------------')
        let headers = new Headers();
        this.createGETHeader(headers, accountSettings.list[tokenIndex]);

        //***************
        setTimeout(()=> {
          storage.get('accounts', (error, accountSettings) => { // *********** add interface
            console.log('got settings', accountSettings)
          }, 6000)
        })
        //**************

        return this.http.get(url, { headers })
      })
    } else {
      let headers = new Headers();
      this.createGETHeader(headers, tokenObj);
      return this.http.get(url, { headers })
    }
  }
  /////////////////
  // AUTH GUARDS //
  /////////////////
  public isAuthenticated() {
    return Observable.create((observer) => {
      ojs.has('accounts')
      .flatMap((keyExists) => {
        if (keyExists && (this.accounts.length === 0)) {
          return Observable.of(true);
        } else if (keyExists) {
          return Observable.of(true);
        } else {
          // else reject to accounts page
          this.router.navigate(['/accounts']);
          return Observable.of(false);
        }
      })
      .subscribe((res) => {
        console.log(res)
        // if token and no info, get info
        observer.next(res);
        observer.complete();
      })
      // .subscribe((keyExists) => {
      //   // if token and no info, get info
      //   if (keyExists && (this.accounts.length === 0)) {
      //     console.log('has key')
      //     return observer.next(true);
      //   } else if (keyExists) {
      //     return observer.next(true);
      //   } else {
      //     // else reject to accounts page
      //     this.router.navigate(['/accounts']);
      //     return observer.next(false);
      //   }
      // })
    }).first();
    // console.log(this.accounts, this.currentAccount)
    // let haskeyObservable:any = Observable.bindCallback(storage.has);
    // let key = haskeyObservable('accounts');
    // return key.map((d) => {
    //   let keyExists = d[1];
    //   // if token and no info, get info
    //   if (keyExists && (this.accounts.length === 0)) {
    //     // run the function that will collect user info for tokens
    //     // main component should run loading sequence till this function fires a finished event
    //     this.getAllAccountsInfo();
    //     console.log('getting all accounts info')
    //     return true;
    //   // if token (imply that there is info), continue
    //   } else if (keyExists) {
    //     return true;
    //   } else {
    //     // else reject to accounts page
    //     this.router.navigate(['/accounts']);
    //     return false;
    //   }
    // })
  }

}