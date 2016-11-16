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
const storage = require("observable-json-storage");

import { isEmpty, isArray, isNumber } from 'lodash';
import { config } from '../../config/config';

export interface AccountTokenInterface {
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
  // site info and change emitter
  // public accountsUpdated = new Subject();
  // this will hold all the user account and token info
  public accounts = [];
  // index of accounts array
  public currentAccount: number = null;
  // our values for our save queue for account settings
  public activeFileSave = false;
  constructor(
    private http: Http,
    private router: Router,
    @Inject('Window') private window: Window
  ) {}

  // *************
  // TODO
  // build http service that will refresh the token if its older than an hour
  // function to remove accounts - also changing current active account if needed
  // change current account dropdown selector and function
  // - sends broadcast out for listeners to refresh
  // dont forget to verify the random code generation when requesting token
  // close all windows on startup and exit
  // - don't store session in account windows

  requestAuthToken(code: string): any {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + this.window.btoa(config.reddit.client_id + ':'));
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let url = 'https://www.reddit.com/api/v1/access_token';
    let body = `grant_type=authorization_code&code=${code}&redirect_uri=${config.reddit.uri}`;
    return this.http.post(url, body, { headers }).retry(3).map(res => res.json());
  }
  refreshTokenRequest(tokenObj: AccountTokenInterface): any {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + this.window.btoa(config.reddit.client_id + ':'));
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let url = 'https://www.reddit.com/api/v1/access_token';
    let body = `grant_type=refresh_token&refresh_token=${tokenObj.refresh_token}`;
    return this.http.post(url, body, { headers }).retry(3).map(res => res.json());
  }
  public storeNewAuthToken(token: AccountTokenInterface): any {
    // attach current unix time to the token
    token.time = Math.round(new Date().getTime() / 1000);
    // get info for specific token and keep it in session
    return this.getAccountInfo(token)
      .flatMap((accountInfo:any) => {
        // do nothing if the account already exists in the accounts array
        let accountExists = false;
        for (let i = 0, len = this.accounts.length; i < len; i++) {
          if (this.accounts[i].info.name === accountInfo.name) {
            accountExists = true;
            break;
          }
        }
        if (accountExists) {
          return Observable.throw(new Error(`${accountInfo.name} is already in your list of accounts.`))
        }
        // if account doesn't exist in local list, pull stored accounts
        return storage.get('accounts')
          .flatMap((accountSettings) => {
            let settingsToSave = { list: [], current: 0 } // our default save object
            if ((!accountSettings) || (isEmpty(accountSettings)) || (!accountSettings.hasOwnProperty('list')) || (!isArray(accountSettings.list))) {
              accountSettings = settingsToSave;
            }
            accountSettings.list.push(token); // push the new token to settings that we'll save
            accountSettings.current = accountSettings.list.length - 1; // set current to the last item added
            // save the settings to the file system
            return storage.set('accounts', accountSettings)
              .do(() => {
                // now that the token is saved to memory, add the user info to the token
                token.info = accountInfo;
                // push to session accounts list
                this.accounts.push(token);
                // set current account to the one we just added
                this.currentAccount = this.accounts.length - 1;
              })
          })
      })
  }
  public getAllAccountsInfo(): any {
    return Observable.create((observer) => {
      let settings;
      storage.get('accounts')
        .flatMap((accountSettings) => {
          settings = accountSettings;
          let arr = [];
          for (let i = 0, len = settings.list.length; i < len; i++) {
            arr.push(this.getAccountInfo(settings.list[i]));
          }
          return Observable.forkJoin(arr);
        })
        .subscribe((infoArray) => {
          // we get an ordered list of account info returned, place them in session in the order recieved
          for (let i = 0, len = infoArray.length; i < len; i++) {
            let obj = settings.list[i];
            obj.info = infoArray[i];
            this.accounts.push(obj);
          }
          // also set the current account index
          this.currentAccount = settings.current;
          observer.next(true); // complete request
          observer.complete();
        },
        (err) => {
          alert('There was an error getting your account info. Please try again in a few minutes.');
          observer.next(false);
          observer.complete();
        })
    }).first();
  }
  private getAccountInfo(tokenObj: AccountTokenInterface) {
    // call http service with token defined
    return this.get('https://oauth.reddit.com/api/v1/me', tokenObj)
      .map(res => res.json());
  }
  public refreshToken(tokenObj: AccountTokenInterface) {
    return Observable.create((observer) => {
      // we need to concurrently load the stored settings and refresh the expired token
      Observable.forkJoin([
        storage.get('accounts'),
        this.refreshTokenRequest(tokenObj)
      ])
      .subscribe((data) => {
        // assign our return to easier to read values
        let accountSettings:any = data[0];
        let newRefreshedToken:any = data[1];
        let tokenIndex:number = 0; // we'll find out which setting index to replace below
        // when we store the new token later we need to know which index item it is.. so lets search here
        for (let i = 0, len = accountSettings.list.length; i < len; i++) {
          // compare the old token with the access settings
          if (accountSettings.list[i].access_token === tokenObj.access_token) {
            tokenIndex = i; // set index
            break; // end loop
          }
        }
        // store token in local variable
        // attach current unix time to the new token
        newRefreshedToken.time = Math.round(new Date().getTime() / 1000);
        // NOTE: The new token is identical to the user token except it does NOT have the `refresh_token` key present...
        // so we'll add it to the new token from the old
        newRefreshedToken.refresh_token = tokenObj.refresh_token;
        this.settingSaveQueue(newRefreshedToken, tokenIndex).subscribe(() => {
          // if the accounts list IN SESSION is built, also put the relevant info there
          if (this.accounts.length > 0) {
            let tempOldObj = this.accounts[tokenIndex];
            // we create a temp new object because we dont't want the account info (username, etc..) stored in the localSorage
            let tempNewObj = Object.create(newRefreshedToken);
            tempNewObj.info = tempOldObj.info;
            this.accounts[tokenIndex] = tempNewObj;
          }
          // send new token and complete observer
          observer.next(newRefreshedToken);
          observer.complete();
        })
      })
    }).first();
  }
  // to solve the issue of concurrent saves breaking things, we need a set queue
  private settingSaveQueue(tokenObj: AccountTokenInterface, index: number) {
    let interval;
    return Observable.create((observer) => {
      let trySave = () => {
        return this.window.setInterval(() => {
          // do nothing if save in progress
          if (this.activeFileSave) { return }
          // once no longer active, set it again
          this.activeFileSave = true;
          // continue with saving
          // get account settings again
          storage.get('accounts')
            .flatMap((accountSettings) => {
              // put the new token back to our accounts list
              accountSettings.list[index] = tokenObj;
              // now save the new token object
              return storage.set('accounts', accountSettings);
            })
            .subscribe(() => {
              observer.next();
              observer.complete();
              // set active back to false
              this.activeFileSave = false;
            }, (err) => {
              // do something on err
              // *********************
            })
        }, 10) // try to save every 10 miliseconds
      }
      // set interval
      interval = trySave();
      // dispose of interval vars
      return () => {
        if (interval) {
          this.window.clearInterval(interval);
          interval = null;
        }
      };
    }).first();
  }
  ////////////////
  // HTTP STUFF //
  ////////////////
  // NOTE: the HttpService exists in 'shared' with very similar methods.
  // We can't use that here because that requires AuthService (this) as a dependancy
  // and this is not fully initalized if we injected the HttpService in the constructor.
  public bearerIsExpired(tokenObj) {
    let currentTime = Math.round(new Date().getTime() / 1000);
    if (currentTime >= (tokenObj.time + tokenObj.expires_in)) {
      // the token has expired
      return true;
    } else {
      // coninue
      return false;
    }
  }
  public createGETHeader(headers: Headers, tokenObj: AccountTokenInterface) {
    headers.append('Authorization', `Bearer ${tokenObj.access_token}`);
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
  }
  private get(url, tokenObj?: AccountTokenInterface): Observable<any> {
    // set current token object if it's not explicitly passed
    tokenObj = (tokenObj) ? tokenObj : this.accounts[this.currentAccount];
    if (this.bearerIsExpired(tokenObj)) {
      return this.refreshToken(tokenObj)
        .flatMap((token) => {
          // continue with request after fetching new token
          let headers = new Headers();
          this.createGETHeader(headers, token);
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
      storage.has('accounts')
      .flatMap((keyExists) => {
        // if token and no info, get info
        if (keyExists && (this.accounts.length === 0)) {
          return this.getAllAccountsInfo();
        } else if (keyExists) {
          return Observable.of(true);
        } else {
          // else reject to accounts page
          this.router.navigate(['/accounts']);
          return Observable.of(false);
        }
      })
      .subscribe((res) => {
        observer.next(res);
        observer.complete();
      })
    }).first();
  }

}