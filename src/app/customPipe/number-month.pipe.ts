import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'numberMonth'
})
export class NumberMonthPipe implements PipeTransform {

  transform(number: string): string {
    let month = '';
    switch (number){
      case '01':
        month = 'Gennaio'
        break;
      case '02':
        month = 'Febbraio'
        break;
      case '03':
        month = 'Marzo'
        break;
      case '04':
        month = 'Aprile'
        break;
      case '05':
        month = 'Maggio'
        break;
      case '06':
        month = 'Giugno'
        break;
      case '07':
        month = 'Luglio'
        break;
      case '08':
        month = 'Agosto'
        break;
      case '09':
        month = 'Settembre'
        break;
      case '10':
        month = 'Ottobre'
        break;
      case '11':
        month = 'Novembre'
        break;
      case '12':
        month = 'Dicembre'
        break;
      default:

    }
    return month;
  }
}
