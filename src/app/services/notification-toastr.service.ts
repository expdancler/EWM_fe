import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationTostrService {

  constructor(private tostrService: ToastrService) { }

  showMessage(resonse: any) {
    if (resonse.esito === "OK") {
      if (resonse.data.EtReturn === []) {
        this.showSuccess();
      }
      if (resonse.data.EtReturn !== []) {
        resonse.data.EtReturn.forEach((element: any) => {
          if (element.type === "W") {
            this.showWarning(element.message)
          }
          if (element.type === "E") {
            this.showError(element.message)
          }
        });
      }
    }
    if (resonse.esito === "KO") {
      this.showError(resonse.data.title);
    }
  }

  showSuccess() {
    this.tostrService.success('Il salvataggio è stato eseguito correttamente', 'Success');
  }

  showWarning(message: any) {
    this.tostrService.warning(message, 'Warning');
  }

  showError(message: any) {
    this.tostrService.error(message, 'Error');
  }

}
