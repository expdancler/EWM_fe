import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { WbsManagerService } from '../../services/wbs-manager.service';
import {StorageService} from '../../../../utils/secureStorage';

@Component({
  selector: 'app-acr',
  templateUrl: './acr.component.html',
  styleUrls: ['./acr.component.scss'],
})
export class AcrComponent implements OnInit, OnChanges {
  // @Input() wbs: any;
  wbs: any;
  @Input() dataWBsDetail: any = [{}];
  recivedData: any = [];
  EsAcr: any = {};
  overviewAcrProgress: any;
  EsAcrFirst: any = {};

  // ARRAY TABELLA DETTAGLIO ACR
  detailAcr: any = [];
  detailAcrFirst: any = [];

  // ARRAY TABELLA VOCI DI COSTO
  vociDiCosto: any = [];
  vociDiCosto_first: any = [];
  // BARRA PROGRESSO AVANZAMENTO RICAVI E COSTI
  overviewRicavi: any;
  overviewCosti: any;
  overviewFatturazione: any;

  doesDataWbsDetailExist: boolean = false;

  constructor(private wbsManagerService: WbsManagerService,private storageService: StorageService) {}

  ngOnInit(): void {
    // resetta lo scroll della pagina
    window.scrollTo(0, 0);

    this.wbs = this.storageService.secureStorage.getItem('wbs');

    this.wbsManagerService.dataAcr.subscribe(response => {
      if (response?.data) {
        // DETTAGLIO ACR
        this.getDetailAcr(response.data);

        // VOCI DI COSTO
        this.getDetailVociDiCosto(response.data);
      }
      // this.wbsManagerService.getWBSDetail(this.wbs).subscribe((response: any) => {
      //   this.dataWBsDetail = response;
      //   this.barra_avanzamentoRicavi();
      //   this.barra_avanzamentoCosti();
      //   this.barra_avanzamentoFatturazione();
      //   console.log(this.dataWBsDetail);
      // });
    });
  }

  // Siccome i dati li ricevo da input, appena arrivano eseguo il calcolo della barra
  ngOnChanges(): void {
    if (this.dataWBsDetail.data) {
      this.barra_avanzamentoRicavi();
      this.barra_avanzamentoCosti();
      this.barra_avanzamentoFatturazione();
    }
  }

  getDetailAcr(responseData: any) {
    let startDate = new Date(responseData.EsAcr.StartDate);
    let endDate = new Date(responseData.EsAcr.EndDate);
    responseData.EsAcr.StartDate = startDate.getMonth() + 1 + '/' + startDate.getDate() + '/' + startDate.getFullYear();
    responseData.EsAcr.EndDate = endDate.getMonth() + 1 + '/' + endDate.getDate() + '/' + endDate.getFullYear();
    let date = new Date();
    let todaydate = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
    let startDateToToday = this.datediff(this.parseDate(responseData.EsAcr.StartDate), this.parseDate(todaydate));
    let startDateToEndDate = this.datediff(
      this.parseDate(responseData.EsAcr.StartDate),
      this.parseDate(responseData.EsAcr.EndDate)
    );
    let monitorationProgress = (100 / startDateToEndDate) * startDateToToday;
    if (monitorationProgress >= 100) {
      this.overviewAcrProgress = 100;
    } else {
      this.overviewAcrProgress = (100 / startDateToEndDate) * startDateToToday;
    }
    this.EsAcr = responseData.EsAcr;
    this.EsAcrFirst = responseData.EsAcrFirst;
    //------------------------- DETAIL ACR FIRST -----------------------------
    this.detailAcrFirst = responseData.EsAcrFirst.TCostElement.reduce((itemSearch: any, item: any) => {
      const found = itemSearch.find(
        (dettaglioAcr: any) => dettaglioAcr.Fyear === item.Fyear && dettaglioAcr.Fmonth === item.Fmonth
      );
      if (!found) {
        itemSearch.push({ Fyear: item.Fyear, Fmonth: item.Fmonth, data: [item] });
      } else {
        found.data.push(item);
      }
      return itemSearch;
    }, []);
    this.detailAcrFirst.forEach((element: any) => {
      let costoAcr: any = [];
      let ricavoAcr: any = [];
      element.data.forEach((item: any) => {
        item.Value = parseFloat(item.Value);
        if (item.CeInd === 'C') {
          costoAcr.push(item.Value);
        }
        if (item.CeInd === 'R') {
          ricavoAcr.push(item.Value);
        }
      });
      if (costoAcr.length > 0) {
        let sumCostoAcr = costoAcr.reduce((x: any, y: any) => x + y);
        element.sumCostoAcr = sumCostoAcr;
      } else {
        element.sumCostoAcr = '-';
      }
      if (ricavoAcr.length > 0) {
        var sumRicavoAcr = ricavoAcr.reduce((x: any, y: any) => x + y);
        element.sumRicavoAcr = sumRicavoAcr;
      } else {
        element.sumRicavoAcr = '-';
      }
    });
    //----------------------- DETAIL ACR -----------------------------------
    this.detailAcr = responseData.EsAcr.TCostElement.reduce((itemSearch: any, item: any) => {
      const found = itemSearch.find(
        (dettaglioAcr: any) => dettaglioAcr.Fyear === item.Fyear && dettaglioAcr.Fmonth === item.Fmonth
      );
      if (!found) {
        itemSearch.push({ Fyear: item.Fyear, Fmonth: item.Fmonth, data: [item] });
      } else {
        found.data.push(item);
      }
      return itemSearch;
    }, []);
    this.detailAcr.forEach((element: any) => {
      let costoAcr: any = [];
      let ricavoAcr: any = [];
      element.data.forEach((item: any) => {
        item.Value = parseFloat(item.Value);
        if (item.CeInd === 'C') {
          costoAcr.push(item.Value);
        }
        if (item.CeInd === 'R') {
          ricavoAcr.push(item.Value);
        }
      });
      if (costoAcr.length > 0) {
        let sumCostoAcr = costoAcr.reduce((x: any, y: any) => x + y);
        element.sumCostoAcr = sumCostoAcr;
      } else {
        element.sumCostoAcr = '-';
      }
      if (ricavoAcr.length > 0) {
        var sumRicavoAcr = ricavoAcr.reduce((x: any, y: any) => x + y);
        element.sumRicavoAcr = sumRicavoAcr;
      } else {
        element.sumRicavoAcr = '-';
      }
    });
    const Months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    this.detailAcrFirst.sort((a: any, b: any) => {
      if (+a.Fyear !== +b.Fyear) return b.Fyear - a.Fyear;
      return Months.indexOf(a.Fmonth) - Months.indexOf(b.Fmonth);
    });
    this.detailAcr.sort((a: any, b: any) => {
      if (+a.Fyear !== +b.Fyear) return b.Fyear - a.Fyear;
      return Months.indexOf(a.Fmonth) - Months.indexOf(b.Fmonth);
    });
  }

