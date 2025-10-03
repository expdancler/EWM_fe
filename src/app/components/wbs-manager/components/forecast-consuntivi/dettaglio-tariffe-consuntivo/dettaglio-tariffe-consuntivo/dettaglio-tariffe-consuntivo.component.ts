import { Component, Input, OnInit } from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { TARIFFE_INIT } from '../../../constants/tariife-consuntivo';
import { checkInputNumber } from '../../../tariffe-contrattuali/utils/validationNumber';

@Component({
	selector: 'dettaglio-tariffe-consuntivo',
	templateUrl: './dettaglio-tariffe-consuntivo.component.html',
	styleUrls: ['./dettaglio-tariffe-consuntivo.component.scss'],
})
export class DettaglioTariffeConsuntivoComponent implements OnInit {
	@Input() dataWBsDetail: any;
	@Input() readOnly: boolean = false;
	@Input() meseCardSelezionato: string;
	@Input() annoCardSelezionato: string;

	public tariffeConsuntivo: any;
	public listaProfili: any;
	public indiceErrore: number[];
	public totaleQuantity: number;

	public profiloFormGroup!: FormGroup;

	constructor(private _formBuilder: FormBuilder) {
		this.indiceErrore = [];
		this.meseCardSelezionato = '';
		this.annoCardSelezionato = '';
		this.totaleQuantity = 0;
	}

	ngOnInit(): void {
		this.tariffeConsuntivo = this.dataWBsDetail.data.EsBalance.TBalProf;

		const trate = this.dataWBsDetail.data.EsProfCtr.TRate;
		const tprof = this.dataWBsDetail.data.EsProfCtr.TProf;

		this.listaProfili = trate.map((item: any) => ({
			...item,
			Profile: tprof.find(({ ProfileId }: any) => item.ProfileId === ProfileId)
				.Profile,
		}));

		this.initProfilo();

		this.listaProfili.push({
			Profile: 'ALTRO',
			ProfileId: '00',
			RateId: '00',
			Rate: '',
			Fmonth: this.meseCardSelezionato,
			Fyear: this.annoCardSelezionato,
		});
	}

	mostraTotali():boolean {
		let len = this.dataWBsDetail.data.EsBalance.TBalProf
			.filter((card: any) => card.Fyear == this.annoCardSelezionato && card.Fmonth == this.meseCardSelezionato)
			.length
		return len > 0;
	}

	get profiloFormArray(): FormArray {
		return this.profiloFormGroup.get('profiloArray') as FormArray;
	}

	initProfilo() {
		this.profiloFormGroup = this._formBuilder.group({
			profiloArray: new FormArray([]),
		});

		for (const item of this.dataWBsDetail.data.EsBalance.TBalProf) {
			this.profiloFormArray.push(
				this._formBuilder.group({
					Profilo: [item, [Validators.required]],
				})
			);
		}
	}

	compareObjects(o1: any, o2: any): boolean {
		if (o1.ProfileId == o2.ProfileId && o1.RateId == o2.RateId) return true;

		return false;
	}

	aggiungiRiga(): void {
		this.dataWBsDetail.data.EsBalance.TBalProf.push({
			...TARIFFE_INIT,
			Fmonth: this.meseCardSelezionato,
			Fyear: this.annoCardSelezionato,
		});

		// Form del profilo, per la validazione
		this.profiloFormArray.push(
			this._formBuilder.group({
				Profilo: ['', [Validators.required]],
			})
		);
	}

	eliminaRiga(index: number): void {
		//Elimino la riga nell'indice passato;
		this.dataWBsDetail.data.EsBalance.TBalProf.splice(index, 1);

		// Elimino il form 
		this.profiloFormArray.removeAt(index);
	}

	tariffaSelezionata({ value }: any, index: number): void {
		// Setto il Value = '', perchè se ho Altro salvato, e cambio prpfilo, rimane il vechcio value
		this.dataWBsDetail.data.EsBalance.TBalProf[index] = {
			...this.dataWBsDetail.data.EsBalance.TBalProf[index],
			...value,
			Fmonth: this.meseCardSelezionato,
			Fyear: this.annoCardSelezionato,
			Value: '',
		};
	}

	sumQuantity(){
		let sum = this.dataWBsDetail.data.EsBalance.TBalProf
			.filter((card: any) => card.Fyear == this.annoCardSelezionato && card.Fmonth == this.meseCardSelezionato)
			.reduce((sum: any, current: any) => parseFloat(sum) + parseFloat(current.Quantity ? current.Quantity : "0"), 0);

		return sum;
	}

	calcolaImporto(event: any, index: number): void {
		const tariffaCons = this.dataWBsDetail.data.EsBalance.TBalProf[index];

		tariffaCons.Quantity = event.target.value;

		let val = event.target.value.replaceAll('.', '').replaceAll(',', '.');
		let errore = checkInputNumber(event);

		if (tariffaCons.Rate && !errore) {
			const giorni = parseFloat(val);
			const tariffa = parseFloat(tariffaCons.Rate);
			tariffaCons.Quantity = giorni;
			tariffaCons.Value = (giorni * tariffa).toFixed(2).toString();
		}
	}

	selettore({ checked }: any, index: number): void {
		if (checked) this.dataWBsDetail.data.EsBalance.TBalProf[index].ManInd = 'X';
		else this.dataWBsDetail.data.EsBalance.TBalProf[index].ManInd = '';
	}

	visualizzazioneSelezioneProfilo(profilo: any): string {
		if (profilo.Rate) {
			return profilo.Profile + ' - ' + profilo.Rate;
		}

		return profilo.Profile;
	}

	consuntivoTmImporto(event: any, tariffaCons: any, index: number): void {
		const value = event.target.value.replaceAll('.', '').replaceAll(',', '.');
		const errore = checkInputNumber(event);
		const indice = this.indiceErrore.indexOf(index);

		if (!errore) {
			this.indiceErrore.splice(indice, 1);
			tariffaCons.Value = value;
		} else {
			if (indice === -1) this.indiceErrore.push(index);
		}
	}

	trovaIndiceErrore(index: number): boolean {
		return this.indiceErrore.indexOf(index) !== -1 ? true : false;
	}
}
