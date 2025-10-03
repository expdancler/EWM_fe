import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { WbsManagerComponent } from './components/wbs-manager/wbs-manager.component';
import { AcrComponent } from './components/acr/acr.component';
import { ForecastConsuntiviComponent } from './components/forecast-consuntivi/forecast-consuntivi.component';
import { ComunicazioniComponent } from './components/comunicazioni/comunicazioni.component';
import { WbsManagerRoutingModule } from './wbs-manager-routing.module';
import { CommonModule, DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppComponent } from 'src/app/app.component';
import { InterceptorService } from 'src/app/services/interceptor.service';
import { NumberMonthPipe } from 'src/app/customPipe/number-month.pipe';
import { CutMonthPipe } from 'src/app/customPipe/cut-month.pipe';
import { DecimalPipe } from 'src/app/customPipe/decimal.pipe';
import { CostiForecastComponent } from './components/costi-forecast/costi-forecast.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SliceTextPipe } from '../../customPipe/slice-text.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { TariffeContrattualiComponent } from './components/tariffe-contrattuali/tariffe-contrattuali.component';
import { TabellaDettaglioComponent } from './components/forecast-consuntivi/tabella-dettaglio/tabella-dettaglio/tabella-dettaglio.component';
import { DialogTabellaDettaglioComponent } from './components/forecast-consuntivi/dialog-tabella-dettaglio/dialog-tabella-dettaglio/dialog-tabella-dettaglio.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DettaglioTariffeConsuntivoComponent } from './components/forecast-consuntivi/dettaglio-tariffe-consuntivo/dettaglio-tariffe-consuntivo/dettaglio-tariffe-consuntivo.component';
import { DialogTariffeComponent } from './components/forecast-consuntivi/dialog-tariffe/dialog-tariffe/dialog-tariffe.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NominativiComponent } from './components/tariffe-contrattuali/nominativi/nominativi/nominativi.component';
import { MatInputCommifiedDirective } from './components/tariffe-contrattuali/direttive/mat-input-commified.directive';
import { ConfermaEliminazioneComponent } from './components/tariffe-contrattuali/dialog/conferma-eliminazione/conferma-eliminazione.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
	declarations: [
		WbsManagerComponent,
		AcrComponent,
		ForecastConsuntiviComponent,
		ComunicazioniComponent,
		NumberMonthPipe,
		CutMonthPipe,
		DecimalPipe,
		CostiForecastComponent,
		SliceTextPipe,
		TariffeContrattualiComponent,
		TabellaDettaglioComponent,
		DialogTabellaDettaglioComponent,
		DettaglioTariffeConsuntivoComponent,
		DialogTariffeComponent,
		NominativiComponent,
		MatInputCommifiedDirective,
		ConfermaEliminazioneComponent,
	],
	imports: [
		WbsManagerRoutingModule,
		CommonModule,
		NgSelectModule,
		ReactiveFormsModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatGridListModule,
		MatSlideToggleModule,
		MatTooltipModule,
		MatIconModule,
		MatDialogModule,
		MatButtonModule,
		MatSelectModule,
		MatDatepickerModule,
		MatAutocompleteModule,
		MatSnackBarModule,
	],
	exports: [RouterModule, AcrComponent, SliceTextPipe],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }, DatePipe
	],
	bootstrap: [AppComponent],
})
export class WbsManagerModule {}
