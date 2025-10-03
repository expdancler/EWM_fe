import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface Utente {
	name: string;
}

@Component({
	selector: 'app-nominativi',
	templateUrl: './nominativi.component.html',
	styleUrls: ['./nominativi.component.scss'],
})
export class NominativiComponent implements OnInit {
	@Input() nominativi: any;

	filtroOpzioni: Observable<Utente[]> | undefined;
	controlNominativo = new FormControl();

	constructor() {}

	ngOnInit(): void {

    this.nominativi.subscribe(() => {
      this.filtroOpzioni = this.controlNominativo.valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value.name)),
        map(name => (name ? this._filtro(name) : this.nominativi.slice()))
      );
    })

	}

	displayFn(utente: Utente): string {
		return utente && utente.name ? utente.name : '';
	}

	private _filtro(name: string): Utente[] {
		const filtroValore = name.toLocaleLowerCase();

		return this.nominativi.filter((option: { name: string }) => option.name.toLocaleLowerCase().includes(filtroValore));
	}
}
