import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public exportAllDataAsExcelFile(data: any, excelFileName: string): void {
    // TODO bisognerebbe renderlo modulare
    const wsHeader: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.Hdr ?? []);
    const wsYear: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.Fy ?? []);
    const wsMonth: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.Fm ?? []);
    const wsBalance: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.Bal ?? []);
    const wsForecast: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.For ?? []);
    const wsAcr: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.Acr ?? []);
    const wsBilling: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.Bil ?? []);
    const workbook: XLSX.WorkBook = {
      Sheets: {
        'Dati Vita Intera': wsHeader,
        'Dati Esercizio': wsYear,
        'Dati Periodo': wsMonth,
        'Dettaglio Consuntivo': wsBalance,
        'Dettaglio Forecast': wsForecast,
        'ACR': wsAcr,
        'Fatturazione':  wsBilling
      },
      SheetNames: ['Dati Vita Intera', 'Dati Esercizio', 'Dati Periodo', 'Dettaglio Consuntivo', 'Dettaglio Forecast', 'ACR', 'Fatturazione']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }
}
