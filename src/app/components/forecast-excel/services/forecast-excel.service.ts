import {Injectable} from '@angular/core';
import {Observable, throwError} from "rxjs";
import {environment} from "../../../../environments/environment";
import {catchError, retry} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {StorageService} from "../../../utils/secureStorage";

@Injectable({
    providedIn: 'root'
})
export class ForecastExcelService {

    constructor(private httpClient: HttpClient,private storageService: StorageService) {
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

    checkServiceAccess(): Observable<any> {
        const token = this.storageService.secureStorage.getItem("token");
        let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
        if (environment.production) headers.Authorization = "Bearer " + token;

        let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
        let request: { Username: string } = { Username: username_loggedUSer };

        let data = JSON.stringify(request);
        return this.httpClient
            .post(/*this.baseURL + */"/wbs/checkServiceAccess", data, { headers: headers })
            .pipe(retry(1), catchError(this.processError));
    }

    getForecastData({crm, ewm, bdg}: {
        crm?: { month: string, year: string },
        ewm?: { month: string, year: string },
        bdg?: { year: string }
    }): Observable<any> {
        const token = this.storageService.secureStorage.getItem("token");
        let headers: {"content-type": string , "Authorization"?: string} = { "content-type": "application/json" };
        if (environment.production) headers.Authorization = "Bearer " + token;

        let username_loggedUSer = this.storageService.secureStorage.getItem("username_loggedUser");
        let request: {
            Username: string,
            CrmMonth?: string, CrmYear?: string,
            EwmMonth?: string, EwmYear?: string,
            BdgYear?: string,
        } = { Username: username_loggedUSer };
        if (bdg && bdg.year) {
            request.BdgYear = bdg.year;
        } else {
            if (crm && crm.month && crm.year) {
                request.CrmMonth = crm.month;
                request.CrmYear = crm.year;
            }
            if (ewm && ewm.month && ewm.year){
                request.EwmMonth = ewm.month
                request.EwmYear = ewm.year
            }
        }

        let data = JSON.stringify(request);
        return this.httpClient
            .post(/*this.baseURL + */"/wbs/getForecastExcelData", data, { headers: headers })
            .pipe(retry(1), catchError(this.processError));
    }
}
