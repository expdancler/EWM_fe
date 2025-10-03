import {Component, OnInit} from '@angular/core';
import {EventEmitterService} from './services/event-emitter.service';
import {ModalComponent} from "./components/modal/modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {Environment} from './services/environment.service';
import {environment} from 'src/environments/environment';
import {StorageService} from './utils/secureStorage';
import {ForecastExcelService} from "./components/forecast-excel/services/forecast-excel.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'EWM';
  loggedUser: boolean = false;
  name_loggedUser: any;
  surname_loggedUser: any;
  change_forecast: any;
  hasAccessToForecast: boolean = false;

  constructor(
      private environment: Environment,
      private eventEmitterService: EventEmitterService,
      private modalService : NgbModal,
      private router : Router,
      private storageService: StorageService,
      private forecastExcelService: ForecastExcelService,
  ) { }

  ngOnInit() {
    if(environment.production == true){
      this.environment.getEnvironment();
    } else {
      this.environment.baseURL = environment.baseUrl
    }
    
    let void_dataWBsDatail:any={};
    let void_inforationCards:any={};
    this.storageService.secureStorage.setItem('change_forecast','false');
    this.storageService.secureStorage.setItem('dataWBsDetail',JSON.stringify(void_dataWBsDatail));
    this.storageService.secureStorage.setItem('informationCards',JSON.stringify(void_inforationCards));
    this.eventEmitterService.getEventSubject().subscribe((param: any) => {
      if (param !== undefined) {
        this.theTargetMethod(param);
      }
    });
    this.eventEmitterService.getUserNameEventSubject().subscribe((param: any) => {
      if (param !== undefined) {
        this.name_loggedUser = param;
        this.storageService.secureStorage.setItem('name_loggedUser', param);
      }
      else {
        this.name_loggedUser = this.storageService.secureStorage.getItem('name_loggedUser');
      }

      this.forecastExcelService.checkServiceAccess().toPromise().then((res) => {
        this.hasAccessToForecast = res.data.forecast;
      });
    });

    this.eventEmitterService.getSurnameNameUserEventSubject().subscribe((param: any) => {
      if (param !== undefined) {
        this.surname_loggedUser = param;
        this.storageService.secureStorage.setItem('surname_loggedUser', param);
      }
      else {
        this.surname_loggedUser = this.storageService.secureStorage.getItem('surname_loggedUser');
      }
    });

    setTimeout(() => {
      if (this.storageService.secureStorage.getItem('loggedUser') === "OK") {
        this.loggedUser = true;
      }
    }, 1000);
  }

  theTargetMethod(param: any) {
    if (param === "OK") {
      this.loggedUser = true;
    }
    else {
      this.loggedUser = false;
    }
  }
  fn_changeForecast_Wrk(){
    this.change_forecast = this.storageService.secureStorage.getItem('change_forecast');
    if(this.change_forecast == 'true'){
      const modal_changeForecast_Wrk = {};
      const modalRef = this.modalService.open(ModalComponent);
      modalRef.componentInstance.modal_changeForecast_Wrk = modal_changeForecast_Wrk;
      return;
    }else{
      this.router.navigate(['/work-space']);
    }
  }
  fn_changeForecast_Rpt(){
    this.change_forecast = this.storageService.secureStorage.getItem('change_forecast');
    if(this.change_forecast == 'true'){
      const modal_changeForecast_Rpt = {};
      const modalRef = this.modalService.open(ModalComponent);
      modalRef.componentInstance.modal_changeForecast_Rpt = modal_changeForecast_Rpt;
      return;
    }else{
      this.router.navigate(['/reports']);
    }
  }
  fn_changeForecast_RptOld(){
    this.change_forecast = this.storageService.secureStorage.getItem('change_forecast');
    if(this.change_forecast == 'true'){
      const modal_changeForecast_RptOld = {};
      const modalRef = this.modalService.open(ModalComponent);
      modalRef.componentInstance.modal_changeForecast_Rpt = modal_changeForecast_RptOld;
      return;
    }else{
      this.router.navigate(['/reportsOld']);
    }
  }
  fn_changeForecast_Exc(){
    this.change_forecast = this.storageService.secureStorage.getItem('change_forecast');
    if(this.change_forecast == 'true'){
      const modal_changeForecast_Rpt = {};
      const modalRef = this.modalService.open(ModalComponent);
      modalRef.componentInstance.modal_changeForecast_Rpt = modal_changeForecast_Rpt;
      return;
    }else{
      this.router.navigate(['/forecast']);
    }
  }
}
