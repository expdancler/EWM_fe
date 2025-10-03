import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { checkInputNumber } from '../../../tariffe-contrattuali/utils/validationNumber';

export interface Tariffa {
	Profile: string;
	ProfileId: string;
	Rate: string;
	RateId: string;
	StartDate: string;
	EndDate: string;
}

@Component({
	selector: 'app-dialog-tariffe',
	templateUrl: './dialog-tariffe.component.html',
	styleUrls: ['./dialog-tariffe.component.scss'],
})
export class DialogTariffeComponent implements OnInit {
	listaTariffeContrattuali: any;
	visualizzazioneInizialeCombo: any;
	profiliContrattuali: any;
	tariffa: Tariffa = {
		Profile: '',
		ProfileId: '',
		Rate: '',
		RateId: '',
		StartDate: '',
		EndDate: '',
	};
	erorreImportoManuale = false;
	itemInit: any;

	constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<DialogTariffeComponent>) {}

	ngOnInit(): void {
		// Prenso il TCempl passato inizialmente, cosi da fare il merge dopo, per ottenre l'anno, e altri dati
		this.itemInit = this.data.item;
		this.tariffa = {
			Profile: this.itemInit.Profile,
			ProfileId: this.itemInit.ProfileId,
			Rate: this.itemInit.Rate,
			RateId: this.itemInit.RateId,
			StartDate: this.itemInit.StartDate,
			EndDate: this.itemInit.EndDate,
		};
	}

	tariffaSelezionata({ value }: any) {
		// mi serve per passare i dati al componente che chiama questo dialog
		this.tariffa = value;
	}

	// Se seleziono Altro, lo start date e l'end date e rateId quali sono?
	confermaSelezione() {
		const oggettoSelezioanto = {
			Profile: this.tariffa?.Profile ?? '',
			ProfileId: this.tariffa?.ProfileId ?? '',
			Rate: this.tariffa?.Rate ?? '',
			RateId: this.tariffa?.RateId ?? '',
			StartDate: this.tariffa?.StartDate ?? '',
			EndDate: this.tariffa?.EndDate ?? '',
		};

		const oggettoMerge = { ...this.itemInit, ...oggettoSelezioanto };

		this.dialogRef.close({
			data: { ...this.data, item: oggettoMerge },
		});
	}

	compareObjects(o1: any, o2: any) {
		if (o1.Profile == o2.Profile && o1.RateId == o2.RateId) return true;

		return false;
	}

	visualizzazioneOpzioni(tariffa: any) {
		if (tariffa?.StartDate) {
			return (
				tariffa.Profile +
				' (' +
				new Date(tariffa.StartDate).toLocaleDateString('it-IT') +
				' - ' +
				new Date(tariffa.EndDate).toLocaleDateString('it-IT') +
				' )'
			);
		}

		return tariffa.Profile;
	}

	importoManuale(event: any) {
		const valore = event.target.value.replaceAll('.', '').replaceAll(',', '.');
		const errore = checkInputNumber(event);

		if (!errore) {
			this.erorreImportoManuale = false;
			this.tariffa.Rate = valore;
		} else {
			this.erorreImportoManuale = true;
		}
	}
}
