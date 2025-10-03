import { Component, OnInit, Input } from '@angular/core';
import { TBalEmpl } from '../../../model/TBalEmpl.model';

@Component({
	selector: 'tabella-dettaglio',
	templateUrl: './tabella-dettaglio.component.html',
	styleUrls: ['./tabella-dettaglio.component.scss'],
})
export class TabellaDettaglioComponent implements OnInit {
	// Sostituire listaEmplDEt con dataTBalEmp appena avrò il BE
	@Input() dataTBalEmplDet: TBalEmpl | any;

	constructor() {}

	ngOnInit(): void {}
}
