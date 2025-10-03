import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TBalEmpl } from '../../../model/TBalEmpl.model';
import { ExcelService } from '../../../../../reports/services/excel.service';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-dialog-tabella-dettaglio',
	templateUrl: './dialog-tabella-dettaglio.component.html',
	styleUrls: ['./dialog-tabella-dettaglio.component.scss'],
})
export class DialogTabellaDettaglioComponent implements OnInit {
	datiEsportati: any;
	
	constructor(
		@Inject(MAT_DIALOG_DATA) public dataTBalEmplDet: TBalEmpl[],
		private excelService: ExcelService,
		private datePipe: DatePipe
	) 
	{
		this.datiEsportati = [];
	}

	ngOnInit(): void {}

	formattaValore(valore: string): string {
		// 2 cifre decimali con virgola
		const cireDecimali = parseFloat(valore).toFixed(2).toString().replace('.', ',');
		return cireDecimali.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
	}

	esportaDettagliConsuntivo(): void {

		this.datiEsportati = [];

		this.dataTBalEmplDet?.forEach((empl: any) => {
			this.datiEsportati.push({
				CID: empl.Persno,
				Nome: empl.Name,
				Data: this.datePipe.transform(new Date(empl.WorkDate), 'dd/MM/yyyy'),
				TipoLavoro: empl.WorkType,
				Importo: this.formattaValore(empl.Value),
				Ore: this.formattaValore(empl.Quantity),
				SedeLavorativa: empl.Site,
				ProfiloCosto: empl.CostProfile,
			});
		});
		this.excelService.exportAsExcelFile(
			this.datiEsportati,
			'Dettaglio_Dipendente'
		);
	}
}
