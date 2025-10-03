import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'cutMonth'
})
export class CutMonthPipe implements PipeTransform {

  transform(number: string): string {
    let month = '';
    switch (number){
      case '01':
        month = 'Gen'
        break;
      case '02':
        month = 'Feb'
        break;
      case '03':
        month = 'Mar'
        break;
      case '04':
        month = 'Apr'
        break;
      case '05':
        month = 'Mag'
        break;
      case '06':
        month = 'Giu'
        break;
      case '07':
        month = 'Lug'
        break;
      case '08':
        month = 'Ago'
        break;
      case '09':
        month = 'Set'
        break;
      case '10':
        month = 'Ott'
        break;
      case '11':
        month = 'Nov'
        break;
      case '12':
        month = 'Dic'
        break;
      default:

    }
    return month;
  }
}
