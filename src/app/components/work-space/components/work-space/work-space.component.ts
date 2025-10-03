import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { WorkSpaceService } from '../../services/work-space.service';
import { NotificationTostrService } from 'src/app/services/notification-toastr.service';
import { DatePipe } from '@angular/common';
import {StorageService} from '../../../../utils/secureStorage';

@Component({
  selector: 'app-work-space',
  templateUrl: './work-space.component.html',
  styleUrls: ['./work-space.component.scss'],
  providers: [DatePipe],
})
export class WorkSpaceComponent implements OnInit {
  mesi: any = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];
  mesiValue: any = [
    { mese: 'Gennaio', value: 1 },
    { mese: 'Febbrario', value: 2 },
    { mese: 'Marzo', value: 3 },
    { mese: 'Aprile', value: 4 },
    { mese: 'Maggio', value: 5 },
    { mese: 'Giugno', value: 6 },
    { mese: 'Luglio', value: 7 },
    { mese: 'Agosto', value: 8 },
    { mese: 'Settembre', value: 9 },
    { mese: 'Ottobre', value: 10 },
    { mese: 'Novembre', value: 11 },
    { mese: 'Dicembre', value: 12 },
  ];
  mese: string = '';
  anno: string = '';
  EtWbsList: any = [];
  listaClienti: any = [];
  listaPM: any = [];
  listaTipologiaCommessa: any = [{label: 'Progetti', value: 'CC'}, {label: 'Canoni', value: 'CA'}, {label: 'T&M', value: 'TM'}, {label: 'Avanzamento manuale', value: 'CR'}];
  validatinDate: boolean = false;
  dataInvioDa: any = '';
  dataInvioA: any = '';
  buttonOpen: string = '';
  buttonClose: string = '';
  // array wbs passata con action
  wbs: any;
  // array action possibili dall'utente in quella wbs
  action: any;
  // sessione per controllare dati
  change_forcast = 'true';
  buttonSolleciti: any;
  wbsOpen: any;

  searchForm = this.formBuilder.group({
    stato: '1',
    wbs: null,
    descrizione: null,
    cliente: null,
    dataInizio: null,
    dataFine: null,
    pm: null,
    tipologiaCommessa: null
  });

  perForecast: string = '';
  dataInvioForecastDa: string = '';
  dataInvioForecastA: string = '';

  // descrizioneRemind: string = "Confermare l’invio del sollecito per la WBS selezionata";
  // descrizioneRemindAll: string = "Confermare l’invio del sollecito per le WBS non ancora inviate";
  // descrizioneUnlock: string = "Confermare lo sblocco per la WBS selezionata";

  // idModalRemind: string = "remindModal";
  // idModalRemindAll: string = "remindAll";
  // idModalUnlock: string = "unlockModal";

  modal: any = [
    { descrizione: 'Confermare l’invio del sollecito per le WBS non ancora inviate', idModal: 'remindAll' },
    { descrizione: 'Confermare l’invio del sollecito per la WBS selezionata', idModal: 'remindModal' },
    { descrizione: 'Confermare lo sblocco per la WBS selezionata', idModal: 'unlockModal' },
  ];

  itemValue: string = '';
  
  //Variabili per impaginazione
  itemPerPage: number = 1;
  optionsPage: number[] = [50,100];
  currentPage: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private workSpaceService: WorkSpaceService,
    private router: Router,
    private notificationToastrService: NotificationTostrService,
    private datePipe: DatePipe,
    private storageService: StorageService
  ) {}
  ngOnInit(): void {
    this.itemPerPage = this.optionsPage[0];
    if(this.storageService.secureStorage.getItem('wsSearchForm')){
      for(const control in this.searchForm.controls){
        this.searchForm.controls[control].setValue(JSON.parse(this.storageService.secureStorage.getItem('wsSearchForm'))[control]);
      }
    }
    this.getWBSList();

    /*this.workSpaceService.getWbsPeriodiLast().subscribe((response: any) => {
      this.mese = this.mesi[response.data.EsFcPerio.Fmonth - 1];
      this.anno = response.data.EsFcPerio.Fyear;
      this.perForecast = this.mese + " " + this.anno;
      this.dataInvioForecastDa = response.data.EsFcPerio.ReleaseFrom == "0000-00-00" ? '' : response.data.EsFcPerio.ReleaseFrom.split('-')[2]+"-"+response.data.EsFcPerio.ReleaseFrom.split('-')[1]+"-"+response.data.EsFcPerio.ReleaseFrom.split('-')[0];
      this.dataInvioForecastA = response.data.EsFcPerio.ChangeTo== "0000-00-00" ? '' : response.data.EsFcPerio.ChangeTo.split('-')[2]+"-"+response.data.EsFcPerio.ChangeTo.split('-')[1]+"-"+response.data.EsFcPerio.ChangeTo.split('-')[0];;
      this.buttonClose = response.data.EClose;
      this.buttonOpen =response.data.EOpen;
    });*/

    // resetta lo scroll della pagina
    window.scrollTo(0, 0);
    let void_dataWBsDatail: any = {};
    let void_inforationCards: any = {};
    this.storageService.secureStorage.setItem('change_forecast', 'false');
    this.storageService.secureStorage.setItem('dataWBsDetail', JSON.stringify(void_dataWBsDatail));
    this.storageService.secureStorage.setItem('informationCards', JSON.stringify(void_inforationCards));
    this.storageService.secureStorage.setItem('tabTariffe', JSON.stringify({}));
  }

  setItemPerPage(value: any){
    this.itemPerPage = Number(value);
    this.changePage(0);
  }

  changePage(value: number){
    var newPage = Math.trunc(value);
    
    if (newPage>=0 && newPage<=this.EtWbsList.length/this.itemPerPage) {
      this.currentPage = newPage;
    }
  }

  setItem(item: any) {
    this.itemValue = item;
    console.log(this.itemValue);
  }

  getWBSList() {
    let wbsList = this.searchForm.value;
    let wbsPerformance = { class: '' };
    this.workSpaceService.getWBSList(wbsList).subscribe(response => {
      this.wbsOpen = response;
      response.data.EtWbsList.forEach((item: any) => {
        Object.assign(item, wbsPerformance);
      });
      // this.getPerformanceDetail(response.data.EtWbsList);
      response.data.EtWbsList = response.data.EtWbsList.map((item: any) => {
        if (item.Performance === '0' || item.Performance === 0) {
          //item.class = 'width: 1%;border-left: 5px solid gray;';
          item.class = 'color: gray';
        }
        if (item.Performance === '1' || item.Performance === 1) {
          //item.class = 'width: 1%;border-left: 5px solid green;';
          item.class = 'color: green';
        }
        if (item.Performance === '2' || item.Performance === 2) {
          //item.class = 'width: 1%;border-left: 5px solid red;';
          item.class = 'color: red';
        }
        if (item.Performance === '3' || item.Performance === 3) {
          //item.class = 'width: 1%;border-left: 5px solid orange;';
          item.class = 'color: orange';
        }
        if (item.Status == '1' || item.Status == 1) {
          item.Status = 'Aperta';
        } else if (item.Status == '2' || item.Status == 2) {
          item.Status = 'Chiusa';
        } else if (item.Status == '0' || item.Status == 0) {
          item.Status = 'In Attesa';
        } else {
          item.Status = '';
        }
        return item;
      });
      this.EtWbsList = response.data.EtWbsList;
      this.listaClienti = response.data.EtCustList;
      this.listaPM = response.data.EtPmList;
      this.workSpaceService.getWbsPeriodiLast().subscribe((response: any) => {
        this.mese = this.mesi[response.data.EsFcPerio.Fmonth - 1];
        this.anno = response.data.EsFcPerio.Fyear;
        this.perForecast = this.mese + ' ' + this.anno;
        this.dataInvioForecastDa =
          response.data.EsFcPerio.ReleaseFrom == '0000-00-00'
            ? ''
            : response.data.EsFcPerio.ReleaseFrom.split('-')[2] +
              '-' +
              response.data.EsFcPerio.ReleaseFrom.split('-')[1] +
              '-' +
              response.data.EsFcPerio.ReleaseFrom.split('-')[0];
        this.dataInvioForecastA =
          response.data.EsFcPerio.ChangeTo == '0000-00-00'
            ? ''
            : response.data.EsFcPerio.ChangeTo.split('-')[2] +
              '-' +
              response.data.EsFcPerio.ChangeTo.split('-')[1] +
              '-' +
              response.data.EsFcPerio.ChangeTo.split('-')[0];
        this.buttonClose = response.data.EClose;
        this.buttonOpen = response.data.EOpen;
        this.buttonSolleciti = response.data.ERemind;
        //**************************************************************************************//
        //                                     SEND
        //**************************************************************************************//
        if (
          this.dataInvioForecastDa == '' ||
          this.dataInvioForecastDa == ' ' ||
          this.dataInvioForecastDa == undefined
        ) {
          let newYear: any;
          let newMonth: any;
          this.mesiValue.forEach((item: any) => {
            if (item.mese == this.mese) {
              if (item.value == 1) {
                newMonth = 12;
                newYear = parseInt(this.anno) - 1;
              } else {
                newMonth = item.value - 1;
                newYear = parseInt(this.anno);
              }
            }
          });
          this.EtWbsList.forEach((list: any) => {
            if (parseInt(list.ActFyear) == newYear && parseInt(list.ActFmonth) == parseInt(newMonth)) {
              list.ctaSend = 'true';
            }
          });
        } else {
          let maxYear = false;
          let objForecastDa: any = {};
          let objCurrentData: any = {};
          let arr_dataInvioForecastDa = this.dataInvioForecastDa.split('-');
          let myDate = new Date();
          let currentDate: any;
          currentDate = this.datePipe.transform(myDate, 'yyyy-MM-dd');
          let arr_currentDate = currentDate.split('-');
          objForecastDa = {
            dd: arr_dataInvioForecastDa[0],
            MM: arr_dataInvioForecastDa[1],
            yy: arr_dataInvioForecastDa[2],
          };
          objCurrentData = { dd: arr_currentDate[2], MM: arr_currentDate[1], yy: arr_currentDate[0] };
          if (parseInt(objForecastDa.yy) > parseInt(objCurrentData.yy)) {
            maxYear = true;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) > parseInt(objCurrentData.MM)
          ) {
            maxYear = true;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) == parseInt(objCurrentData.MM) &&
            parseInt(objForecastDa.dd) > parseInt(objCurrentData.dd)
          ) {
            maxYear = true;
          } else if (parseInt(objForecastDa.yy) < parseInt(objCurrentData.yy)) {
            maxYear = false;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) < parseInt(objCurrentData.MM)
          ) {
            maxYear = false;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) == parseInt(objCurrentData.MM) &&
            parseInt(objForecastDa.dd) < parseInt(objCurrentData.dd)
          ) {
            maxYear = false;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) == parseInt(objCurrentData.MM) &&
            parseInt(objForecastDa.dd) == parseInt(objCurrentData.dd)
          ) {
            maxYear = false;
          }
          if (maxYear == false) {
            this.EtWbsList.forEach((list: any) => {
              if (
                parseInt(list.ActFyear) == parseInt(response.data.EsFcPerio.Fyear) &&
                parseInt(list.ActFmonth) == parseInt(response.data.EsFcPerio.Fmonth)
              ) {
                list.ctaSend = 'true';
              }
            });
          } else {
            let newYear: any;
            let newMonth: any;
            this.mesiValue.forEach((item: any) => {
              if (item.mese == this.mese) {
                if (item.value == 1) {
                  newMonth = 12;
                  newYear = parseInt(this.anno) - 1;
                } else {
                  newMonth = item.value - 1;
                  newYear = parseInt(this.anno);
                }
              }
            });
            this.EtWbsList.forEach((list: any) => {
              if (parseInt(list.ActFyear) == newYear && parseInt(list.ActFmonth) == parseInt(newMonth)) {
                list.ctaSend = 'true';
              }
            });
          }
        }
      });
    });
  }

  getPerformanceDetail(EtWbsList: any) {
    EtWbsList = EtWbsList.map((item: any) => {
      if (item.Performance === '0' || item.Performance === 0) {
        item.class = 'green-color-section';
      }
      if (item.Performance === '1' || item.Performance === 1) {
        item.class = 'green-color-section';
      }
      if (item.Performance === '2' || item.Performance === 2) {
        item.class = 'green-color-section';
      }
      if (item.Performance === '3' || item.Performance === 3) {
        item.class = 'green-color-section';
      }
      if (item.Status == '1' || item.Status == 1) {
        item.Status = 'Chiusa';
      } else if (item.Status == '0' || item.Status == 0) {
        item.Status = 'Aperta';
      } else {
        item.Status = '';
      }
    });
  }
  apriPeriodo() {
    this.workSpaceService.getWbsPeriodOpen(this.dataInvioDa).subscribe((response: any) => {
      this.notificationToastrService.showMessage(response);
      if (response.data.EtReturn.length == 0) {
        window.location.reload();
      }
    });
  }

  chiudiPeriodo() {
    this.workSpaceService.getWbsPeriodClose(this.dataInvioA).subscribe((response: any) => {
      this.notificationToastrService.showMessage(response);
      if (response.data.EtReturn.length == 0) {
        window.location.reload();
      }
    });
  }

  getSelectedCliente(event: any) {}
  popUpApriP() {
    if (this.dataInvioForecastDa === '') {
      this.dataInvioDa = new Date().toISOString().split('T')[0];
    } else {
      this.dataInvioDa =
        this.dataInvioForecastDa.split('-')[2] +
        '-' +
        this.dataInvioForecastDa.split('-')[1] +
        '-' +
        this.dataInvioForecastDa.split('-')[0];
    }
  }
  popUpChiudiP() {
    if (this.dataInvioForecastA === '') {
      this.dataInvioA = new Date().toISOString().split('T')[0];
    } else {
      this.dataInvioA =
        this.dataInvioForecastA.split('-')[2] +
        '-' +
        this.dataInvioForecastA.split('-')[1] +
        '-' +
        this.dataInvioForecastA.split('-')[0];
    }
  }

  unlock(item: any) {
    this.workSpaceService.getWbsUnlock(item.Wbs).subscribe((response: any) => {
      this.notificationToastrService.showMessage(response);
      if (response.data.EtReturn.length == 0) {
        window.location.reload();
      }
    });
  }

  // Funzione per chiamare il servizio setWbsRemind
  wbsRemind = (item: any = null) => {
    let listWbs: string[] = [];
    // let listWbsTest: string[] = [];

    // Se item === null allora mi trovo nel button "Invia solleciti"
    if (item === null) {
      // Ciclo sulle wbs aperte
      this.wbsOpen.data.EtWbsList.forEach((itemWbs: any) => {
        itemWbs.TAction.forEach((element: any) => {
          if (element.Action === 'REMIND') {
            listWbs.push(itemWbs.Wbs);
            // listWbsTest.push(itemWbs.Wbs);
            // console.log(itemWbs.Wbs);
          }
        });
      });
    }
    // Action singola
    else {
      listWbs.push(item.Wbs);
      // listWbsTest.push(item.Wbs);
      // console.log(item.Wbs);
      // console.log(item);
    }

    this.workSpaceService.setWbsRemind(listWbs).subscribe((response: any) => {
      // Setto lato front la "X" per far apparire l'icona della bustina
      if (response.esito === 'OK') {
        this.wbsOpen.data.EtWbsList.forEach((itemWbs: any) => {
          // listWbsTest.forEach((itemListWbs: any) => {
          listWbs.forEach((itemListWbs: any) => {
            // console.log(itemListWbs);
            if (itemWbs.Wbs === itemListWbs) {
              itemWbs.Reminder = 'X';
            }
          });
        });
      }
    });
  };

  openModalAction() {
    const wbsDetail = {};
    const modalRef = this.modalService.open(ModalComponent, {
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.wbsDetail = wbsDetail;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry: any) => {
      console.log(receivedEntry);
    });
  }

  openModalResponsive() {
    const modalSearch = {};
    const modalRef = this.modalService.open(ModalComponent, {
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.modalSearch = modalSearch;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry: any) => {
      let wbsPerformance = { neutral: false, red: false, orange: false, green: false };
      this.workSpaceService.getWBSList(receivedEntry).subscribe(response => {
        response.data.EtWbsList.forEach((item: any) => {
          Object.assign(item, wbsPerformance);
        });
        // this.getPerformanceDetail(response.data.EtWbsList);
        response.data.EtWbsList = response.data.EtWbsList.map((item: any) => {
          if (item.Performance === '0' || item.Performance === 0) {
            item.class = 'border-left: 5px solid gray;';
          }
          if (item.Performance === '1' || item.Performance === 1) {
            item.class = 'border-left: 5px solid green;';
          }
          if (item.Performance === '2' || item.Performance === 2) {
            item.class = 'border-left: 5px solid red;';
          }
          if (item.Performance === '3' || item.Performance === 3) {
            item.class = 'border-left: 5px solid orange;';
          }
          if (item.Status == '1' || item.Status == 1) {
            item.Status = 'Chiusa';
          } else if (item.Status == '0' || item.Status == 0) {
            item.Status = 'Aperta';
          } else {
            item.Status = '';
          }
          return item;
        });
        this.EtWbsList = response.data.EtWbsList;
      });
    });
  }
  pm: any;
  changePM(pm: any) {
    this.pm = pm.target.value;
  }

  searchList() {
    let search = this.searchForm.value;
    if (search.wbs != null) search.wbs = search.wbs.toUpperCase();
    this.validatinDate = false;
    if (search.dataInizio && search.dataFine) {
      if (new Date(search.dataInizio) > new Date(search.dataFine)) {
        this.validatinDate = true;
        return;
      }
    }
    let wbsPerformance = { neutral: false, red: false, orange: false, green: false };
    this.workSpaceService.getWBSList(search).subscribe(response => {
      console.log('all wbs', response);
      response.data.EtWbsList.forEach((item: any) => {
        Object.assign(item, wbsPerformance);
      });
      //  this.getPerformanceDetail(response.data.EtWbsList);
      response.data.EtWbsList = response.data.EtWbsList.map((item: any) => {
        if (item.Performance === '0' || item.Performance === 0) {
          item.class = 'width: 1%;border-left: 10px solid gray';
        }
        if (item.Performance === '1' || item.Performance === 1) {
          item.class = 'width: 1%;border-left: 10px solid green';
        }
        if (item.Performance === '2' || item.Performance === 2) {
          item.class = 'width: 1%;border-left: 10px solid red';
        }
        if (item.Performance === '3' || item.Performance === 3) {
          item.class = 'width: 1%;border-left: 10px solid orange';
        }
        if (item.Status == '1' || item.Status == 1) {
          item.Status = 'Aperta';
        } else if (item.Status == '2' || item.Status == 2) {
          item.Status = 'Chiusa';
        } else if (item.Status == '0' || item.Status == 0) {
          item.Status = 'In Attesa';
        } else {
          item.Status = '';
        }
        return item;
      });

      this.EtWbsList = response.data.EtWbsList;
      this.listaClienti = response.data.EtCustList;
      this.listaPM = response.data.EtPmList;
      /************************ PM ************************/
      /*let EtWbsList:any=[];
    if(this.pm != undefined && this.pm!='' && this.pm != ' '){
      this.EtWbsList.forEach((item:any)=>{
        if(item.ProjectManager == this.pm){
          EtWbsList.push(item);
        }
      });
      this.EtWbsList = EtWbsList;

    }*/
      this.workSpaceService.getWbsPeriodiLast().subscribe((response: any) => {
        this.mese = this.mesi[response.data.EsFcPerio.Fmonth - 1];
        this.anno = response.data.EsFcPerio.Fyear;
        this.perForecast = this.mese + ' ' + this.anno;
        this.dataInvioForecastDa =
          response.data.EsFcPerio.ReleaseFrom == '0000-00-00'
            ? ''
            : response.data.EsFcPerio.ReleaseFrom.split('-')[2] +
              '-' +
              response.data.EsFcPerio.ReleaseFrom.split('-')[1] +
              '-' +
              response.data.EsFcPerio.ReleaseFrom.split('-')[0];
        this.dataInvioForecastA =
          response.data.EsFcPerio.ChangeTo == '0000-00-00'
            ? ''
            : response.data.EsFcPerio.ChangeTo.split('-')[2] +
              '-' +
              response.data.EsFcPerio.ChangeTo.split('-')[1] +
              '-' +
              response.data.EsFcPerio.ChangeTo.split('-')[0];
        this.buttonClose = response.data.EClose;
        this.buttonOpen = response.data.EOpen;
        //**************************************************************************************//
        //                                     SEND
        //**************************************************************************************//
        if (
          this.dataInvioForecastDa == '' ||
          this.dataInvioForecastDa == ' ' ||
          this.dataInvioForecastDa == undefined
        ) {
          let newYear: any;
          let newMonth: any;
          this.mesiValue.forEach((item: any) => {
            if (item.mese == this.mese) {
              if (item.value == 1) {
                newMonth = 12;
                newYear = parseInt(this.anno) - 1;
              } else {
                newMonth = item.value - 1;
                newYear = parseInt(this.anno);
              }
            }
          });
          this.EtWbsList.forEach((list: any) => {
            if (parseInt(list.ActFyear) == newYear && parseInt(list.ActFmonth) == parseInt(newMonth)) {
              list.ctaSend = 'true';
            }
          });
        } else {
          let maxYear = false;
          let objForecastDa: any = {};
          let objCurrentData: any = {};
          let arr_dataInvioForecastDa = this.dataInvioForecastDa.split('-');
          let myDate = new Date();
          let currentDate: any;
          currentDate = this.datePipe.transform(myDate, 'yyyy-MM-dd');
          let arr_currentDate = currentDate.split('-');
          objForecastDa = {
            dd: arr_dataInvioForecastDa[0],
            MM: arr_dataInvioForecastDa[1],
            yy: arr_dataInvioForecastDa[2],
          };
          objCurrentData = { dd: arr_currentDate[2], MM: arr_currentDate[1], yy: arr_currentDate[0] };
          console.log(objForecastDa);
          console.log(objCurrentData);
          if (parseInt(objForecastDa.yy) > parseInt(objCurrentData.yy)) {
            maxYear = true;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) > parseInt(objCurrentData.MM)
          ) {
            maxYear = true;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) == parseInt(objCurrentData.MM) &&
            parseInt(objForecastDa.dd) > parseInt(objCurrentData.dd)
          ) {
            maxYear = true;
          } else if (parseInt(objForecastDa.yy) < parseInt(objCurrentData.yy)) {
            maxYear = false;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) < parseInt(objCurrentData.MM)
          ) {
            maxYear = false;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) == parseInt(objCurrentData.MM) &&
            parseInt(objForecastDa.dd) < parseInt(objCurrentData.dd)
          ) {
            maxYear = false;
          } else if (
            parseInt(objForecastDa.yy) == parseInt(objCurrentData.yy) &&
            parseInt(objForecastDa.MM) == parseInt(objCurrentData.MM) &&
            parseInt(objForecastDa.dd) == parseInt(objCurrentData.dd)
          ) {
            maxYear = false;
          }
          if (maxYear == false) {
            this.EtWbsList.forEach((list: any) => {
              if (
                parseInt(list.ActFyear) == parseInt(response.data.EsFcPerio.Fyear) &&
                parseInt(list.ActFmonth) == parseInt(response.data.EsFcPerio.Fmonth)
              ) {
                list.ctaSend = 'true';
              }
            });
          } else {
            let newYear: any;
            let newMonth: any;
            this.mesiValue.forEach((item: any) => {
              if (item.mese == this.mese) {
                if (item.value == 1) {
                  newMonth = 12;
                  newYear = parseInt(this.anno) - 1;
                } else {
                  newMonth = item.value - 1;
                  newYear = parseInt(this.anno);
                }
              }
            });
            this.EtWbsList.forEach((list: any) => {
              if (parseInt(list.ActFyear) == newYear && parseInt(list.ActFmonth) == parseInt(newMonth)) {
                list.ctaSend = 'true';
              }
            });
          }
        }
      });
    });
    /*for(let i=0 ; i<this.EtWbsList.length;i++){
    console.log(this.EtWbsList[i].TAction);
    }*/

    this.storageService.secureStorage.setItem('wsSearchForm', JSON.stringify(this.searchForm.value));
  }

  resetForm() {
    this.searchForm.reset();
    // this.searchForm.value.stato = '1';
    this.searchForm.controls['stato'].setValue('1');
    this.searchList();
  }

  passDataToWbs(data: any, action_session: any) {
    this.storageService.secureStorage.setItem('action', action_session);
    this.storageService.secureStorage.setItem('wbs', data.Wbs);
    this.storageService.secureStorage.setItem('CommToRead', data.CommToRead);
    this.storageService.secureStorage.setItem('role', data.Role);
    this.storageService.secureStorage.setItem('revType', data.RevType);
    this.router.navigate(['/wbs-manager']);
  }
  // PASSAGGIO PARAMETRI WBS PER IL CONTROLLO DEL APPARIZIONE DELLE CTA E ACTION PER LE AZIONI POSSIBILI DELL'UTENTE
  clickAction(wbs: any, action: any) {
    this.wbs = wbs;
    this.action = action;
  }
  wbs_Aperte_Tutte(event: any) {
    console.log(event.target.value);
  }
  searchAperte() {
    // this.searchForm.value.stato = '1';
    this.searchForm.controls['stato'].setValue('1');
    this.searchList();
  }
  searchTutte() {
    // this.searchForm.value.stato = 'all';
    this.searchForm.controls['stato'].setValue('all');
    this.searchList();
  }
}
