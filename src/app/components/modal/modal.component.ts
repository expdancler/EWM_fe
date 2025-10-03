import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkSpaceService } from '../work-space/services/work-space.service';
import {WbsManagerComponent} from "../wbs-manager/components/wbs-manager/wbs-manager.component";
import {AcrComponent} from "../wbs-manager/components/acr/acr.component";
import {Router} from "@angular/router";
import {StorageService} from '../../utils/secureStorage';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() wbsDetail: any;
  @Input() modalSearch: any;
  @Input() loginFailedDescription: any;
  @Input() invia: any;
  @Input() unauthorized: any;
  @Input() invalidVociCosto: any;
  @Input() save_null : any;
  @Input() inviaModal:any;
  @Input() modal_changeForecast_Wrk:any;
  @Input() modal_changeForecast_Rpt:any;
  @Input() modal_changeForecast_RptOld:any;
  @Input() modal_changeForecast_Exc:any;
  @Input() modal_copyNextMonth:any;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  validatinDate: boolean = false;
  @Output() copyNextMonth: EventEmitter<any>= new EventEmitter();

  listaClienti: any = [];
  searchForm = this.formBuilder.group({
    wbs: null,
    descrizione: null,
    cliente: null,
    dataInizio: null,
    dataFine: null
  });

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private workSpaceService: WorkSpaceService,
    private router : Router,
    private storageService: StorageService
  )
   { }

  ngOnInit(): void {
    if (this.modalSearch) {
      this.getWBSList();
    }
  }

  getWBSList() {
    let wbsList = this.searchForm.value;
    this.workSpaceService.getWBSList(wbsList).subscribe(response => {
      this.listaClienti = response.data.EtCustList;
    });
  }

  getSelectedCliente(event: any) {

  }

  searchList() {
    let search = this.searchForm.value;
    this.validatinDate = false;
    if (search.dataInizio && search.dataFine) {
      if (new Date(search.dataInizio) > new Date(search.dataFine)) {
        this.validatinDate = true;
         return;
      }
    }
    this.passEntry.emit(search);
    this.activeModal.close();
  }

  resetForm() {
    this.searchForm.reset();
    this.validatinDate = false;
  }
  modal_changeForecast_continua_Wrk(){
    let void_dataWBsDatail:any={};
    let void_inforationCards:any={};
    this.storageService.secureStorage.setItem('change_forecast','false');
    this.storageService.secureStorage.setItem('dataWBsDetail',JSON.stringify(void_dataWBsDatail));
    this.storageService.secureStorage.setItem('informationCards',JSON.stringify(void_inforationCards));
      this.router.navigate(['/work-space']);
    this.activeModal.dismiss('Cross click');
  }
  modal_changeForecast_continua_Rpt(){
    let void_dataWBsDatail:any={};
    let void_inforationCards:any={};
    this.storageService.secureStorage.setItem('change_forecast','false');
    this.storageService.secureStorage.setItem('dataWBsDetail',JSON.stringify(void_dataWBsDatail));
    this.storageService.secureStorage.setItem('informationCards',JSON.stringify(void_inforationCards));
    this.router.navigate(['/reports']);
    this.activeModal.dismiss('Cross click');
  }
  modal_changeForecast_continua_RptOld(){
    let void_dataWBsDatail:any={};
    let void_inforationCards:any={};
    this.storageService.secureStorage.setItem('change_forecast','false');
    this.storageService.secureStorage.setItem('dataWBsDetail',JSON.stringify(void_dataWBsDatail));
    this.storageService.secureStorage.setItem('informationCards',JSON.stringify(void_inforationCards));
    this.router.navigate(['/reportsOld']);
    this.activeModal.dismiss('Cross click');
  }
  modal_changeForecast_continua_Exc(){
    let void_dataWBsDatail:any={};
    let void_inforationCards:any={};
    this.storageService.secureStorage.setItem('change_forecast','false');
    this.storageService.secureStorage.setItem('dataWBsDetail',JSON.stringify(void_dataWBsDatail));
    this.storageService.secureStorage.setItem('informationCards',JSON.stringify(void_inforationCards));
    this.router.navigate(['/forecast']);
    this.activeModal.dismiss('Cross click');
  }
  copyToNextMonth(){
    this.copyNextMonth.emit(true);
    this.activeModal.dismiss('Cross click');
  }

}
