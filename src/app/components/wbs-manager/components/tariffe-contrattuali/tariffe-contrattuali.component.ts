import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { WbsManagerService } from '../../services/wbs-manager.service';
import { ProfCtr } from '../model/ProfCtr.model';
import { TEMPL, TPROF, TRATE } from '../constants/init';
import {StorageService} from '../../../../utils/secureStorage';

import {
	MAT_MOMENT_DATE_FORMATS,
	MomentDateAdapter,
	MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
	DateAdapter,
	ErrorStateMatcher,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
} from '@angular/material/core';
import moment from 'moment';

import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import {
	map,
	startWith,
	debounceTime,
	distinctUntilChanged,
} from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfermaEliminazioneComponent } from './dialog/conferma-eliminazione/conferma-eliminazione.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { checkInputNumber } from './utils/validationNumber';

export const MY_FORMATS = {
	parse: {
		dateInput: 'DD/MM/YYYY',
	},
	display: {
		dateInput: 'DD/MM/YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

interface Utente {
	name: string;
	id: string;
}

interface Errore {
	indiceData: number[];
	indiceTariffa: number[];
	indiceProfili: number[];
	indiceDescrizione: number[];
	indiceProfiliDip: number[];
	indiceNominativo: number[];
}

@Component({
	selector: 'app-tariffe-contrattuali',
	templateUrl: './tariffe-contrattuali.component.html',
	styleUrls: ['./tariffe-contrattuali.component.scss'],
	providers: [
		// The locale would typically be provided on the root module of your application. We do it at
		// the component level here, due to limitations of our example generation script.
		{ provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class TariffeContrattualiComponent implements OnInit {
	@Input() dataWBsDetail: any = [{}];
	@Output() aggiornaEsProfCtr: EventEmitter<any> = new EventEmitter();

	public wbs: string;
	public revType: string;
	public listaProfili: any;
	public role: string;
	public action: string;

	public EsProfCtr: ProfCtr | any;
	public nominativi: Utente[] | any;

	public errore: Errore | any = {
		indiceData: [],
		indiceTariffa: [],
		indiceProfili: [],
		indiceDescrizione: [],
		indiceProfiliDip: [],
		indiceNominativi: [],
	};

	public abilitaSalva: boolean;
	public controlNominativo!: FormGroup;
	public formRate!: FormGroup;
	public filtroOpzioni: Observable<Utente[]>[];

	constructor(
		private wbsManagerService: WbsManagerService,
		private fb: FormBuilder,
		public dialog: MatDialog,
		private snackBar: MatSnackBar,
		private storageService: StorageService
	) {
		this.wbs = this.storageService.secureStorage.getItem('wbs') || '';
		this.revType = this.storageService.secureStorage.getItem('revType') || '';
		this.role = this.storageService.secureStorage.getItem('role') || '';
		this.action = this.storageService.secureStorage.getItem('action') || '';

		this.abilitaSalva = false;
		this.filtroOpzioni = [];
	}

	ngOnInit(): void {
		// this.wbs = this.storageService.secureStorage.getItem('wbs') || '';
		// this.revType = this.storageService.secureStorage.getItem('revType') || '';
		this.EsProfCtr = this.dataWBsDetail.data.EsProfCtr;
		// Segno quelli già salvati in modo da disabilitare il campo "profilo"
		this.disableProfileField();

		// Ho bisgono di una copia profonda di EsProfCtr perchè mi permette di far visualizzare le altre tabelle
		// solo quando avviene un salvataggio efffettivo, e non quando semplicemente scriviamo nell'input.
		// this.EsProfCtrDeep = JSON.parse(JSON.stringify(this.dataWBsDetail.data.EsProfCtr));

		this.initListaProfili();

		this.initFormRate();

		this.initNominativiForm();

		let tabTariffe = JSON.parse(this.storageService.secureStorage.getItem('tabTariffe') ?? '{}');
		if (Object.keys(tabTariffe).length === 0) {
			this.wbsManagerService
				.getEmplList(moment().format('YYYY-MM-DD'))
				.subscribe((response: any) => {
					this.nominativi = response.data.EtEmplList.map(
						({Name, Employee}: any) => ({name: Name, persno: Employee})
					);

					for (let i = 0; i < this.EsProfCtr.TEmpl.length; i++) {
						this.gestisoneFiltroControl(i);
					}

					this.storageService.secureStorage.setItem('tabTariffe', JSON.stringify({nominativi: this.nominativi}));
				});
		}else{
			this.nominativi = tabTariffe.nominativi;

			for (let i = 0; i < this.EsProfCtr.TEmpl.length; i++) {
				this.gestisoneFiltroControl(i);
			}
		}
	}

	get rateFormArray(): FormArray {
		return this.formRate.get('rateArray') as FormArray;
	}

	initFormRate() {
		this.formRate = this.fb.group({
			rateArray: new FormArray([]),
		});

		for (const item of this.EsProfCtr.TRate) {
			this.rateFormArray.push(
				this.fb.group({
					// rate: [item.Rate, [Validators.required /* , Validators.min(1), Validators.max(1000000) */]],
					profileId: [item.ProfileId, [Validators.required]],
					startDate: item.StartDate,
					endDate: item.EndDate,
				})
			);
		}

		if (this.disabilitaInputPm()) {
			this.rateFormArray.disable();
		}
	}

	gestisoneFiltroControl(index: number) {
		this.filtroOpzioni[index] = this.nominativiFormArray
			.at(index)
			.get('controlNom')!
			.valueChanges.pipe(
				debounceTime(500),
				distinctUntilChanged(), // Consente di esegukre il callback solo a valore modificato
				startWith(''),
				map(value => (typeof value === 'string' ? value : value.name)),
				map(name => (name ? this._filtro(name) : this.nominativi.slice()))
			);
	}

	initListaProfili() {
		this.listaProfili = this.EsProfCtr.TProf.map(
			({ ProfileId, Profile }: any) => ({
				ProfileId: ProfileId,
				Profile: Profile,
			})
		);
	}

	get nominativiFormArray(): FormArray {
		return this.controlNominativo.get('nominativi') as FormArray;
	}

	initNominativiForm() {
		this.controlNominativo = this.fb.group({
			nominativi: new FormArray([]),
		});

		for (const { Name, Persno } of this.EsProfCtr.TEmpl) {
			this.nominativiFormArray.push(
				this.fb.group({
					controlNom: { name: Name, persno: Persno },
				})
			);
		}

		if (this.disabilitaInputRac()) {
			this.nominativiFormArray.disable();
		}
	}

	displayFn(utente: Utente): string {
		return utente && utente.name ? utente.name : '';
	}

	private _filtro(name: string): Utente[] {
		const filtroValore = name.toLocaleLowerCase();

		return this.nominativi.filter((option: { name: string }) =>
			option.name.toLocaleLowerCase().includes(filtroValore)
		);
	}

	calcolaParametriWbsChange() {
		let isBalanceObj: any = [];
		let TCostElement: any = [];

		for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
			if (this.dataWBsDetail.data.EsForecast.TCostElement[i].CeDetType == 'G') {
				TCostElement.push(this.dataWBsDetail.data.EsForecast.TCostElement[i]);
			}
		}

		this.dataWBsDetail.data.EsBalance.TBalCe.forEach((item: any) => {
			if (item.ManInd === 'X' || item.AutoInd === 'X') {
				const objectToPush = {
					Fyear: item.Fyear,
					Fmonth: item.Fmonth,
					IdRow: item.IdRow,
					CostElement: item.CostElement,
					Description: item.Description,
					Value: item.ValueMan, // valore modifcato manulamente
					ManInd: item.ManInd,
					AutoInd: item.AutoInd,
				};

				isBalanceObj.push(objectToPush);
			}
		});

		const data = {
			IWbs: this.wbs,
			IsForecast: {
				StartDate: this.dataWBsDetail.data.EsForecast.StartDate,
				EndDate: this.dataWBsDetail.data.EsForecast.EndDate,
				TCostElement: TCostElement,
				TCeEmpl: this.dataWBsDetail.data.EsForecast.TCeEmpl,
				TCeCons: this.dataWBsDetail.data.EsForecast.TCeCons,
			},
			IsBalance: {
				TCostElement: isBalanceObj,
				TCeProf: this.dataWBsDetail.data.EsBalance.TBalProf,
			},
			IsProfCtr: this.EsProfCtr,
		};

		return data;
	}

	salvaTariffe() {
		const paylaod = {
			Header: 'X',
			Acr: 'X',
			Balance: 'X',
			Forecast: 'X',
			FcVersn: null,
			Communications: 'X',
			Versions: 'X',
			ProfCtr: 'X',
		};

		const data = this.calcolaParametriWbsChange();
		this.wbsManagerService.getWbsChange(data).subscribe(() => {
			// Faccio refetch dei dati di quelli presenti solo su questa pagina
			this.wbsManagerService
				.getWBSDetail(this.wbs, { ...paylaod })
				.subscribe(response => {
					this.EsProfCtr = { ...response.data.EsProfCtr };
					// this.EsProfCtrDeep = JSON.parse(JSON.stringify(response.data.EsProfCtr));
					this.initListaProfili();

					// Aggiorno nei forecast il nuovo EsProfCtr;
					this.aggiornaEsProfCtr.emit(response);

					// feedback salvataggio
					this.apriSnackBar('Salvataggio avvenuto con successo!', 'Annulla');

					this.disableProfileField();
				});
		});
	}

	// Disabilito i campi di "Profilo" per i record già salvati
	disableProfileField(){
		this.EsProfCtr?.TProf?.forEach((elem: any) => elem.received = true);
		this.EsProfCtr?.TRate?.forEach((elem: any) => elem.received = true);
		this.EsProfCtr?.TEmpl?.forEach((elem: any) => elem.received = true);
	}

	apriSnackBar(messaggio: string, azione: string) {
		this.snackBar.open(messaggio, azione, {
			duration: 3000,
			panelClass: ['blue-snackbar'],
		});
	}

	applicaModifica() {
		// Inzializzo nuovamente la lista profili con le nuove aggiunte nel profilo contrattuale
		this.initListaProfili();

		// Messaggio per avvisare di avere fatto click su applica modifica,
		// altrimenti l'utente non ha un feedback.
		this.apriSnackBar('Modifica avvenuta con successo!', 'Annulla');
	}

	identificaArray(nome: string) {
		switch (nome) {
			case 'TProf':
				// Prendo l'ultimo profileId per poi incrementarlo di 1
				let last = parseInt(this.EsProfCtr[nome]?.at(-1)?.ProfileId);
				let index = last ? (last+1).toString() : "01";
				return {
					...TPROF,
					ProfileId: index.length > 1 ? index : '0'+index,
				};
			case 'TRate':
				return {
					...TRATE,
					StartDate: this.dataWBsDetail.data.EsForecast.StartDate,
					EndDate: this.dataWBsDetail.data.EsForecast.EndDate,
				};
			case 'TEmpl':
				return { ...TEMPL };
			default:
				return;
		}
	}

	// Si occupa di eliminare o aggiungere in FormArray un formBuilder
	gestisciFormDipendenti(name: string, azione: string, index: number = -1) {
		if (azione === 'aggiungi') {
			if (name === 'TEmpl') {
				this.nominativiFormArray.push(
					this.fb.group({
						controlNom: { name: '', persno: '' },
					})
				);
				let indiceRecord = this.nominativiFormArray.length-1;
				this.gestisoneFiltroControl(indiceRecord);
				this.errore.indiceProfiliDip.push(indiceRecord);
				this.errore.indiceNominativi.push(indiceRecord);
			} else if (name === 'TRate') {
				this.rateFormArray.push(
					this.fb.group({
						// rate: ['0', [Validators.required /* , Validators.min(1), Validators.max(1000000) */]],
						profileId: ['', [Validators.required]],
						startDate: this.dataWBsDetail.data.EsForecast.StartDate,
						endDate: this.dataWBsDetail.data.EsForecast.EndDate,
					})
				);
			}
		}
		// Altrimenti, è sicuramente azione = 'elimina'
		else if (index >= 0) {
			if (name === 'TEmpl') {
				this.nominativiFormArray.removeAt(index);
				this.filtroOpzioni.splice(index, 1);
				const indiceArray = this.errore.indiceProfiliDip.findIndex(
					(item: number) => item === index
				);
				if (indiceArray !== -1) {
					this.errore.indiceProfiliDip.splice(indiceArray, 1); // Elimino errore se presente
				}
			} else if (name === 'TRate') {
				this.rateFormArray.removeAt(index);
			}
		}
	}

	aggiungiRiga(key: string) {
		// Inserisco uno nuova riga aggiungendo un nuovo oggetto 'empty'
		this.EsProfCtr[key].push(this.identificaArray(key));
		// Per l'aggiunta di nuovi form group, ma non dei valori effettivi nell'oggetto
		this.gestisciFormDipendenti(key, 'aggiungi');
	}

	visualizzaTabella() {
		// Faccio il check su lista Profili, perchè è qui che aggiungo nuovi profili non ancora salvati.
		const profili = this.listaProfili;

		if (profili.length) {
			if (profili.find(({ Profile }: any) => Profile !== '')) {
				return true;
			}
		}

		return false;
	}

	identificaArrayErrore(key: string) {
		switch (key) {
			case 'TProf':
				return 'indiceProfili';
			case 'TRate':
				return 'indiceTariffa';
			default:
				return '';
		}
	}

	ricalcolaIndiceErrore(tipoErrore: string, indice: number) {
		const indiceErrore = this.errore[tipoErrore].findIndex(
			(item: number) => item === indice
		);

		// Se ho più di un elemento
		if (this.errore[tipoErrore]?.length > 1) {
			// Verifico se l'indice corrisponde all'ultimo elemento, se non è così, vuol dire che ho eliminato
			// un errore nel mezzo della riga, quindo dopo ho altre righe con possibili errori
			if (this.errore[tipoErrore].at(-1) !== indice) {
				// Parto dall'indice errore + 1, perch+ indice errore lo elimino dopo
				for (
					let i = indiceErrore + 1;
					i < this.errore[tipoErrore].length;
					i++
				) {
					// Decremento di 1 tutti i valori dopo l'indice eliminato
					this.errore[tipoErrore][i] = this.errore[tipoErrore][i] - 1;
				}
			}
		}

		return indiceErrore;
	}

	eliminaErrore(indice: number, key: string) {
		const tipoErrore = this.identificaArrayErrore(key);

		let indiceErrore = this.ricalcolaIndiceErrore(tipoErrore, indice);

		// Se mi trovo ad avere un array errore
		if (tipoErrore) {
			if (tipoErrore === 'indiceTariffa') {
				if (this.errore.indiceTariffa.length)
					this.errore.indiceTariffa.splice(indiceErrore, 1);
				if (this.errore.indiceData.length) {
					// Ricalco indice errore per altro array di errore
					indiceErrore = this.ricalcolaIndiceErrore('indiceData', indice);
					this.errore.indiceData.splice(indiceErrore, 1);
				}
			} else {
				if (this.errore.indiceProfili.length)
					this.errore.indiceProfili.splice(indiceErrore, 1);
				if (this.errore.indiceDescrizione.length) {
					indiceErrore = this.ricalcolaIndiceErrore(
						'indiceDescrizione',
						indice
					);
					this.errore.indiceDescrizione.splice(indiceErrore, 1);
				}
			}
		}
	}

	eliminaRiga(indice: number, key: string, profileId: string) {
		// const lunghezzaArray = this.EsProfCtr[key].length - 1;

		// Entro in eliminaProfiloAssociato se profileId esiste, altrimenti vuol dire che non ho aggiunto
		// nulla, è una riga vuota
		if (key === 'TProf' && profileId) {
			this.eliminaProfiloAssociato(profileId);

			let i = 0;
			do{
				if (this.rateFormArray.value[i].profileId === profileId)
					this.rateFormArray.removeAt(i);
				else i++;
			}while(i<this.rateFormArray.length)

			i = 0;
			do{
				if (this.nominativiFormArray.value[i].profileId === profileId)
					this.nominativiFormArray.removeAt(i);
				else i++;
			}while(i<this.nominativiFormArray.length)
		} else {
			this.EsProfCtr[key]?.splice(indice, 1);
		}

		this.gestisciFormDipendenti(key, 'elimina', indice);

		// // Vuol dire che ho eliminato non l'ultima riga
		// if (key !== 'TEmpl' && indice < lunghezzaArray) {
		// 	const arrayRestante = this.EsProfCtr[key].slice(indice);
		// 	// da quell'indice eliminato in poi aggiorno i profileId, facendo -1 a tutti associato allo stesso profilo
		// 	arrayRestante.forEach((itemProfCtr: any) => {
		// 		const arrayChiaviOggetto = Object.keys(itemProfCtr);
		// 		const chiaveOggetto = arrayChiaviOggetto.includes('RateId')
		// 			? 'RateId'
		// 			: 'ProfileId';
		//
		// 		// da sistemare
		// 		if (chiaveOggetto === 'ProfileId') itemProfCtr[chiaveOggetto]--;
		// 		else if (itemProfCtr.ProfileId && itemProfCtr.ProfileId === profileId)
		// 			itemProfCtr[chiaveOggetto]--;
		// 	});
		// }

		this.eliminaErrore(indice, key);
	}

	eliminaProfiloAssociato(profileId: string) {
		// Se elimino un Profilo, tutte le righe che hanno quel profilo inserito
		// Ciclo per eliminare gli item che hanno lo stesso profileId
		// { T: [{}], C: [{}]}

		for (const key in this.EsProfCtr) {
			this.EsProfCtr[key] = this.EsProfCtr[key].filter((r: any) => parseInt(r.ProfileId) !== parseInt(profileId))
		}

		// Aggiorno la lista profili che uso come valori temporanei per la visualizzazione di tabelle, se essi esistono,
		// o per la visualizzazione dei profili nelle combo
		this.initListaProfili();
	}

	aggiornaRateIdRiga({ value }: any, TRate: any) {
		let maxRate = 0;
		this.EsProfCtr.TRate.forEach((r: any) => {
			if (r.ProfileId == value) {
				let rate = parseInt(r.RateId) ?? 0
				if (rate > maxRate)
					maxRate = r.RateId;
			}
		});

		maxRate++;

		TRate.ProfileId = value;
		TRate.RateId = maxRate > 9 ? maxRate.toString() : '0'+maxRate;

		this.validazioneDate({target: {value: TRate.StartDate}}, TRate, 1, 'StartDate');
	}

	selezioneProfiloDip(TEmpl: any) {
		return this.listaProfili.find(
			({ ProfileId }: any) => ProfileId === TEmpl.ProfileId
		).Profile;
	}

	padTo2Digits(valore: any) {
		return valore.toString().padStart(2, '0');
	}

	formattaData(data: string) {
		const d = new Date(data);
		const mese = this.padTo2Digits(d.getMonth() + 1);
		const giorno = this.padTo2Digits(d.getDate());
		const anno = d.getFullYear();

		return [anno, mese, giorno].join('-');
	}
	// Inizio validita maggiore di fine validita
	validazioneDate(event: any, TRate: any, index: number, tipo: string) {
		const data = event.target.value;

		// Aggiorno la data
		TRate[tipo] = this.formattaData(data);

		// creo una copia dell'oggetto cosi da avere modifiche isolate
		let trateObj = [...this.EsProfCtr.TRate];

		// Uso questo for perchè mi serve l'indice di riferimento
		// Prendo ogni riga
		for(let i = 0; i < trateObj.length; i++){
			// Verifico che sia del profilo che mi interessa
			if (trateObj[i].ProfileId === TRate.ProfileId){
				let errore = false;
				// Vedo se la riga è già segnata come errore
				const indexArray = this.errore.indiceData.findIndex(
					(item: number) => item === i
				);
				// Se ha le date incrociate, non vado avanti, tanto è errore
				if (this.dataInzialeMaggioreFinale(trateObj[i])){
					errore = true;
				}else{
					// altrimenti faccio il confronto con ogni riga dello stesso profilo
					for(let j = 0; j < trateObj.length; j++){
						if (trateObj[j].ProfileId === TRate.ProfileId && i !== j){
							if ( this.dataInclusa(trateObj[j].StartDate, trateObj[j].EndDate, trateObj[i])) {
								errore = true;
								break;
							}
						}
					}
				}

				if (errore) {
					// se c'è un errore ma non è stato ancora inserito nell'array, lo aggiungo
					if (indexArray === -1) this.errore.indiceData.push(i);
				} else {
					// se non c'è l'errore ma prima c'era (quindi è presente nell'array), lo levo
					if (indexArray !== -1) {
						this.errore.indiceData.splice(indexArray, 1);
						this.errore = { ...this.errore };
					}
				}
			}
		}
	}

	valoreIncluso(valore: any, rangeStart: any, rangeEnd: any) {
		if (valore >= rangeStart && valore <= rangeEnd) return true;
		return false;
	}

	dataInclusa(StartDate: string, EndDate: string, TRate: any) {
		const dataInziale = new Date(StartDate).getTime();
		const dataFinale = new Date(EndDate).getTime();

		const dataInzialeInserita = new Date(TRate.StartDate).getTime();
		const dataFinaleInserita = new Date(TRate.EndDate).getTime();

		if (
			this.valoreIncluso(dataInzialeInserita, dataInziale, dataFinale) ||
			this.valoreIncluso(dataFinaleInserita, dataInziale, dataFinale) ||
			(dataInzialeInserita < dataInziale && dataFinaleInserita > dataFinale)
		)
			return true;

		return false;
	}

	dataInzialeMaggioreFinale(TRate: any) {
		const dataInziale = new Date(TRate.StartDate).getTime();
		const dataFinale = new Date(TRate.EndDate).getTime();

		if (dataInziale > dataFinale) return true;

		return false;
	}

	nominativoSelezionato(event: any, index: number) {
		this.EsProfCtr.TEmpl[index].Name = event.option.value.name;
		this.EsProfCtr.TEmpl[index].Persno = event.option.value.persno;
		this.validazioneNominativo(this.EsProfCtr.TEmpl[index], index, undefined, {persno: event.option.value.persno, name: event.option.value.name});
	}

	validazioneProfilo(event: any, tprof: any, indice: number) {
		// Il confronto lo faccio con le altre righe tranne quella cui sto inserendo il valore
		const tprofFiltro = [...this.EsProfCtr?.TProf]; // copia dell'oggetto, per avere modifiche isolate.
		tprofFiltro.splice(indice, 1);

		// Verfiico se il PROFILO appena inserito è già presente, e restituisco il PROFILO presente
		const profiloUguale = tprofFiltro.find(
			({ Profile }: { Profile: string }) =>
				event.target.value.toLocaleLowerCase() === Profile.toLocaleLowerCase()
		)?.Profile;

		// Verifico se l'indice di quella riga è presente all'interno dell'array 'indiceProfili'
		// Se così, prendo il suo indice effettive in questu'ultimo array.
		const indiceArray = this.errore.indiceProfili.findIndex(
			(item: number) => item === indice
		);

		// Se Ho trovato almeno un profilo uguale entro...
		// Oppure se ho PROFILO vuoto, è un errore ed entro
		if (profiloUguale || !event.target.value) {
			// Se non ho già inserito l'indice lo inserisco
			if (indiceArray === -1) this.errore.indiceProfili.push(indice); // Push errore
		} else {
			if (indiceArray !== -1) {
				this.errore.indiceProfili.splice(indiceArray, 1); // Elimino errore se presente
				// this.EsProfCtr.TProf[indice].Profile = event.target.value;
				// tprof.Profile = event.target.value; // Aggiorno il valore
			}
		}

		tprof.Profile = event.target.value; // Aggiorno il valore
	}

	validazioneDescrizione(event: any, tprof: any, indice: number) {
		const indiceArray = this.errore.indiceDescrizione.findIndex(
			(item: number) => item === indice
		);

		//
		if (!event.target.value) {
			if (indiceArray === -1) this.errore.indiceDescrizione.push(indice); // Push errore
		} else {
			if (indiceArray !== -1) {
				this.errore.indiceDescrizione.splice(indiceArray, 1); // Elimino errore se presente
				// this.EsProfCtr.TProf[indice].Description = event.target.value;

				// tprof.Description = event.target.value; // Aggiorno il valore
			}
		}

		tprof.Description = event.target.value;
	}

	validazioneProfiloDip({ value }: any, templ: any, indice: number) {
		const indiceArray = this.errore.indiceProfiliDip.findIndex(
			(item: number) => item === indice
		);

		//
		if (!value) {
			if (indiceArray === -1) this.errore.indiceProfiliDip.push(indice); // Push errore
		} else {
			if (indiceArray !== -1) {
				this.errore.indiceProfiliDip.splice(indiceArray, 1); // Elimino errore se presente
			}
		}

		// templ.ProfileId = value;
	}

	validazioneNominativo(templ: any, indice: number, event?: any, newValue?: any, ) {
		const indiceArray = this.errore.indiceNominativi.findIndex(
			(item: number) => item === indice
		);

		// Se il nuovo valore è stato selezionato dalla lista
		if (newValue){
			if (indiceArray !== -1) {
				this.errore.indiceNominativi.splice(indiceArray, 1); // Elimino errore se presente
			}
		} else {
			// Se non ho già inserito l'indice lo inserisco
			if (indiceArray === -1) this.errore.indiceNominativi.push(indice); // Push errore
		}

		// tprof.Profile = event.target.value; // Aggiorno il valore
	}

	campiVuoti() {
		for (const tprof of this.EsProfCtr?.TProf) {
			if (!tprof.Profile || !tprof.Description) return true;
		}

		return false;
	}

	aggiornaRate(event: any, TRate: any, index: number) {
		// TRate.Rate = this.unFormatRate(event.target.value);
		const value = event.target.value.replaceAll('.', '').replaceAll(',', '.');
		const errore = checkInputNumber(event);
		const indice = this.errore.indiceTariffa.indexOf(index);

		if (!errore) {
			this.errore.indiceTariffa.splice(indice, 1);
			TRate.Rate = value;
		} else {
			if (indice === -1) this.errore.indiceTariffa.push(index);
		}
	}

	trovaIndiceErrore(index: number, indiceTipo: string) {
		// Sto prendendo l'indice di ciò che ho aggiunto nell'oggetto errore
		const indiceErrore = this.errore[indiceTipo].indexOf(index);

		if (indiceErrore !== -1) return true;

		return false;
	}

	confermaEliminaRigaDialog(index: number, key: string, profileId: string): void {
		const dialogRef = this.dialog.open(ConfermaEliminazioneComponent);

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.eliminaRiga(index, key, profileId);
			}
		});
	}

	disabilitaApplicaModifica() {
		return (
			!!this.errore.indiceProfili.length ||
			!!this.errore.indiceDescrizione.length ||
			this.campiVuoti()
		);
	}

	disabilitaSalvaTabella() {
		return (
			!!this.errore.indiceData.length ||
			!!this.errore.indiceTariffa.length ||
			!!this.errore.indiceProfiliDip.length ||
			!!this.errore.indiceNominativi.length ||
			this.disabilitaApplicaModifica()
		);
	}

	// disabilitaApplicaModifica() {
	// 	return (!!this.errore.indiceProfili.length ||
	// 		!!this.errore.indiceDescrizione.length ||
	// 		this.campiVuoti())
	// }

	abilitaButtonPm(): boolean {
		return this.action === 'CHANGE' && this.role !== 'PM';
	}

	abilitaButtonRac(): boolean {
		return this.action === 'CHANGE' && this.role !== 'RAC';
	}

	disabilitaInputPm(): boolean {
		return (
			this.action === 'DISPLAY' ||
			(this.action === 'CHANGE' && this.role === 'PM')
		);
	}

	disabilitaInputRac(): boolean {
		return (
			this.action === 'DISPLAY' ||
			(this.action === 'CHANGE' && this.role === 'RAC')
		);
	}
}
