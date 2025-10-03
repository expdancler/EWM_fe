import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {StorageService} from '../../../utils/secureStorage';
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class WorkSpaceService {
  /*private get baseURL(): string {
    return this.env.baseURL;
  }*/

  objectRequest: any = {
    IrStatus: null,
  };

  constructor(private httpClient: HttpClient,private storageService: StorageService) {}

  getWBSList(wbsList: any): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem('username_loggedUser');
    let userRequest = { IUname: username_loggedUSer };
    this.dynamicRequestObject(wbsList);
    let request = { ...userRequest, ...this.objectRequest };
    let data = JSON.stringify(request);
    return this.httpClient
      .post(/*this.baseURL + */ '/wbs/getWBSList', data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsPeriodiLast(): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem('username_loggedUser');
    let data = {
      IUname: username_loggedUSer,
    };
    return this.httpClient
      .post(/*this.baseURL + */ '/wbs/getWbsPeriodiLast', data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsPeriodOpen(dataDa: string): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem('username_loggedUser');
    let data = {
      IUname: username_loggedUSer,
      IDate: dataDa,
    };
    return this.httpClient
      .post(/*this.baseURL + */ '/wbs/getWbsPeriodOpen', data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsPeriodClose(dataA: string): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem('username_loggedUser');
    let data = {
      IUname: username_loggedUSer,
      IDate: dataA,
    };
    return this.httpClient
      .post(/*this.baseURL + */ '/wbs/getWbsPeriodClose', data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsUnlock(wbs: string): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem('username_loggedUser');
    let data = {
      IUname: username_loggedUSer,
      IWbs: wbs,
    };
    return this.httpClient
      .post(/*this.baseURL + */ '/wbs/getWbsUnlock', data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  setWbsRemind(wbs: string[]): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem('username_loggedUser');
    let data = {
      IUname: username_loggedUSer,
      ItWbs: wbs,
    };
    return this.httpClient
      .post(/*this.baseURL + */ '/wbs/setWbsRemind', data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
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

  dynamicRequestObject(wbsList: any) {
    if (wbsList.wbs === null) {
      this.objectRequest.IrWbs = null;
    } else {
      let IrWbs = [{ sign: 'I', option: 'CP', low: '*' + wbsList.wbs + '*', high: null }];
      this.objectRequest.IrWbs = IrWbs;
    }
    if (wbsList.descrizione === null) {
      this.objectRequest.IrDescrWbs = null;
    } else {
      let IrDescrWbs = [{ sign: 'I', option: 'CP', low: '*' + wbsList.descrizione + '*', high: null }];
      this.objectRequest.IrDescrWbs = IrDescrWbs;
    }
    ///
    if (wbsList.stato === 'all') {
      this.objectRequest.IrStatus = null;
    } else {
      let IrStatus = [{ sign: 'I', option: 'EQ', low: '1', high: null }];
      this.objectRequest.IrStatus = IrStatus;
    }
    ///
    if (wbsList.cliente === null) {
      this.objectRequest.IrCustomer = null;
    } else {
      let IrCustomer = [{ sign: 'I', option: 'EQ', low: wbsList.cliente, high: null }];
      this.objectRequest.IrCustomer = IrCustomer;
    }
    if (wbsList.dataInizio === null) {
      this.objectRequest.IStartDate = null;
    } else {
      this.objectRequest.IStartDate = wbsList.dataInizio;
    }
    if (wbsList.dataFine === null) {
      this.objectRequest.IEndDate = null;
    } else {
      this.objectRequest.IEndDate = wbsList.dataFine;
    }
    if (wbsList.pm === null) {
      this.objectRequest.IrPmCode = null;
    } else {
      let IrPmCode = [{ sign: 'I', option: 'EQ', low: wbsList.pm, high: null }];
      this.objectRequest.IrPmCode = IrPmCode;
    }
    if (wbsList.tipologiaCommessa === null) {
      this.objectRequest.IrRevType = null;
    } else {
      let IrRevType = [{ sign: 'I', option: 'EQ', low: wbsList.tipologiaCommessa, high: null }];
      this.objectRequest.IrRevType = IrRevType;
    }    
  }
}
