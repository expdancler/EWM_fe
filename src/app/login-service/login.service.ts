import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {WbsManagerService} from "../components/wbs-manager/services/wbs-manager.service";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  /*private get baseURL(): string {
    return this.env.baseURL;
  }*/

  constructor(private httpClient: HttpClient) {
   }

  logUser(loginData: any): Observable<any> {
    const headers = { 'content-type': 'application/json' };
    let loginRequest = {"authcode":"MUnirahMFyOSXedcCmnM","language":"it-IT","page":"LOGINPAGE","username":loginData.username,"password":loginData.password};
    let request = { ...loginRequest };
    let data = JSON.stringify(request);
    return this.httpClient.post(/*this.baseURL +*/ "/loginTest/logUser", data, { 'headers': headers })
      .pipe(
        retry(1),
        catchError(this.processError)
      )
  }

  processError(err: any) {
    let message = '';
    if (err.error instanceof ErrorEvent) {
      message = err.error.message;
    } else {
      message = `Error Code: ${err.status}\nMessage: ${err.message}`;
    }
    return throwError(message);
  }
}