  getDetailVociDiCosto(responseData: any) {
    this.vociDiCosto = responseData.EsAcr.TCostElement.reduce((itemSearch: any, item: any) => {
      const found = itemSearch.find((vociDiCosto: any) => vociDiCosto.CostElement === item.CostElement);
      if (!found) {
        // non visualizzate i ricavi
        if (item.CeInd != 'R') {
          itemSearch.push({ CostElement: item.CostElement, DescrCe: item.DescrCe, data: [item] });
        }
      } else {
        found.data.push(item);
      }
      return itemSearch;
    }, []);
    this.vociDiCosto.forEach((element: any) => {
      let CostElement: any = [];
      element.data.forEach((item: any) => {
        CostElement.push(item.Value);
      });
      let totalCost = CostElement.reduce((x: any, y: any) => x + y);
      element.totalCost = totalCost;
    });
    // voci di costi iniziali
    this.vociDiCosto_first = responseData.EsAcrFirst.TCostElement.reduce((itemSearch: any, item: any) => {
      const found = itemSearch.find((vociDiCosto: any) => vociDiCosto.CostElement === item.CostElement);
      if (!found) {
        // non visualizzate i ricavi
        if (item.CeInd != 'R') {
          itemSearch.push({ CostElement: item.CostElement, DescrCe: item.DescrCe, data: [item] });
        }
      } else {
        found.data.push(item);
      }
      return itemSearch;
    }, []);
    this.vociDiCosto_first.forEach((element: any) => {
      let CostElement: any = [];
      element.data.forEach((item: any) => {
        CostElement.push(item.Value);
      });
      let totalCost = CostElement.reduce((x: any, y: any) => x + y);
      element.totalCost = totalCost;
    });
  }

  parseDate(str: any) {
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0] - 1, mdy[1]);
  }

  datediff(first: any, second: any) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
  }

  barra_avanzamentoRicavi() {
    this.overviewRicavi = parseFloat(this.dataWBsDetail.data.EsBalance.Revenues) / parseFloat(this.EsAcr.Revenues);
    this.overviewRicavi = Math.round((this.overviewRicavi + Number.EPSILON) * 100) / 100;
    this.overviewRicavi = this.overviewRicavi * 100;
    this.overviewRicavi = Math.round((this.overviewRicavi + Number.EPSILON) * 100) / 100;
    if (this.overviewRicavi > 100) {
      this.overviewRicavi = 100.00;
    }
  }
  barra_avanzamentoCosti() {
    this.overviewCosti = parseFloat(this.dataWBsDetail.data.EsBalance.Costs) / parseFloat(this.EsAcr.Costs);
    this.overviewCosti = Math.round((this.overviewCosti + Number.EPSILON) * 100) / 100;
    this.overviewCosti = this.overviewCosti * 100;
    this.overviewCosti = Math.round((this.overviewCosti + Number.EPSILON) * 100) / 100;
    if (this.overviewCosti > 100) {
      this.overviewCosti = 100.00;
    }
  }
  barra_avanzamentoFatturazione() {
    this.overviewFatturazione = parseFloat(this.dataWBsDetail.data.EsBalance.Billing) / parseFloat(this.EsAcr.Revenues);
    this.overviewFatturazione = Math.round((this.overviewFatturazione + Number.EPSILON) * 100) / 100;
    this.overviewFatturazione = this.overviewFatturazione * 100;
    this.overviewFatturazione = Math.round((this.overviewFatturazione + Number.EPSILON) * 100) / 100;
    if (this.overviewFatturazione > 100) {
      this.overviewFatturazione = 100.00;
    }
  }
}
