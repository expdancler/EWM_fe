import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { Balance } from "../components/model/Balance.model";
import { Forecast } from "../components/model/Forecast.model";
import { ProfCtr } from "../components/model/ProfCtr.model";
import {StorageService} from '../../../utils/secureStorage';
import {environment} from "../../../../environments/environment";


@Injectable({
  providedIn: "root",
})
export class WbsManagerService {

  /*private get baseURL(): string {
    return this.env.baseURL;
  }*/

  shareData: any = [];
  private passedData = new BehaviorSubject<any>(this.shareData);
  dataAcr = this.passedData.asObservable();

  constructor(private httpClient: HttpClient,private storageService: StorageService) {}
  //-- LISTA WBS
  objectRequest: any = {
    IrStatus: null,
  };
  dynamicRequestObject(wbsList: any) {
    if (wbsList.wbs === null) {
      this.objectRequest.IrWbs = null;
    }
  }

  getWBSList(wbsList: any): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let userRequest = { IUname: username_loggedUSer };
    this.dynamicRequestObject(wbsList);
    let request = { ...userRequest, ...this.objectRequest };
    let data = JSON.stringify(request);
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWBSList", data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  // mi setta tutti i messaggi ancora da leggere a "letti"
  setWbsReadComm(wbs: any): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let wbsReadComm = {
      IUname: username_loggedUSer,
      ICommRead: "X",
      IWbs: wbs,
    };
    let data = JSON.stringify(wbsReadComm);
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/setWbsReadComm", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  getWBSDetail(wbs: any, IsObject: Object): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production)
      headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let wbsDetail = {
      IUname: username_loggedUSer,
      IWbs: wbs,
      IsObjects: IsObject
      // IsObjects: {
      //   Header: "X",
      //   Acr: "X",
      //   Balance: "X",
      //   Forecast: "X",
      //   FcVersn: null,
      //   Communications: "X",
      //   Versions: "X",
      // },
    };
    let data = JSON.stringify(wbsDetail);
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWBSDetail", data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsPrcstGetlist(): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let data = {};
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsPrcstGetlist", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsSupplGetlist(): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let data = {};
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsSupplGetlist", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsReport(IStartDate: string): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = {
      IUname: username_loggedUSer,
      IStartDate: IStartDate,
    };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsReport", data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  getCompleteWbsReport(IStartDate: string): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = {
      IUname: username_loggedUSer, 
      IStartDate: IStartDate,
      IOnline: '',
      IsObjects: {
        Fyear: 'X',
        Fmonth: 'X',
        Balance: 'X',
        Forecast: 'X',
        Acr: 'X',
        Billing: 'X'
      },
    };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getCompleteWbsReport", data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  // SERVIZI FLEX MONSTER

  getWbsFlexSave(
    ILayoutName: any,
    ILayoutDescr: any,
    ILayoutJson: any,
    IRepName: any,
    username?: string
  ): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = username ?? this.storageService.secureStorage.getItem("username_loggedUser");
    let data = {
      IUname: username_loggedUSer,
      IRepName: IRepName,
      ILayoutName: ILayoutName,
      ILayoutDescr: ILayoutDescr,
      ILayoutJson: ILayoutJson,
    };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsFlexSave", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsFlexGetdetail(ILayoutName: any, IRepName: any) {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = {
      IUname: username_loggedUSer,
      IRepName: IRepName,
      ILayoutName: ILayoutName,
    };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsFlexGetdetail", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsFlexGetlist(IRepName: any) {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = {
      IUname: username_loggedUSer,
      IRepName: IRepName,
    };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsFlexGetlist", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsFlexDelete(ILayoutName: any, IRepName: any) {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = {
      IUname: username_loggedUSer,
      IRepName: IRepName,
      ILayoutName: ILayoutName,
    };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsFlexDelete", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsCeGetList(IWbs: any): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let data = { ICeBalInd: 'X', ICeFcInd: "X", IWbs: IWbs };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsCeGetList", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsChange({IWbs, IsForecast, IsBalance, IsProfCtr}: {IWbs: string, IsForecast: Forecast, IsBalance?: any, IsProfCtr?: ProfCtr} ): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = {
      IWbs: IWbs,
      IsForecast: IsForecast,
      IsBalance: IsBalance,
      IsProfCtr: IsProfCtr,
      IUname: username_loggedUSer,
    };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/wbsChange", data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  // getWbsChange(
  //   IWbs: any,
  //   StartDate: any,
  //   EndDate: any,
  //   TCostElement: any,
  //   TCeEmpl: any,
  //   TCeCons: any,
  //   IsBalance: any,
  //   IsProfCtr: any,
  // ): Observable<any> {
  //   const headers = { "content-type": "application/json" };
  //   let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
  //   let data = {
  //     IWbs: IWbs,
  //     IsForecast: {
  //       StartDate: StartDate,
  //       EndDate: EndDate,
  //       TCostElement: TCostElement,
  //       TCeEmpl: TCeEmpl,
  //       TCeCons: TCeCons,
  //     },
  //     IsBalance: {
  //       TCostElement: IsBalance    // [item: ]
  //     },
  //     IsProfCtr: IsProfCtr,
  //     IUname: username_loggedUSer,
  //   };
  //   return this.httpClient
  //     .post(/*this.baseURL + */"/EWM/wbs/wbsChange", data, { headers: headers })
  //     .pipe(retry(1), catchError(this.processError));
  // }

  // Mofica ESForecast-->TCEmpl
  getTCEmplChange(IWbs: any, TCeEmpl: any): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = {
      IWbs: IWbs,
      IsForecast: {
        TCeEmpl: TCeEmpl,
      },
      IUname: username_loggedUSer,
    };

    return this.httpClient
      .post(/*this.baseURL + */"/wbs/wbsChange", data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  getWbsRelease(IWbs: any) {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = { IUname: username_loggedUSer, IWbs: IWbs };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsRelease", data, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  getEmplList(IDate: any) {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getEmplList", {IDate: IDate}, { headers: headers })
      .pipe(retry(1), catchError(this.processError));
  }

  getSenderComunicazioni(IWbs: any): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = { IUname: username_loggedUSer, IWbs: IWbs, ICommType: "U01" };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsCommDetail", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  createComunicazione(IWbs: any, messaggio: any): Observable<any> {
    const token = this.storageService.secureStorage.getItem("token");
    let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
    if (environment.production) headers.Authorization = "Bearer " + token;

    let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
    let data = {
      IUname: username_loggedUSer,
      IWbs: IWbs,
      ICommType: "U01",
      ISubj: messaggio.oggetto,
      IBody: messaggio.body,
      IsSender: messaggio.mittente,
      ItToRecipient: messaggio.destinatari,
      IParentIdRow: messaggio.parentIdRow ? messaggio.parentIdRow : "000",
      ISendMail: "",
      ISystCom: "",
      IVersn: "000",
    };
    return this.httpClient
      .post(/*this.baseURL + */"/wbs/getWbsCreateComm", data, {
        // .post(/*this.baseURL + */"", data, {
        headers: headers,
      })
      .pipe(retry(1), catchError(this.processError));
  }

  processError(err: any) {
    let message = "";
    if (err.error instanceof ErrorEvent) {
      message = err.error.message;
    } else {
      message = `Error Code: ${err.status}\nMessage: ${err.message}`;
    }
    return throwError(message);
  }

  passDataToAcr(data: any) {
    this.passedData.next(data);
  }
}
