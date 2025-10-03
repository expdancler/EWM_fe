import { IEnvironment } from "./../model/environment.model";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, throwError } from "rxjs";
import { catchError, retry, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class Environment {
  private _baseURL: string = "";

  public set baseURL(value: string) {
    this._baseURL = value ?? "";
  }

  public get baseURL(): string {
    return this._baseURL;
  }

  constructor(private httpClient: HttpClient) {}

  processError(err: any) {
    let message = "";
    if (err.error instanceof ErrorEvent) {
      message = err.error.message;
    } else {
      message = `Error Code: ${err.status}\nMessage: ${err.message}`;
    }
    return throwError(message);
  }

  getEnvironment(): Subject<IEnvironment> {
    const http = new Subject<IEnvironment>();
    this.httpClient
      .get<IEnvironment>("config/config.json")
      .pipe(retry(1), catchError(this.processError), tap((res: IEnvironment) => {
        this.baseURL = res?.environment?.baseUrl ?? '';
      }))
      .subscribe(http);
    return http  
  }
}
