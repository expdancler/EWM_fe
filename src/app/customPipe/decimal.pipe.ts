import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalCustomPipe'
})
export class DecimalPipe implements PipeTransform {

  transform(num:any, ndigits: any = 2) {
    return (
      num ? 
      parseFloat(num)
        .toFixed(ndigits)
        .replace('.', ',') // replace decimal point character with ,
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
        : num
    )
  }
}
