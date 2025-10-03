import {Component, enableProdMode, OnInit} from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventEmitterService } from 'src/app/services/event-emitter.service';
import { LoginService } from 'src/app/login-service/login.service';
import { ModalComponent } from '../modal/modal.component';
import {StorageService} from '../../utils/secureStorage';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  submitted: boolean = false;

  loginForm = this.formBuilder.group({
    username: [null, Validators.required],
    password: [null, Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private eventEmitterService: EventEmitterService,
    private modalService: NgbModal,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {

    if (environment.production) {
      /**
       * Se non ho parametri redirect a BE per saml
       * se ho parametri allora procedure normale ed entro in workspace
       * se faccio logout avro il token da prima quindi mostro login con bottone saml
       * */

      const windowUrl = window.location.search;
      const params = new URLSearchParams(windowUrl);

      if (params.has("token")){

        let response = {
          token:params.get("token"),
          expireAt:params.get("expireAt"),
          user:params.get("user"),
          data:{
            nome:"",
            cognome:""
          },
          esito:"OK"
        }

        this.storageService.secureStorage.setItem('loggedUser', response.esito);
        // @ts-ignore
        this.storageService.secureStorage.setItem('username_loggedUser', response.user.toUpperCase());
        this.storageService.secureStorage.setItem('token',response.token);
        this.eventEmitterService.triggerNameUserEvent(response.data.nome);
        this.eventEmitterService.triggerSurnameUserEvent(response.data.cognome);
        this.eventEmitterService.triggerSomeEvent(response.esito);

        const precPath = this.storageService.secureLocalStorage.getItem('precPath');
        if (precPath !== null) {
          this.router.navigateByUrl(precPath);
          this.storageService.secureLocalStorage.removeItem('precPath');
        } else {
          this.router.navigateByUrl('/work-space');
        }

      } else {
        return window.location.replace(environment.baseUrl + "/login/loginJwt")
      }
    } else {
      this.storageService.secureStorage.removeItem('wbs');
      this.storageService.secureStorage.removeItem('role');
      this.storageService.secureStorage.removeItem('username_loggedUSer');
      this.storageService.secureStorage.removeItem('name_loggedUSer');
      this.storageService.secureStorage.removeItem('surname_loggedUSer');
      if (this.storageService.secureStorage.getItem('loggedUser') === "OK") {
        this.storageService.secureStorage.removeItem('loggedUser');
        this.storageService.secureStorage.clear();
        setTimeout(() => {
          this.eventEmitterService.triggerSomeEvent("AccessDenied");
        }, 100);
      }
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  logUser(loginData: any) {
    if (this.loginForm.invalid) {
      this.submitted = true;
      return;
    }
    this.loginService.logUser(loginData).subscribe(response => {
      if (response.esito === "OK") {
        this.storageService.secureStorage.setItem('loggedUser', response.esito);
        this.storageService.secureStorage.setItem('username_loggedUser', loginData.username.toUpperCase());
        this.eventEmitterService.triggerNameUserEvent(response.data.nome);
        this.eventEmitterService.triggerSurnameUserEvent(response.data.cognome);
        this.eventEmitterService.triggerSomeEvent(response.esito);
        this.router.navigateByUrl('/work-space');
      }
      else {
        const modalRef = this.modalService.open(ModalComponent, {
          backdrop: 'static',
          keyboard: false,
        });
        modalRef.componentInstance.loginFailedDescription = response.data.title;
        modalRef.componentInstance.passEntry.subscribe((receivedEntry: any) => {
        });
      }
    });
  }

}
