import { Environment } from 'src/app/services/environment.service';
import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root',
})
export class InterceptorService {
  constructor(private spinnerService: SpinnerService, private env: Environment) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const u = req.url.includes('http') ? req.url : `${this.env.baseURL}${req.url}`;
    const nreq = req.clone({
      url: u,
    });

    // this.spinnerService.startSpinner();
    // return next.handle(nreq).pipe(finalize(() => this.spinnerService.endSpinner()));

    const spinnerSubscription: Subscription = this.spinnerService.spinner$.subscribe();
    return next.handle(nreq).pipe(finalize(() => spinnerSubscription.unsubscribe()));
  }
}
