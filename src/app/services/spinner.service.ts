import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { defer, NEVER } from 'rxjs';
import { finalize, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  constructor(private spinner: NgxSpinnerService) {}

  public startSpinner() {
    this.spinner.show();
  }

  public endSpinner() {
    this.spinner.hide();
  }

  // Implemento un observable con'NEVER'.
  public readonly spinner$ = defer(() => {
    //
    this.startSpinner();
    return NEVER.pipe(
      finalize(() => {
        this.endSpinner();
      })
    );
  }).pipe(share());
}
