import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormArray, FormBuilder, FormControl, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalComponent} from 'src/app/components/modal/modal.component';
import {NotificationTostrService} from 'src/app/services/notification-toastr.service';
import {WbsManagerService} from '../../services/wbs-manager.service';
import * as $ from 'jquery';
import {WbsManagerComponent} from '../wbs-manager/wbs-manager.component';
import {ExcelService} from '../../../reports/services/excel.service';
import {MatDialog} from '@angular/material/dialog';
import {
	DialogTabellaDettaglioComponent
} from './dialog-tabella-dettaglio/dialog-tabella-dettaglio/dialog-tabella-dettaglio.component';
import {TBalEmpl} from '../model/TBalEmpl.model';
import {DialogTariffeComponent} from './dialog-tariffe/dialog-tariffe/dialog-tariffe.component';
import {TCeEmpl} from '../model/TCeEmpl.model';
import {formattaData} from "../tariffe-contrattuali/utils/helpers";
import {checkInputNumber} from "../tariffe-contrattuali/utils/validationNumber";
import {StorageService} from '../../../../utils/secureStorage';

@Component({
    selector: 'app-forecast-consuntivi',
    templateUrl: './forecast-consuntivi.component.html',
    styleUrls: ['./forecast-consuntivi.component.scss'],
})
export class ForecastConsuntiviComponent implements OnInit, OnChanges {
    @Input() dataWBsDetail: any = [{}];
    @Output() dataWBsDetailUpdated = new EventEmitter<any>();
    @Input() wbs: any;
    @Input() role: any;
    @Input() revType: any;
    @Input() action: any;
    @Input() EtPrcstList: any = [{}];
    @Input() EtSupplList: any = [{}];
    @Input() WbsCe: any = [{}];
    CostoPersonale: any = [];
    isObject: Object = {};
    CostoConsulenza: any = [];
    CostoGenerico: any = [];
    TBalInv: any = [];
    TBalEmpl: any = [];
    totalDipQuantity: any;
    TBalCons: any = [];
    TCostElement: any = [];
    VociDiCosto: any = [];
    TBalCe: any = [];
    TCeEmpl: any = [];
    CostoCunsulenza: any = [];
    EtCeList: any = [];
    disbaledInvia: boolean = true;
    // variabile che mi estrae l'anno della mia ultima information card
    // serve per far apparire l'estendi periodo nel mio ultimo anno di forecast
    date_est_per: any;
    change_forecast: any;
    //servono per prendere l'ultimo mese dell'anno di consuntivo
    lastConsMonth: any;
    lastConsYear: any;

    cons_sel_anno: any;
    cons_sel_mese: any;

    information_forecast_costo: any;
    information_forecast_ricavo: any;
    information_forecast_marginalita: any;

    appare_tab_consuntivo: boolean = false;
    appare_tab_forecast: boolean = false;

    itemsCostoPer: boolean = false;

    costoPerForm = this.formBuilder.group({
        itemsCostoPer: this.formBuilder.array([]),
    });

    consulenzaTecnicaForm = this.formBuilder.group({
        itemsConsulenzaTecnica: this.formBuilder.array([]),
    });

    vociDiCostoForm = this.formBuilder.group({
        itemsVociDiCosto: this.formBuilder.array([]),
    });
    // array dove inserisco la data del end date del forecast
    maxDate_Wbs: any = [];

    // PROVA
    tabEsForecast: any = {TCeEmpl: [], TCeCons: [], TCostElement: []};
    // ARRAY PROFILO DI COSTO TABELLA COSTO DEL PERSONALE
    prfl_cst: any = [];
    // ARRAY FORNITORE TABELLA CONSULENZA TECNICA
    frn: any = [];
    // ARRAY DETTAGLIO TABELLA VOCI DI COSTO
    dt: any = [];
    arrShowCard: any = {};
    disabilitedYear: any = false;

    fcstCosti: any;
    fcstRicavi: any;
    fcstMargine: any;
    costifinire: any;

    // DETTAGLIO
    TBalEmplName: any = [];
    TBalEmplDett: any = [];
    TBalConsDett: any = [];
    TBalCeDett: any = [];
    TCeEmplDett: any = [];
    TCeConsDett: any = [];
    TCostElementDett: any = [];

    // APPARE TAB EXCEL
    appareExcel = true;

    descrWbs: any;
    wbsList: any;

    modificaConsuntivoObj: any = {
        mostraModificaConsuntivo: false,
        readOnly: false,
        ricavi: '',
        revFc: '',
        ricaviError: false,
        riaviPeriodoError: false,
        checkedRicavi: false,
        ricaviChanged: [], // Sono tutti i ricavi modificati, mi serve per il CHANGE CALL API
    };
    tariffaContrattualeSelezionata: any;

    visualizzaTabellaTM: boolean = false;
    slideToggleImporto: boolean = false;

    mostraVdcModificabile: boolean = false;
    erroreIndice: any = {
        indexError: [],
        indiceVdc: []
    }

    // indexError = [-2];

    constructor(
        private formBuilder: FormBuilder,
        private wbsManagerService: WbsManagerService,
        private notificationToastrService: NotificationTostrService,
        private modalService: NgbModal,
        private wbsManager: WbsManagerComponent,
        private excelService: ExcelService,
        public dialog: MatDialog,
        private storageService: StorageService
    ) {
    }

    formControl = new FormControl('', [Validators.required]);

    ngOnChanges(changes: SimpleChanges) {
        // VALORIZZAZIONE NG-SELECT TABELLE FORECAST
        this.dt_fnt();
        this.forn_fnct();
        this.prfl_cst_fn();
    }

    ngOnInit(): void {
        // DESCRIZIONE WBS
        this.descrWbs = this.dataWBsDetail.data.EsHeader.DescrWbs;
        //jquery
        $(document).ready(function () {
            $('#card').hide();
        });
        $(document).ready(function () {
            $('#cardForecast').hide();
        });
        // resetta lo scroll della pagina
        window.scrollTo(0, 0);
        let change_forecast = this.storageService.secureStorage.getItem('change_forecast');
        if (change_forecast != 'true') {
            console.log('dataWBsDetail', this.dataWBsDetail);
            if (this.dataWBsDetail.data.EsForecast.TCeEmpl !== []) {
                this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((element: any) => {
                    element.attribute = 'apiItem';
                });
            }

            this.CostoPersonale = this.dataWBsDetail.data.EsForecast.TCeEmpl;
            if (this.dataWBsDetail.data.EsForecast.TCeCons !== []) {
                this.dataWBsDetail.data.EsForecast.TCeCons.forEach((element: any) => {
                    element.attribute = 'apiItem';
                });
            }
            this.CostoConsulenza = this.dataWBsDetail.data.EsForecast.TCeCons;

            this.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement;
            if (this.TCostElement !== []) {
                this.TCostElement = this.TCostElement.filter(function (item: any) {
                    return item.CeDetType === 'G';
                });
                this.TCostElement.forEach((element: any) => {
                    element.attribute = 'apiItem';
                });
            }
        }
        this.CostoGenerico = this.TCostElement;

        // Dettaglio TBalInv
        this.getTBalInvDetail();
        // Costo personale
        this.getCostoPersonaleDetail();
        // Consulenza
        this.getConsulenzaDetail();
        // Voci di costo
        this.getVociDiCostoDetail();
        // Dettagli forecast
        this.getForecastDetail();
        this.getCardsConsuntiviForecast();
        this.initializationOptionSelectAnno();
        this.initializationValueCards();
        // this.initializationCurrentMonth();
        // this.setAllStyleCards();
        this.initializationFirstYear();

        //Sezione forecast e consuntivi
        this.section_consuntivi_forecast();
        let trovato: boolean = false;
        this.informationsCards.forEach((element: any, index: any) => {
            let currentYear = new Date().getFullYear().toString();
            if (element.Fyear === currentYear) {
                this.select_year = element.Fyear;
                this.getValuesConsutiviSection(this.select_year);
                trovato = true;
                this.select_year_function(element.Fyear);
            }
            if (index === this.informationsCards.length - 1) {
                if (!trovato) {
                    this.select_year = element.Fyear;
                    this.getValuesConsutiviSection(this.select_year);
                    this.select_year_function(element.Fyear);
                }
            }
        });
        this.fnt_maxDate_Wbs();
        // BOLLINO ACCANTO AL MESE DELLA CARD
        this.profitability_circle();
        // FUNZIONE CHE COPIA LE NUOVE INFORMATIONCARDS QUAND IL change_forecast == 0
        this.informationCards_session();
        // Action EsForecast
        this.action = 'DISPLAY';
        this.dataWBsDetail.data.EsForecast.TAction.forEach((element: any) => {
            if (element.Action == 'CHANGE') {
                this.action = 'CHANGE';
            }
        });
        // FUNZIONE CHE MI ATTACCA ATTRIBUTI AGLI ARRAY FORECAST
        this.AttributeErrorTable();

        this.isObject = {
            Header: 'X',
            Acr: 'X',
            Balance: 'X',
            Forecast: 'X',
            FcVersn: null,
            Communications: 'X',
            ProfCtr: 'X',
            Versions: 'X',
        };

        // this.getWBSList();
        this.setAllStyleCards();
    }

    checkIfIsPositiveNumber(value: any, zeroIncluded = false): boolean {
        let ok = true;

        if (!value) ok = false;
        else if (isNaN(Number(value))) ok = false;
        else if ((zeroIncluded && Number(value) < 0) || (!zeroIncluded && Number(value) <= 0)) ok = false;

        return ok;
    }

    checkIfIsNumberNotZero(value: any): boolean {
        let ok = true;

        if (!value) ok = false;
        else if (isNaN(Number(value))) ok = false;
        else if (Number(value) == 0) ok = false;

        return ok;
    }

    abilitazioneImportoManuale({checked}: any, TBalCe: any) {
        if (checked) TBalCe.ManInd = 'X';
        else TBalCe.ManInd = '';
    }

    openDialogDetail() {
        this.dialog.open(DialogTabellaDettaglioComponent, {
            data: this.dataWBsDetail.data.EsBalance.TBalEmplDet?.filter(
                (empl: TBalEmpl) => empl.Fyear === this.information_card_anno && empl.Fmonth === this.information_card_mese
            ),
        });
    }

    dataInclusa(data: any, {StartDate, EndDate}: any) {
        const dataInzialeT = new Date(StartDate).getTime();
        const dataFinaleT = new Date(EndDate).getTime();
        const dataT = new Date(data).getTime();

        if (dataT >= dataInzialeT && dataT <= dataFinaleT) return true;

        return false;
    }

    openDialogTariffe(item: any, index: number, section: string) {

        const data = [item.Fyear, item.Fmonth, '01'].join('-');

        const TProf = this.dataWBsDetail.data.EsProfCtr.TProf;
        const TRate = this.dataWBsDetail.data.EsProfCtr.TRate.filter((item: any) => this.dataInclusa(data, item)
        );

        const listaProfili = [{Profile: '', ProfileId: '99', Rate: '', RateId: '00'}];

        // Ho bisgono di fare match con TProf per ottenere il nome del profilo
        listaProfili.push(...TRate.map((item: { ProfileId: string; }) => ({
            ...item, Profile: TProf.find(({ProfileId}: string | any) => item.ProfileId === ProfileId).Profile
        })));

        listaProfili.push({Profile: 'ALTRO', ProfileId: '00', Rate: '', RateId: '00'});

        const dialogRef = this.dialog.open(DialogTariffeComponent, {
            width: '50vw',
            maxWidth: '50vw',
            data: {profiliContrattuali: listaProfili, item: item},
        });

        dialogRef.afterClosed().subscribe(result => {
            this.dataWBsDetail.data.EsForecast[section][index] = {
                ...this.dataWBsDetail.data.EsForecast[section][index],
                ...result?.data?.item,
            };
        });
    }

    modificaVdcManualmente(event: any, TBalCe: any, index: number) {

        const value = event.target.value.replaceAll('.', '').replaceAll(',', '.');
        const errore = checkInputNumber(event);
        const indice = this.erroreIndice.indiceVdc.indexOf();

        if (!errore) {
            this.erroreIndice.indiceVdc.splice(indice, 1);
            TBalCe.ValueMan = value;
        } else {
            if (indice === -1) this.erroreIndice.indiceVdc.push(index);
        }


        // TBalCe.ValueMan = this.unFormatValue(event.target.value);
    }

    vistaTooltipTariffa(item: TCeEmpl) {
        const profile = item.Profile ?? '';
        const rate = item.Rate ?? '';
        return profile + '-' + rate;
    }

    visualizzaModifica(TPerio: any) {
        if (TPerio.ChangeInd === 'X' && this.action === 'CHANGE' && (TPerio.RevFc === 'X' || TPerio.RevFc === 'Y')) {
            // if ((this.role === 'PM' && this.revType === 'TM') || (this.revType === 'CA' && this.role === 'RAC') || this.revType === 'CR') {
            // 	return true;
            // }
            if (
                ((this.revType === 'TM' || this.revType === 'CR') && (this.role === 'PM' || this.role === 'RAC')) ||
                (this.revType === 'CA' && this.role === 'RAC')) {
                return true;
            }
        }

        return false;
    }

    isForecastEditable() {
        let editable = false;

        // if ((this.revType === 'TM' || this.revType === 'CR') && this.role === 'PM')
        if (this.action == 'CHANGE' && this.role !== 'RAC')
            editable = true;

        return editable;
    }

    isCopyMonthAvailable(year: any, period: any) {
        let available = false;
        // action === 'CHANGE' sta già in isForecastEditable
        available = this.isForecastEditable() && (this.revType !== 'CA' || (this.revType == 'CA' && !this.isLastCard(year, period)));

        return available;
    }

    isLastCard(year: any, period: any) {
        let cardCurrYear = this.informationsCards.filter((years: any) => years.Fyear == year);

        if (cardCurrYear.length < 0)
            return false;

        let lastMonth = Math.max(...cardCurrYear[0].TPerio.map((card: any) => card.Fmonth));

        return (period.Fyear == year && period.Fmonth == lastMonth)
    }

    aggiungiVdc() {
        const oggettoDataVdc = {
            AutoInd: '',
            CeDetType: '',
            CeInd: '',
            ChangeInd: 'X',
            CostElement: '',
            DescrCe: '',
            Description: '',
            Fmonth: this.information_card_mese,
            Fyear: this.information_card_anno,
            IdRow: '',
            ManInd: 'X',
            Value: '',
            ValueMan: '',
        }

        // // Aggiorno l'oggetto principale in modo da disporre i dati per il savataggio.
        // this.dataWBsDetail.data.EsBalance.TBalCe.push(oggettoVdc);

        // Aggiorno per la visualizzazione html
        this.TBalCe.push({data: [oggettoDataVdc]})
        // this.TBalCe.data.push(oggettoVdc);
    }

    selezioneDettaglioVdc(event: any, index: any) {

        if (event) {
            const oggettoEvento = {
                CeInd: event.CeInd,
                CeDetType: event.CeDetType,
                CostElement: event.CostElement,
                DescrCe: event.DescrCe,
            };

            // Aggiorno l'oggetto originale per effettuare il salvataggio.
            this.TBalCe[index].data[0] = {...this.TBalCe[index].data[0], ...oggettoEvento};

        }
    }

    inputVdc(event: any, TBalCe: any, index: number) {
        const value = event.target.value.replaceAll('.', '').replaceAll(',', '.');
        const errore = checkInputNumber(event);
        const indice = this.erroreIndice.indexError.indexOf(index);

        if (!errore) {
            this.erroreIndice.indexError.splice(indice, 1);
            // this.TBalCe[index].data[0].ValueMan = value;
            TBalCe.ValueMan = value;
        } else {
            if (indice === -1) this.erroreIndice.indexError.push(index);
        }
    }

    visualizzaTM() {
        let visualizza = false;
        // if (this.revType === 'TM' && this.action === 'CHANGE' && this.visualizzaTabellaTM) return true
        if (
            (this.revType === 'TM' || this.revType === 'CR') &&
            (this.role === 'PM' || this.role === 'RAC') &&
            this.action === 'CHANGE' && this.visualizzaTabellaTM
        )
            visualizza = true;

        return visualizza;
    }

    trovaIndiceErrore(index: number, indiceTipo: string) {
        // Sto prendendo l'indice di ciò che ho aggiunto nell'oggetto errore
        const indiceErrore = this.erroreIndice[indiceTipo].indexOf(index);

        if (indiceErrore !== -1) return true;

        return false;
    }

    // trovaIndiceErrore(index: number) {
    // 	const indiceErrore = this.indexError.indexOf(index);

    // 	if (indiceErrore !== -1) return true;

    // 	return false;
    // }

    eliminaVdcAggiunta(index: number) {
        this.TBalCe.splice(index, 1);
    }

    initTariffeConsuntivo() {
        return this.dataWBsDetail.data.EsBalance.TBalProf.filter(
            ({Fmonth, Fyear}: any) => Fmonth === this.information_card_mese && Fyear === this.information_card_anno
        );
    }

    // FUNZIONE CHE COPIA LE NUOVE INFORMATIONCARDS QUAND IL change_forecast == 0
    informationCards_session() {
        let change_forecast = this.storageService.secureStorage.getItem('change_forecast');
        if (change_forecast == 'true') {
            this.informationsCards = JSON.parse(this.storageService.secureStorage.getItem('informationCards'));
            console.log(this.informationsCards);
        }
    }

    AttributeErrorTable() {
        this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((item: any) => {
            item.errorValue = false;
            item.errorDailyCost = false;
            item.errorQuantity = false;
        });
        this.dataWBsDetail.data.EsForecast.TCeCons.forEach((item: any) => {
            item.errorValue = false;
            item.errorDailyCost = false;
            item.errorQuantity = false;
        });
        this.dataWBsDetail.data.EsForecast.TCostElement.forEach((item: any) => {
            item.errorValue = false;
        });
    }

    // BOLLINO ACCANTO AL MESE DELLA CARD
    profitability_circle() {
        this.informationsCards.forEach((element: any) => {
            element.TPerio.forEach((item: any) => {
                if (parseFloat(item.Profitability) >= parseFloat(this.dataWBsDetail.data.EsAcr.Profitability)) {
                    item.Circle = 'green';
                } else if (parseFloat(item.Profitability) < parseFloat(this.dataWBsDetail.data.EsAcr.Profitability)) {
                    item.Circle = 'red';
                }
            });
        });
    }

    // prendo la data del end date del forecast
    fnt_maxDate_Wbs() {
        const date = this.dataWBsDetail.data.EsForecast.EndDate.split('-');
        this.maxDate_Wbs = {anno: date[0], mese: date[1], giorno: date[2]};
    }

    monthDiff(d1: any, d2: any) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    public firtFyearTPerio: any;
    public firtFmonthTPerio: any;
    public lastFyearTPerio: any;
    public lastFmonthTPerio: any;
    public informationsCards: any = [];
    public informationsCardsCosts: any = [];
    public informationsCardsFeature: any = [];
    public informationsConsuntiviCards: any = [];

    getCardsConsuntiviForecast() {
        let StartDateEsForecast: any;
        let EndDateEsForecast: any;

        let StartDateEsAcr: any;
        let EndDateEsAcr: any;

        let startDateInformation: any;
        let endDateInformation: any;

        StartDateEsForecast = this.dataWBsDetail.data.EsForecast.StartDate;
        EndDateEsForecast = this.dataWBsDetail.data.EsForecast.EndDate;

        StartDateEsAcr = this.dataWBsDetail.data.EsAcr.StartDate;
        EndDateEsAcr = this.dataWBsDetail.data.EsAcr.EndDate;

        StartDateEsAcr = StartDateEsAcr.split('/');
        if (StartDateEsAcr[0].length === 1) {
            StartDateEsAcr[0] = '0' + StartDateEsAcr[0];
        }
        StartDateEsAcr = StartDateEsAcr[2] + '-' + StartDateEsAcr[0] + '-' + StartDateEsAcr[1];

        EndDateEsAcr = EndDateEsAcr.split('/');
        if (EndDateEsAcr[0].length === 1) {
            EndDateEsAcr[0] = '0' + EndDateEsAcr[0];
        }
        EndDateEsAcr = EndDateEsAcr[2] + '-' + EndDateEsAcr[0] + '-' + EndDateEsAcr[1];

        if (StartDateEsForecast !== '0000-00-00' && EndDateEsForecast !== '0000-00-00') {
            startDateInformation = this.dataWBsDetail.data.EsForecast.StartDate.split('-');
            endDateInformation = this.dataWBsDetail.data.EsForecast.EndDate.split('-');
            this.information_card_anno = endDateInformation[0];
            this.information_card_mese = endDateInformation[1]; // o forse solo "01"
        } else {
            startDateInformation = StartDateEsAcr.split('-');
            endDateInformation = EndDateEsAcr.split('-');
            this.information_card_anno = startDateInformation[0];
            this.information_card_mese = startDateInformation[1];
        }

        let differenceOfMonthes = this.monthDiff(
            new Date(startDateInformation[0], startDateInformation[1]),
            new Date(endDateInformation[0], endDateInformation[1])
        );
        differenceOfMonthes = differenceOfMonthes + 1;
        if (differenceOfMonthes > 0) {
            let addElements = -1;
            for (let step = 0; step < differenceOfMonthes; step++) {
                addElements = addElements + 1;
                if (parseInt(startDateInformation[1]) + addElements > 12) {
                    startDateInformation[0] = parseInt(startDateInformation[0]) + 1;
                    startDateInformation[1] = '01';
                    addElements = 0;
                }
                this.informationsCards.push({
                    Fyear: startDateInformation[0],
                    Fmonth: parseInt(startDateInformation[1]) + addElements,
                    Costs: '0',
                    Revenues: '0',
                    PerioFrom: '',
                    ChangeInd: '',
                    RevManInd: '',
                    PerioTo: '',
                    Profitability: '0',
                    Billing: '0',
                    NetWip: '0',
                });
            }
            if (this.informationsCards.length !== 0) {
                this.informationsCards.forEach((element: any) => {
                    if (typeof element.Fyear === 'number') {
                        element.Fyear = element.Fyear.toString();
                    }
                    if (element.Fmonth.toString().length === 1) {
                        element.Fmonth = '0' + element.Fmonth;
                    }
                    if (element.Fmonth.toString().length === 2) {
                        element.Fmonth = element.Fmonth.toString();
                    }
                });
            }
            this.informationsCards = this.informationsCards.reduce((itemSearch: any, item: any) => {
                const found = itemSearch.find((findItem: any) => findItem.Fyear === item.Fyear);
                if (!found) {
                    itemSearch.push({Fyear: item.Fyear, TPerio: [item]});
                } else {
                    found.TPerio.push(item);
                }
                return itemSearch;
            }, []);
        }
        if (this.informationsCardsFeature.length !== 0) {
            this.informationsCards.forEach((element: any) => {
                this.informationsCardsFeature.forEach((item: any, index: any) => {
                    if (element.Fyear === item.Fyear) {
                        item.TPerio.forEach((itemTPerio: any) => {
                            element.TPerio.push(itemTPerio);
                        });
                        this.informationsCardsFeature.splice(index, 1);
                    }
                });
            });
            this.informationsCards = this.informationsCards.concat(this.informationsCardsFeature);
        }
        if (this.informationsCardsCosts.length > 0) {
            this.informationsCards = this.informationsCardsCosts;
        }
        console.log('informationsCards', this.informationsCards);
        //  console.log('informationsCardsCosts', this.informationsCardsCosts)
        // visibilità bottone estendi periodo
        this.appare_estendi_periodo();
    }

    initializationMissingCards() {
        let firstElement: any;
        let lastElement: any;
        this.informationsCards.forEach((element: any) => {
            firstElement = element.TPerio[0];
            lastElement = element.TPerio[element.TPerio.length - 1];
            if (parseInt(lastElement.Fmonth) - parseInt(firstElement.Fmonth) !== 1) {
                element.TPerio.forEach((item: any, indexTPerio: any) => {
                    let monthDiff: any = 0;
                    monthDiff = parseInt(element.TPerio[indexTPerio + 1].Fmonth) - parseInt(element.TPerio[indexTPerio].Fmonth);
                    let addMonth = 0;
                    if (monthDiff > 1) {
                        monthDiff = monthDiff - 1;
                        addMonth = parseInt(item.Fmonth);
                        for (let step = 0; step < monthDiff; step++) {
                            addMonth = addMonth + 1;
                            element.TPerio.push({
                                Fyear: item.Fyear,
                                Fmonth: addMonth,
                                Costs: '0',
                                Revenues: '0',
                                PerioFrom: '',
                                ChangeInd: '',
                                RevManInd: '',
                                PerioTo: '',
                                Profitability: '0',
                                Billing: '0',
                                NetWip: '0',
                            });
                        }
                    }
                });
            }
        });
        this.informationsCards.forEach((element: any) => {
            element.TPerio.sort(function (a: any, b: any) {
                return parseInt(a.Fmonth) - parseInt(b.Fmonth);
            });
        });
        this.informationsCards.forEach((element: any) => {
            element.TPerio.forEach((item: any) => {
                if (typeof item.Fmonth === 'number') {
                    item.Fmonth = item.Fmonth.toString();
                }
            });
        });
        //  console.log(this.informationsCards)
    }

    initializationValueCards() {
        let today = new Date();
        let TCeTot: any = [];
        let dateCurrentYear = today.getFullYear();
        let dateCurrentMonth = today.getMonth() + 1;
        this.dataWBsDetail.data.EsForecast.TCeTot.forEach((element: any) => {
            if (parseInt(this.dataWBsDetail.data.EsForecast.Fyear) === parseInt(element.Fyear)) {
                element.TPerio.forEach((item: any) => {
                    if (parseInt(this.dataWBsDetail.data.EsForecast.Fmonth) <= item.Fmonth) {
                        TCeTot.push(item);
                    }
                });
            }
            if (parseInt(this.dataWBsDetail.data.EsForecast.Fyear) < parseInt(element.Fyear)) {
                element.TPerio.forEach((item: any) => {
                    TCeTot.push(item);
                });
            }
        });
        this.informationsCards.forEach((element: any) => {
            element.TPerio.forEach((item: any) => {
                TCeTot.forEach((itemTCeTot: any) => {
                    if (item.Fyear === itemTCeTot.Fyear && item.Fmonth === itemTCeTot.Fmonth) {
                        item.Costs = itemTCeTot.Costs;
                        item.Revenues = itemTCeTot.Revenues;
                        item.PerioFrom = itemTCeTot.PerioFrom;
                        item.ChangeInd = itemTCeTot.ChangeInd;
                        item.RevManInd = itemTCeTot.RevManInd;
                        item.PerioTo = itemTCeTot.PerioTo;
                        item.Profitability = itemTCeTot.Profitability;
                        item.Billing = itemTCeTot.Billing;
                        item.NetWip = itemTCeTot.NetWip;
                        //item.RevFc = itemTCeTot.RevFc;
                    }
                });
            });
        });
        this.getTotalValues(this.informationsCards);
        // console.log(this.informationsCards)
    }

    initializationCurrentMonth() {
        let today = new Date();
        let dateCurrentYear = today.getFullYear();
        let dateCurrentMonth = today.getMonth() + 1;
        this.informationsCards.forEach((element: any) => {
            if (parseInt(element.Fyear) < parseInt(this.dataWBsDetail.data.EsForecast.Fyear)) {
                element.TPerio.forEach((item: any) => {
                    if (item.RevFc !== undefined && item.RevFc !== '' && item.RevFc === 'X') {
                        item.type = 'RevFc';
                    } else {
                        item.type = 'consuntivo';
                    }
                });
            }
            if (parseInt(element.Fyear) === parseInt(this.dataWBsDetail.data.EsForecast.Fyear)) {
                element.TPerio.forEach((item: any) => {
                    if (parseInt(item.Fmonth) < parseInt(this.dataWBsDetail.data.EsForecast.Fmonth)) {
                        if (item.RevFc !== undefined && item.RevFc !== '' && item.RevFc === 'X') {
                            item.type = 'RevFc';
                        } else {
                            item.type = 'consuntivo';
                        }
                    }
                    if (parseInt(item.Fmonth) >= parseInt(this.dataWBsDetail.data.EsForecast.Fmonth)) {
                        if (item.Costs !== '0') {
                            item.type = 'blueCard';
                        } else {
                            item.type = 'dash';
                        }
                    }
                });
            }
            if (parseInt(element.Fyear) > parseInt(this.dataWBsDetail.data.EsForecast.Fyear)) {
                element.TPerio.forEach((item: any) => {
                    if (item.Costs !== '0') {
                        item.type = 'blueCard';
                    } else {
                        item.type = 'dash';
                    }
                });
            }
        });
        this.informationsCards.forEach((element: any) => {
            element.TPerio.sort(function (a: any, b: any) {
                return parseInt(a.Fmonth) - parseInt(b.Fmonth);
            });
        });
    }

    public optionSelectAnno: any = [];

    initializationOptionSelectAnno() {
        this.informationsCards.forEach((element: any) => {
            this.optionSelectAnno.push(element.Fyear);
        });
    }

    initializationFirstYear() {
        this.informationsCards.forEach((element: any, index: any) => {
            if (index === 0) {
                element.TPerio.forEach((item: any) => {
                    this.TPerio.push(item);
                });
            }
        });
    }

    // Abilita la visualizzazione della sezione della modifica del consuntivo
    visualizzaConsuntivo(TPerio: any) {
        this.click_card(TPerio);

        const isXManInd = this.VociDiCosto.find(
            (item: { ManInd: string; data: Array<any> }) => item.data[0].ManInd === 'X'
        );

        if (isXManInd) {
            this.modificaConsuntivoObj.checkedRicavi = true;
        } else {
            this.modificaConsuntivoObj.checkedRicavi = false;
        }

        // this.modificaConsuntivoObj.mostraModificaConsuntivo = true;
        this.mostraVdcModificabile = true;
        this.visualizzaTabellaTM = true;
    }

    getWBSList() {
        let objectWbsList: any = {wbs: null};

        this.wbsManagerService.getWBSList(objectWbsList).subscribe(response => {
            this.wbsList = response.data.EtWbsList;
        });
    }

    public costiConsuntivati: any;
    public ricaviMaturati: any;
    public marginalitaTotale: any;
    public importFatturato: any;
    public wipNetto: any;

    getValuesConsutiviSection(selctedYear: any) {
        let today = new Date();
        let dateCurrentYear = today.getFullYear();
        let dateCurrentMonth = today.getMonth() + 1;
        let consuntiviValues: any = [];
        this.informationsCards.forEach((element: any) => {
            if (parseInt(element.Fyear) < dateCurrentYear) {
                element.TPerio.forEach((item: any) => {
                    consuntiviValues.push(item);
                });
            }
            if (parseInt(element.Fyear) === dateCurrentYear) {
                element.TPerio.forEach((item: any) => {
                    if (parseInt(item.Fmonth) < dateCurrentMonth) {
                        consuntiviValues.push(item);
                    }
                });
            }
        });
        consuntiviValues = consuntiviValues.reduce((itemSearch: any, item: any) => {
            const found = itemSearch.find((findItem: any) => findItem.Fyear === item.Fyear);
            if (!found) {
                itemSearch.push({Fyear: item.Fyear, TPerio: [item]});
            } else {
                found.TPerio.push(item);
            }
            return itemSearch;
        }, []);
        this.getTotalValues(consuntiviValues);
        let check_cstCon = false;
        let check_ricMat = false;
        let check_marg = false;
        let check_impFat = false;
        let check_fcstCosti = false;
        let check_fcstRicavi = false;
        let check_fcstMargine = false;
        let check_costiFinire = false;
        if (this.dataWBsDetail.data.EsBalance.TBalTot.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalTot.forEach((item: any) => {
                if (item.Fyear == this.year) {
                    check_cstCon = true;
                    this.costiConsuntivati = item.Costs;
                }
            });
            if (check_cstCon == false) {
                this.costiConsuntivati = 0;
            }
            this.dataWBsDetail.data.EsBalance.TBalTot.forEach((item: any) => {
                if (item.Fyear == this.year) {
                    check_ricMat = true;
                    this.ricaviMaturati = item.Revenues;
                }
            });
            if (check_ricMat == false) {
                this.ricaviMaturati = 0;
            }
            this.dataWBsDetail.data.EsBalance.TBalTot.forEach((item: any) => {
                if (item.Fyear == this.year) {
                    check_marg = true;
                    this.marginalitaTotale = item.Profitability;
                }
            });
            if (check_marg == false) {
                this.marginalitaTotale = 0;
            }
            this.dataWBsDetail.data.EsBalance.TBalTot.forEach((item: any) => {
                if (item.Fyear == this.year) {
                    check_marg = true;
                    this.marginalitaTotale = item.Profitability;
                }
            });
            if (check_marg == false) {
                this.marginalitaTotale = 0;
            }
            this.dataWBsDetail.data.EsBalance.TBalTot.forEach((item: any) => {
                if (item.Fyear == this.year) {
                    check_impFat = true;
                    this.importFatturato = item.Billing;
                }
            });
            if (check_impFat == false) {
                this.importFatturato = 0;
            }
        }

        /*let foundElements: boolean = false;
    for(let i = 0 ; i < this.dataWBsDetail.data.EsBalance.TBalTot.length;i++){
      if(this.dataWBsDetail.data.EsBalance.TBalTot[i].Fyear == this.year){
        this.costiConsuntivati = this.dataWBsDetail.data.EsBalance.TBalTot[i].Costs;
        this.ricaviMaturati = this.dataWBsDetail.data.EsBalance.TBalTot[i].Revenues;
        foundElements = true;
      }
    }
    /*this.dataWBsDetail.data.EsBalance.TBalTot.forEach((item: any) => {
      if (item.Fyear === selctedYear) {
        foundElements = true;
        this.costiConsuntivati = item.Costs;
        this.ricaviMaturati = item.Revenues;
      } else {
        this.costiConsuntivati = '0.00';
        this.ricaviMaturati = '0.00';
      }
    });*/
        /*consuntiviValues.forEach((element: any) => {
      if (element.Fyear === selctedYear) {
        foundElements = true;
        if (this.dataWBsDetail.data.EsBalance.TBalTot.length != 0) {
          let arrayProfittabily = this.dataWBsDetail.data.EsBalance.TBalTot.filter(function (item: any) {
            return item.Fyear === selctedYear;
          });
          if (arrayProfittabily.length != 0) {
            this.marginalitaTotale = arrayProfittabily[0].Profitability;
          } else {
            this.marginalitaTotale = '0,00';
          }
        } else {
          this.marginalitaTotale = '0,00';
        }
        this.importFatturato = element.Billing;
        this.wipNetto = element.NetWip;
      }
    });
    if (foundElements === false) {
      this.costiConsuntivati = 0;
      this.ricaviMaturati = 0;
      this.marginalitaTotale = 0;
      this.importFatturato = 0;
      this.wipNetto = 0;
    }*/
        this.dataWBsDetail.data.EsForecast.TCeTot.forEach((element: any) => {
            if (element.Fyear == this.year) {
                check_fcstCosti = true;
                this.fcstCosti = element.Costs;
            }
        });
        if (check_fcstCosti == false) {
            this.fcstCosti = 0;
        }
        this.dataWBsDetail.data.EsForecast.TCeTot.forEach((element: any) => {
            if (element.Fyear == this.year) {
                check_fcstMargine = true;
                this.fcstMargine = element.Profitability;
            }
        });
        if (check_fcstMargine == false) {
            this.fcstMargine = 0;
        }

        this.dataWBsDetail.data.EsForecast.TCeTot.forEach((element: any) => {
            if (element.Fyear == this.year) {
                check_fcstRicavi = true;
                this.fcstRicavi = element.Revenues;
            }
        });
        if (check_fcstRicavi == false) {
            this.fcstRicavi = 0;
        }
        this.dataWBsDetail.data.EsForecast.TCeTot.forEach((element: any) => {
            if (element.Fyear == this.year) {
                check_costiFinire = true;
                this.costifinire = element.EndCosts;
            }
        });
        if (check_costiFinire == false) {
            this.costifinire = 0;
        }
        let TBalTot: any[] = [];
        if (this.dataWBsDetail.data.EsBalance.TBalTot.length > 0) {
            this.dataWBsDetail.data.EsBalance.TBalTot.forEach((element: any) => {
                element.TPerio.forEach((item: any) => {
                    TBalTot.push(item);
                });
            });
        }
        this.informationsCards.forEach((element: any) => {
            element.TPerio.forEach((item: any) => {
                TBalTot.forEach((itemTBalTot: any) => {
                    if (item.Fyear === itemTBalTot.Fyear && item.Fmonth === itemTBalTot.Fmonth) {
                        item.Billing = itemTBalTot.Billing;
                        item.Costs = itemTBalTot.Costs;
                        item.NetWip = itemTBalTot.NetWip;
                        item.Profitability = itemTBalTot.Profitability;
                        item.RevFc = itemTBalTot.RevFc;
                        item.Revenues = itemTBalTot.Revenues;
                        item.PerioFrom = itemTBalTot.PerioFrom;
                        item.ChangeInd = itemTBalTot.ChangeInd;
                        item.PerioTo = itemTBalTot.PerioTo;
                        item.RevManInd = itemTBalTot.RevManInd;
                    }
                });
            });
        });
    }

    inizializationEstendiPeriodo() {
        let getElement = this.informationsCards[this.informationsCards.length - 1];
        getElement.TPerio.push({
            type: 'Estendi periodo',
        });
    }

    getTotalValues(passedArray: any) {
        passedArray.forEach((element: any) => {
            let Costs: any = [];
            let Revenues: any = [];
            let Profitability: any = [];
            let Billing: any = [];
            let NetWip: any = [];
            element.TPerio.forEach((item: any) => {
                Costs.push(item.Costs);
                Revenues.push(item.Revenues);
                Profitability.push(item.Profitability);
                Billing.push(item.Billing);
                NetWip.push(item.NetWip);
            });
            let totalCost = Costs.reduce((x: any, y: any) => parseFloat(x) + parseFloat(y));
            let totalRevenues = Revenues.reduce((x: any, y: any) => parseFloat(x) + parseFloat(y));
            let totalProfitability = Profitability.reduce((x: any, y: any) => parseFloat(x) + parseFloat(y));
            let totalBilling = Billing.reduce((x: any, y: any) => parseFloat(x) + parseFloat(y));
            let totalNetWip = NetWip.reduce((x: any, y: any) => parseFloat(x) + parseFloat(y));
            element.Costs = totalCost;
            element.Revenues = totalRevenues;
            element.Profitability = totalProfitability;
            element.Billing = totalBilling;
            element.NetWip = totalNetWip;
        });
    }

    public TPerio: any[] = [];

    // Variabile template costi consuntivati
    public costi_consuntivati: any;

    // FUNZIONE CHE IN BASE ANNO SELEZIONATO INSERISCE I COSTI CONSUNTIVATI
    public select_costiConsuntivati_function() {
        this.costi_consuntivati = this.select_year.toString();
    }

    getTBalInvDetail() {
        this.dataWBsDetail.data.EsBalance.TBalInv.forEach((element: any) => {
            const getDate = (string: any) => (([year, day, month]) => ({day, month, year}))(string.split('-'));
            const getYear = getDate(element.BillDate);
            element.year = +getYear.year;
        });
        let select_year = this.select_year;
        this.TBalInv = this.dataWBsDetail.data.EsBalance.TBalInv.filter(function (item: any) {
            return item.year.toString() === select_year;
        });
    }

    getCostoPersonaleDetail() {
        let information_card_anno = this.information_card_anno;
        let information_card_mese = this.information_card_mese;
        this.TBalEmpl = this.dataWBsDetail.data.EsBalance.TBalEmpl.filter(function (item: any) {
            return item.Fyear === information_card_anno && item.Fmonth === information_card_mese;
        });
        this.totalDipQuantity = this.TBalEmpl.reduce((sum: any, current: any) => parseFloat(sum) + parseFloat(current.Quantity), 0);
        // Lista dipendenti in Profili T&M
        let listEmpl = this.dataWBsDetail.data.EsProfCtr.TEmpl;
        // Lista profili esistenti
        let listProf = this.dataWBsDetail.data.EsProfCtr.TProf;
        // Aggiungo una proprietà per segnare se il dipendente
        // è già presente nella lista di dipendenti in Profili T&M
        this.TBalEmpl.forEach((empl: any) => {
            let filtered = listEmpl.filter((prof: any) => this.zeroFiller(prof.Persno, 8) === this.zeroFiller(empl.Persno, 8));
            let profile: any;
            if (filtered.length > 0) {
                empl.isPresent = true;
                profile = listProf.filter((prof: any) => prof.ProfileId === filtered[0].ProfileId);
                if (profile.length > 0) {
                    empl.Profile = profile[0].Profile;
                }
            }
        });
    }

    zeroFiller(value: any, lengthFinalString: any, toLeft: boolean = true): string {
        let result = "";
        let zero = "";
        let missing = lengthFinalString - value?.toString().length;
        while (zero.length < missing) zero += "0";
        if (toLeft)
            result = zero + value;
        else
            result = value + zero;

        return result;
    }

    getConsulenzaDetail() {
        let information_card_anno = this.information_card_anno;
        let information_card_mese = this.information_card_mese;
        this.TBalCons = this.dataWBsDetail.data.EsBalance.TBalCons.filter(function (item: any) {
            return item.Fyear === information_card_anno && item.Fmonth === information_card_mese;
        });
    }

    getVociDiCostoDetail() {
        this.VociDiCosto = this.dataWBsDetail.data.EsBalance.TBalCe.reduce((itemSearch: any, item: any) => {
            const found = itemSearch.find(
                (vociDiCosto: any) =>
                    vociDiCosto.Fyear === item.Fyear &&
                    vociDiCosto.Fmonth === item.Fmonth &&
                    vociDiCosto.CostElement === item.CostElement
            );
            if (!found) {
                itemSearch.push({
                    Fyear: item.Fyear,
                    Fmonth: item.Fmonth,
                    CostElement: item.CostElement,
                    DescrCe: item.DescrCe,
                    data: [item],
                });
            } else {
                found.data.push(item);
            }
            return itemSearch;
        }, []);
        this.VociDiCosto.forEach((element: any) => {
            let CostElement: any = [];
            element.data.forEach((item: any) => {
                CostElement.push(parseFloat(item.Value));
            });
            let totalCost = CostElement.reduce((x: any, y: any) => x + y);
            element.totalCost = totalCost;
        });
        let information_card_anno = this.information_card_anno;
        let information_card_mese = this.information_card_mese;
        this.VociDiCosto = this.VociDiCosto.filter(function (item: any) {
            return item.Fyear === information_card_anno && item.Fmonth === information_card_mese;
        });

        this.TBalCe = this.VociDiCosto;
        this.cons_sel_anno = information_card_anno;
        this.cons_sel_mese = information_card_mese;
    }

    // Variabili per apparizione delle tabelle di visualizzazione forecast sulla colonna laterale di destra
    public appare_tab_costoPersonale = true;
    public appare_tab_consulenza = true;
    public appare_tab_vociCosto = true;

    public appare_tab_costoPersonale_function() {
        this.appare_tab_costoPersonale = false;
    }

    public close_tab_costoPersonale_function() {
        this.appare_tab_costoPersonale = true;
    }

    public appare_tab_consulenza_function() {
        this.appare_tab_consulenza = false;
    }

    public close_tab_consulenza_function() {
        this.appare_tab_consulenza = true;
    }

    public appare_tab_vociCosto_function() {
        this.appare_tab_vociCosto = false;
    }

    public close_tab_vociCosto_function() {
        this.appare_tab_vociCosto = true;
    }

    // variabile template ricavi maturati
    public ricavi_maturati: any;

    // ARRAY OGGETTI ANNO SELECT COMPONENT
    public option_selectAnno: any[] = [];

    public select_year: any;
    // variabiile anno selezionato
    public year: any;

    public select_year_function(year: any) {
        console.log(year);
        this.year = year;
        this.TPerio = [];
        this.informationsCards.forEach((element: any) => {
            if (element.Fyear === year) {
                element.TPerio.forEach((item: any) => {
                    this.TPerio.push(item);
                });
            }
        });
        this.getTBalInvDetail();
        this.getCostoPersonaleDetail();
        this.getConsulenzaDetail();
        this.getVociDiCostoDetail();
        this.getDetailConsuntivo();
        this.getForecastDetail();
        this.section_consuntivi_forecast();
        this.getValuesConsutiviSection(year);
        this.dettaglioEsercizo();
    }

    //*****VISUALIZZAZIONE BOTTONE EXPORT DETTAGLIO FORECAST E CONSUNTIVO*****//
    buttonExportConsuntivo = false;
    buttonExportForecast = false;

    buttonExprot() {
        let check_TBalEmpl = false;
        let check_TBalCons = false;
        let check_TBalCe = false;
        let check_TCeEmpl = false;
        let check_TCeCons = false;
        let check_TCostElement = false;
        //*****************DISABILITA BOTTONE EXPORT CONSUNTIVI**************************//
        if (this.dataWBsDetail.data.EsBalance.TBalEmpl.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalEmpl.forEach((item: any) => {
                if (item.Fyear == this.select_year) {
                    check_TBalEmpl = true;
                }
            });
        }
        if (this.dataWBsDetail.data.EsBalance.TBalCons.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalCons.forEach((item: any) => {
                if (item.Fyear == this.select_year) {
                    check_TBalCons = true;
                }
            });
        }
        if (this.dataWBsDetail.data.EsBalance.TBalCe.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalCe.forEach((item: any) => {
                if (item.Fyear == this.select_year && item.CeDetType == 'G') {
                    check_TBalCe = true;
                }
            });
        }
        if (check_TBalEmpl == false && check_TBalCe == false && check_TBalCe == false) {
            this.buttonExportConsuntivo = false;
        } else {
            this.buttonExportConsuntivo = true;
        }
        //****************************DISABLITIA EXPORT FORECAST********************************//
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((item: any) => {
                if (item.Fyear == this.select_year) {
                    check_TCeEmpl = true;
                }
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCeCons.forEach((item: any) => {
                if (item.Fyear == this.select_year) {
                    check_TCeCons = true;
                }
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCostElement.forEach((item: any) => {
                if (item.Fyear == this.select_year && item.CeDetType == 'G') {
                    check_TCostElement = true;
                }
            });
        }
        if (check_TCeEmpl == false && check_TCeCons == false && check_TCostElement == false) {
            this.buttonExportForecast = false;
        } else {
            this.buttonExportForecast = true;
        }
    }

    mostraConsuntivo(TPerio: any) {
        // Se il pulsante è clicked (true)
        if (this.modificaConsuntivoObj.mostraModificaConsuntivo) {
            const conditionReV = TPerio.RevFc === 'X' || TPerio.RevFc === 'Y'; // da considerare ancora?

            if (this.role === 'PM' && conditionReV) {
                // il PM visualizza solamente
                this.modificaConsuntivoObj.readOnly = true;
                return true;
            } else if (conditionReV) {
                return true;
            }
        }

        return false; // Se nessuna delle condizioni precedenti viene soddisfatta
    }

    // Toltip dei ricavi prensente in 'VOCI DI COSTO'
    tooltipRicavi() {
        return this.modificaConsuntivoObj.checkedRicavi
            ? 'Abilta inserimento ricavi automatico'
            : 'Abilita inserimento ricavi manuale';
    }

    // FUNZIONE CHE PRENDE INFROMAZIONI DALLA CARD SELEZIONATA E INSERISCE LE INFROMAZIONI DELLA COLONNA DI SINISTRA
    public information_card_mese: any;
    public information_card_anno: any;
    public information_card_costo: any;
    public information_card_ricavo: any;
    public information_card_marginalita: any;
    public information_card_ricavo_atteso: any;
    public information_card_revFc: any;

    public click_card(TPerio: any) {
        this.information_card_mese = TPerio.Fmonth;
        this.information_card_anno = TPerio.Fyear;
        this.information_card_costo = TPerio.Costs;
        this.information_card_ricavo = TPerio.Revenues;
        this.information_card_marginalita = TPerio.Profitability;
        this.information_card_revFc = TPerio.RevFc;
        this.appare_addTabForecast = false;
        this.getCostoPersonaleDetail();
        this.getConsulenzaDetail();
        this.getVociDiCostoDetail();
        this.getForecastDetail();
        this.appare_tab_consuntivo = true;
        this.appare_tab_forecast = false;
        this.mostraVdcModificabile = TPerio.ChangeInd && this.mostraVdcModificabile ? true : false;
        // Sezione della modifica consuntivo
        // this.modificaConsuntivoObj.mostraModificaConsuntivo = this.mostraConsuntivo(TPerio);
        // this.modificaConsuntivoObj.mostraModificaConsuntivo = false; // A prescindere, se faccio click su card è false, solo button true
        this.modificaConsuntivoObj.ricavi = TPerio.Revenues;

        this.visualizzaTabellaTM = TPerio.ChangeInd && this.visualizzaTabellaTM ? true : false;

        // Mi serve per capire se visualizzare o meno la tabella T&M, a se stanno e meno i valori
        this.initTariffeConsuntivo();
    }

    searchIndexOfManInd(TBalCe: any) {
        const elmentToSearchIndex = (item: { IdRow: string }) => item.IdRow === TBalCe.data[0].IdRow;
        return this.dataWBsDetail.data.EsBalance.TBalCe.findIndex(elmentToSearchIndex);
    }

    getDetailConsuntivo() {
        let checkItem: boolean = false;
        if (this.dataWBsDetail.data.EsBalance.TBalTot !== []) {
            this.dataWBsDetail.data.EsBalance.TBalTot.forEach((element: any) => {
                if (element.Fyear === this.information_card_anno) {
                    element.TPerio.forEach((item: any) => {
                        if (item.Fmonth === this.information_card_mese) {
                            checkItem = true;
                            this.information_card_costo = parseInt(item.Costs);
                            this.information_card_ricavo = parseInt(item.Revenues);
                            this.information_card_marginalita = parseInt(item.Profitability);
                        }
                    });
                }
            });
            if (checkItem === false) {
                this.information_card_costo = 0;
                this.information_card_ricavo = 0;
                this.information_card_marginalita = 0;
            }
        }
    }

    getForecastDetail() {
        let checkItem: boolean = false;
        if (this.dataWBsDetail.data.EsForecast.TCeTot !== []) {
            this.dataWBsDetail.data.EsForecast.TCeTot.forEach((element: any) => {
                if (element.Fyear === this.information_card_anno) {
                    element.TPerio.forEach((item: any) => {
                        if (item.Fmonth === this.information_card_mese) {
                            checkItem = true;
                            this.information_forecast_costo = parseFloat(item.Costs);
                            this.information_forecast_ricavo = parseFloat(item.Revenues);
                            this.information_forecast_marginalita = parseFloat(item.Profitability);
                        }
                    });
                }
            });
            if (checkItem === false) {
                this.information_forecast_costo = 0;
                this.information_forecast_ricavo = 0;
                this.information_forecast_marginalita = 0;
            }
        }
    }

    section_consuntivi_forecast() {
        if (this.TPerio !== []) {
            this.TPerio.forEach((element: any, index: any) => {
                if (index === 0) {
                    if (element.type === 'consuntivo' || element.type === 'RevFc') {
                        this.click_card(element);
                    }
                    if (element.type === 'dash' || element.type === 'blueCard') {
                        let detailDate: any;
                        detailDate = {
                            Fyear: element.Fyear,
                            Fmonth: element.Fmonth,
                        };
                        this.click_forecast(detailDate, false);
                    }
                }
            });
        }
    }

    // APPARE COSTO PERSONALE INPUT
    public appare_costoPersonale_input = false;

    public information_costoPersonale_input() {
        this.appare_costoPersonale_input = false;
    }

    public close_information_costoPersonale_input() {
        this.appare_costoPersonale_input = true;
    }

    // VARIABILE PER LA VISUALIZZAZIONE DELLA COLONNA DI DESTRA
    public appare_addTabForecast = false;

    // COSTO DEL PERSONALE
    get itemsCostoPerArrayControl() {
        return (this.costoPerForm.get('itemsCostoPer') as FormArray).controls;
    }

    // addItemCostoPer() {
    // 	const itemsCostoPer = this.costoPerForm.controls.itemsCostoPer as FormArray;
    // 	itemsCostoPer.push(
    // 		this.formBuilder.group({
    // 			attribute: 'formItem',
    // 			Fyear: this.information_card_anno,
    // 			Fmonth: this.information_card_mese,
    // 			CostProfile: null,
    // 			DailyCost: null,
    // 			Quantity: null,
    // 			Value: null,
    // 			Rate: null,
    // 		})
    // 	);
    // 	console.log(this.tabEsForecast.TCeEmpl);
    // 	this.change_forecast_modal();
    // }

    // RIMOZIONE RIGHE TABELLE A DESTRA FORECAST
    removeItemCostoPer(index: number) {
        this.change_forecast_modal();
        this.itemsCostoPerArrayControl.splice(index, 1);
        const itemsCostoPer = this.costoPerForm.controls.itemsCostoPer as FormArray;
        itemsCostoPer.value.splice(index, 1);
    }

    /*
  CostProfile: "ES8"
DailyCost: "415.3"
Fmonth: "12"
Fyear: "2021"
IdRow: null
Quantity: "5"
Value: 2076.5
attribute: "formItem"
   */

    calcolateImporto(costo: any, gg: any, index: any) {
        let moltiplication = costo * gg;
        (<FormArray>this.costoPerForm.get('itemsCostoPer')).controls[index].get('Value')?.setValue(moltiplication);
    }

    public select_profiloCosto_costoPersonale_function(e: any, gg: any, index: any) {
        let moltiplication = e.DailyCost * gg;
        (<FormArray>this.costoPerForm.get('itemsCostoPer')).controls[index].get('DailyCost')?.setValue(e.DailyCost);
        (<FormArray>this.costoPerForm.get('itemsCostoPer')).controls[index].get('Value')?.setValue(moltiplication);
    }

    // INPUT CONSULENZA TECNICA
    get itemsConsulenzaTecnicaArrayControl() {
        return (this.consulenzaTecnicaForm.get('itemsConsulenzaTecnica') as FormArray).controls;
    }

    addItemsConsulenzaTecnica() {
        const itemsConsulenzaTecnica = this.consulenzaTecnicaForm.controls.itemsConsulenzaTecnica as FormArray;
        itemsConsulenzaTecnica.push(
            this.formBuilder.group({
                attribute: 'formItem',
                Fyear: this.information_card_anno,
                Fmonth: this.information_card_mese,
                DescSupplier: null,
                DailyCost: null,
                Quantity: null,
                Value: null,
            })
        );
        this.change_forecast_modal();
    }

    // RIMOZIONE ITEM CONSULENZA TECNICA
    removeItemConsulenzaTecnica(index: number) {
        this.itemsConsulenzaTecnicaArrayControl.splice(index, 1);
        const itemsConsulenzaTecnica = this.consulenzaTecnicaForm.controls.itemsConsulenzaTecnica as FormArray;
        itemsConsulenzaTecnica.value.splice(index, 1);
        this.change_forecast_modal();
    }

    calcolateImportoConsulenza(costo: any, gg: any, index: any) {
        let moltiplication = costo * gg;
        (<FormArray>this.consulenzaTecnicaForm.get('itemsConsulenzaTecnica')).controls[index]
            .get('Value')
            ?.setValue(moltiplication);
    }

    // VOCIO DI COSTO
    get itemsVociDiCostoArrayControl() {
        return (this.vociDiCostoForm.get('itemsVociDiCosto') as FormArray).controls;
    }

    // FUNZIONE CHE PRENDE LA SELZIONE DELLA VOCE DI COSTO DELLA SELECT
    public select_voceCosto_function(e: any, index: any) {
        (<FormArray>this.vociDiCostoForm.get('itemsVociDiCosto')).controls[index].get('CeDetType')?.setValue(e.CeDetType);
        (<FormArray>this.vociDiCostoForm.get('itemsVociDiCosto')).controls[index].get('CeInd')?.setValue(e.CeInd);
        (<FormArray>this.vociDiCostoForm.get('itemsVociDiCosto')).controls[index]
            .get('CostElement')
            ?.setValue(e.CostElement);
    }

    //FUNZIONE CHE AGGIUNGE VOCI DI COSTO
    addItemVociDiCosto() {
        const itemsVociDiCosto = this.vociDiCostoForm.controls.itemsVociDiCosto as FormArray;
        itemsVociDiCosto.push(
            this.formBuilder.group({
                CeDetType: null,
                CeInd: null,
                attribute: 'formItem',
                Fyear: this.information_card_anno,
                Fmonth: this.information_card_mese,
                CostElement: null,
                DescrCe: null,
                Value: null,
            })
        );
        this.change_forecast_modal();
    }

    // RIMOZIONI VOCI DI COSTO
    removeVociCosto(index: number) {
        this.itemsVociDiCostoArrayControl.splice(index, 1);
        const itemsVociDiCosto = this.vociDiCostoForm.controls.itemsVociDiCosto as FormArray;
        itemsVociDiCosto.value.splice(index, 1);
        this.change_forecast_modal();
    }

    getEndOfMonth(year: number, month: number) {
        return formattaData(new Date(year, month, 0).toString());
    }

    // FUNZIONE ESTENDI PERIODO
    public estendi_periodo() {
        let lastMonth_int =
            parseInt(
                this.informationsCards[this.informationsCards.length - 1].TPerio[
                this.informationsCards[this.informationsCards.length - 1].TPerio.length - 1
                    ].Fmonth
            ) + 1;
        let lastMonth_str: any;
        if (lastMonth_int < 10) {
            lastMonth_str = '0' + lastMonth_int.toString();
        } else {
            lastMonth_str = lastMonth_int.toString();
        }
        if (lastMonth_int < 13) {
            for (let i = 0; i < this.informationsCards.length; i++) {
                if (this.informationsCards[i].Fyear == this.year) {
                    this.informationsCards[i].TPerio.push({
                        Billing: '0',
                        Costs: '0',
                        Fmonth: lastMonth_str,
                        Fyear: this.year,
                        NetWip: '0',
                        Profitability: '0',
                        Revenues: '0',
                        PerioFrom: '',
                        ChangeInd: '',
                        RevManInd: '',
                        PerioTo: '',
                        type: 'dash',
                    });
                }
            }
            // FUNZIONE CHE INSERISCE IL COLORE DEL PALLINO ACCANTO AL MESE
            this.profitability_circle();
            // let endDate = this.year + '-' + lastMonth_str + '-' + '15';
            let endDate = this.getEndOfMonth(this.year, lastMonth_int);
            this.dataWBsDetail.data.EsForecast.EndDate = endDate;
            this.select_year_function(this.year);
            this.session_dataWBsDetail();
            this.information_card_mese = lastMonth_str;
            this.information_card_anno = this.year;
            this.appare_tab_forecast = true;
            this.appare_tab_consuntivo = false;
        } else if (lastMonth_int >= 13) {
            let lastYear_int = parseInt(this.informationsCards[this.informationsCards.length - 1].Fyear) + 1;
            let lasYear_str = lastYear_int.toString();
            this.informationsCards.push({
                Billing: 0,
                Costs: 0,
                Fyear: lasYear_str,
                NetWip: 0,
                Profitability: 0,
                Revenues: 0,
                PerioFrom: '',
                ChangeInd: '',
                RevManInd: '',
                PerioTo: '',
                TPerio: [],
            });
            for (let i = 0; i < this.informationsCards.length; i++) {
                if (this.informationsCards[i].Fyear == lasYear_str) {
                    this.informationsCards[i].TPerio.push({
                        Billing: '0',
                        Costs: '0',
                        Fmonth: '01',
                        Fyear: lasYear_str,
                        NetWip: '0',
                        Profitability: '0',
                        Revenues: '0',
                        PerioFrom: '',
                        ChangeInd: '',
                        RevManInd: '',
                        PerioTo: '',
                        type: 'dash',
                    });
                }
            }
            // FUNZIONE CHE INSERISCE IL COLORE DEL PALLINO ACCANTO AL MESE
            this.profitability_circle();
            this.optionSelectAnno = [];
            this.initializationOptionSelectAnno();
            this.select_year = this.optionSelectAnno[this.optionSelectAnno.length - 1];
            this.select_year_function(lasYear_str);
            this.appare_estendi_periodo();
            // let endDate = lasYear_str + '-' + '01' + '-' + '15';
            let endDate = this.getEndOfMonth(lastYear_int, 1);
            this.dataWBsDetail.data.EsForecast.EndDate = endDate;
            this.information_card_mese = '01';
            this.information_card_anno = lasYear_str;
            this.appare_tab_forecast = true;
            this.appare_tab_consuntivo = false;
            this.session_dataWBsDetail();
        }
    }

    // FUNZIONE ELIMINA PERIODO
    elimina_periodo() {
        let last_informationCardsTperio: any;
        let max_month: any = '00';
        let TCeEmpl: any = [];
        let TCeCons: any = [];
        let TCostElement: any = [];
        let lastMonth_str: any;
        let lastMonth_int: any;
        for (let i = 0; i < this.informationsCards.length; i++) {
            for (let j = 0; j < this.informationsCards[i].TPerio.length; j++) {
                if (parseInt(max_month) < this.informationsCards[i].TPerio[j].Fmonth) {
                    last_informationCardsTperio = this.informationsCards[i].TPerio[j];
                }
            }
        }
        // condizione che mi fa eliminare tutti le card compreso il primo mese di forecast
        if (
            parseInt(last_informationCardsTperio.Fyear) == parseInt(this.dataWBsDetail.data.EsForecast.Fyear) &&
            parseInt(last_informationCardsTperio.Fmonth) > parseInt(this.dataWBsDetail.data.EsForecast.Fmonth) - 1
        ) {
            if (last_informationCardsTperio.Fyear == this.year && last_informationCardsTperio.Fmonth != '01') {
                for (let i = 0; i < this.informationsCards.length; i++) {
                    if (last_informationCardsTperio.Fyear == this.informationsCards[i].Fyear) {
                        for (let j = 0; j < this.informationsCards[i].TPerio.length; j++) {
                            if (
                                last_informationCardsTperio.Fyear == this.informationsCards[i].TPerio[j].Fyear &&
                                last_informationCardsTperio.Fmonth == this.informationsCards[i].TPerio[j].Fmonth
                            ) {
                                this.informationsCards[i].TPerio.splice(j, 1);
                            }
                        }
                    }
                }
                if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeEmpl.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fmonth
                        ) {
                            TCeEmpl.push(this.dataWBsDetail.data.EsForecast.TCeEmpl[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl.filter(
                        (item: any) => !TCeEmpl.includes(item)
                    );
                }
                if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeCons.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fmonth
                        ) {
                            TCeCons.push(this.dataWBsDetail.data.EsForecast.TCeCons[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons.filter(
                        (item: any) => !TCeCons.includes(item)
                    );
                }
                if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fmonth
                        ) {
                            TCostElement.push(this.dataWBsDetail.data.EsForecast.TCostElement[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(
                        (item: any) => !TCostElement.includes(item)
                    );
                }
                lastMonth_int = parseInt(last_informationCardsTperio.Fmonth) - 1;
                if (lastMonth_int < 10) {
                    lastMonth_str = '0' + lastMonth_int.toString();
                } else {
                    lastMonth_str = lastMonth_int.toString();
                }
                // let endDate = this.year + '-' + lastMonth_str + '-' + '15';
                let endDate = this.getEndOfMonth(this.year, lastMonth_int);
                this.select_year_function(this.year);
                this.dataWBsDetail.data.EsForecast.EndDate = endDate;
                this.information_card_mese = lastMonth_str;
                this.information_card_anno = this.year;
                this.month_Year();
                if (this.lastConsMonth == this.information_card_mese && this.lastConsYear == this.information_card_anno) {
                    this.appare_tab_forecast = false;
                    this.appare_tab_consuntivo = true;
                } else {
                    this.appare_tab_forecast = true;
                    this.appare_tab_consuntivo = false;
                }
                this.getCostoPersonaleDetail();
                this.getConsulenzaDetail();
                this.getVociDiCostoDetail();
                this.session_dataWBsDetail();
            }
            if (last_informationCardsTperio.Fyear == this.year && last_informationCardsTperio.Fmonth == '01') {
                for (let i = 0; i < this.informationsCards.length; i++) {
                    if (last_informationCardsTperio.Fyear == this.informationsCards[i].Fyear) {
                        this.informationsCards.splice(i, 1);
                    }
                }
                if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeEmpl.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fmonth
                        ) {
                            TCeEmpl.push(this.dataWBsDetail.data.EsForecast.TCeEmpl[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl.filter(
                        (item: any) => !TCeEmpl.includes(item)
                    );
                }
                if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeCons.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fmonth
                        ) {
                            TCeCons.push(this.dataWBsDetail.data.EsForecast.TCeCons[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons.filter(
                        (item: any) => !TCeCons.includes(item)
                    );
                }
                if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fmonth
                        ) {
                            TCostElement.push(this.dataWBsDetail.data.EsForecast.TCostElement[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(
                        (item: any) => !TCostElement.includes(item)
                    );
                }
                let lastYear_int = parseInt(last_informationCardsTperio.Fyear) - 1;
                let lastYear_str = lastYear_int.toString();
                this.optionSelectAnno = [];
                this.initializationOptionSelectAnno();
                this.select_year = this.optionSelectAnno[this.optionSelectAnno.length - 1];
                this.select_year_function(lastYear_str);
                this.appare_estendi_periodo();
                // let endDate = lastYear_str + '-' + '12' + '-' + '15';
                let endDate = this.getEndOfMonth(lastYear_int, 12);
                this.dataWBsDetail.data.EsForecast.EndDate = endDate;
                this.information_card_mese = '12';
                this.information_card_anno = lastYear_str;
                if (this.lastConsMonth == this.information_card_mese && this.lastConsYear == this.information_card_anno) {
                    this.appare_tab_forecast = false;
                    this.appare_tab_consuntivo = true;
                } else {
                    this.appare_tab_forecast = true;
                    this.appare_tab_consuntivo = false;
                }
                this.getCostoPersonaleDetail();
                this.getConsulenzaDetail();
                this.getVociDiCostoDetail();
                this.session_dataWBsDetail();
            }
        } else if (parseInt(last_informationCardsTperio.Fyear) > parseInt(this.dataWBsDetail.data.EsForecast.Fyear)) {
            if (last_informationCardsTperio.Fyear == this.year && last_informationCardsTperio.Fmonth != '01') {
                for (let i = 0; i < this.informationsCards.length; i++) {
                    if (last_informationCardsTperio.Fyear == this.informationsCards[i].Fyear) {
                        for (let j = 0; j < this.informationsCards[i].TPerio.length; j++) {
                            if (
                                last_informationCardsTperio.Fyear == this.informationsCards[i].TPerio[j].Fyear &&
                                last_informationCardsTperio.Fmonth == this.informationsCards[i].TPerio[j].Fmonth
                            ) {
                                this.informationsCards[i].TPerio.splice(j, 1);
                            }
                        }
                    }
                }
                if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeEmpl.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fmonth
                        ) {
                            TCeEmpl.push(this.dataWBsDetail.data.EsForecast.TCeEmpl[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl.filter(
                        (item: any) => !TCeEmpl.includes(item)
                    );
                }
                if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeCons.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fmonth
                        ) {
                            TCeCons.push(this.dataWBsDetail.data.EsForecast.TCeCons[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons.filter(
                        (item: any) => !TCeCons.includes(item)
                    );
                }
                if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fmonth
                        ) {
                            TCostElement.push(this.dataWBsDetail.data.EsForecast.TCostElement[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(
                        (item: any) => !TCostElement.includes(item)
                    );
                }
                lastMonth_int = parseInt(last_informationCardsTperio.Fmonth) - 1;
                if (lastMonth_int < 10) {
                    lastMonth_str = '0' + lastMonth_int.toString();
                } else {
                    lastMonth_str = lastMonth_int.toString();
                }
                // let endDate = this.year + '-' + lastMonth_str + '-' + '15';
                let endDate = this.getEndOfMonth(this.year, lastMonth_int);
                this.select_year_function(this.year);
                this.dataWBsDetail.data.EsForecast.EndDate = endDate;
                this.information_card_mese = lastMonth_str;
                this.information_card_anno = this.year;
                if (this.lastConsMonth == this.information_card_mese && this.lastConsYear == this.information_card_anno) {
                    this.appare_tab_forecast = false;
                    this.appare_tab_consuntivo = true;
                } else {
                    this.appare_tab_forecast = true;
                    this.appare_tab_consuntivo = false;
                }
                this.getConsulenzaDetail();
                this.getVociDiCostoDetail();
                this.getCostoPersonaleDetail();
                this.session_dataWBsDetail();
            }
            if (last_informationCardsTperio.Fyear == this.year && last_informationCardsTperio.Fmonth == '01') {
                for (let i = 0; i < this.informationsCards.length; i++) {
                    if (last_informationCardsTperio.Fyear == this.informationsCards[i].Fyear) {
                        this.informationsCards.splice(i, 1);
                    }
                }
                if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeEmpl.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fmonth
                        ) {
                            TCeEmpl.push(this.dataWBsDetail.data.EsForecast.TCeEmpl[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl.filter(
                        (item: any) => !TCeEmpl.includes(item)
                    );
                }
                if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeCons.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fmonth
                        ) {
                            TCeCons.push(this.dataWBsDetail.data.EsForecast.TCeCons[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons.filter(
                        (item: any) => !TCeCons.includes(item)
                    );
                }
                if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
                    for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
                        if (
                            last_informationCardsTperio.Fyear == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fyear &&
                            last_informationCardsTperio.Fmonth == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fmonth
                        ) {
                            TCostElement.push(this.dataWBsDetail.data.EsForecast.TCostElement[i]);
                        }
                    }
                    this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(
                        (item: any) => !TCostElement.includes(item)
                    );
                }

                let lastYear_int = parseInt(last_informationCardsTperio.Fyear) - 1;
                let lastYear_str = lastYear_int.toString();
                this.optionSelectAnno = [];
                this.initializationOptionSelectAnno();
                this.select_year = this.optionSelectAnno[this.optionSelectAnno.length - 1];
                this.select_year_function(lastYear_str);
                this.appare_estendi_periodo();
                // let endDate = lastYear_str + '-' + '12' + '-' + '15';
                let endDate = this.getEndOfMonth(lastYear_int, 12);
                this.dataWBsDetail.data.EsForecast.EndDate = endDate;
                this.information_card_mese = '12';
                this.information_card_anno = lastYear_str;
                if (this.lastConsMonth == this.information_card_mese && this.lastConsYear == this.information_card_anno) {
                    this.appare_tab_forecast = false;
                    this.appare_tab_consuntivo = true;
                } else {
                    this.appare_tab_forecast = true;
                    this.appare_tab_consuntivo = false;
                }
                this.getConsulenzaDetail();
                this.getVociDiCostoDetail();
                this.getCostoPersonaleDetail();
                this.session_dataWBsDetail();
            }
        }
    }

    // funzinoe che fa apparire il bottone del estendi periodo
    appare_estendi_periodo() {
        this.date_est_per = this.informationsCards[this.informationsCards.length - 1].Fyear;
    }

    // FUNZIONE AGGIONRAMENTO DB EsFOrecast
    update_EsForecast(wbs: any, StartDate: any, EndDate: any, TCostElement: any, TCeEmpl: any, TCeCons: any) {
        const data = {
            IWbs: wbs,
            IsForecast: {
                StartDate: StartDate,
                EndDate: EndDate,
                TCostElement: TCostElement,
                TCeEmpl: TCeEmpl,
                TCeCons: TCeCons,
            },
        };

        this.wbsManagerService
            // .getWbsChange(wbs, StartDate, EndDate, TCostElement, TCeEmpl, TCeCons, null)
            .getWbsChange(data)
            .subscribe(response => {
                this.fnt_maxDate_Wbs();
                //this.notificationToastrService.showMessage(response);
                this.disbaledInvia = false;
                //  NUOVA RISPOSTA DB
                this.wbsManagerService.getWBSDetail(this.wbs, this.isObject).subscribe((response: any) => {
                    this.dataWBsDetail = response;
                    // AGGIORNAENTO ARRAY TPERIO DOPO LA MODIFICA DELLE TABELLE
                    const EsForecastTCeTot = this.dataWBsDetail.data.EsForecast.TCeTot;
                    // CICLO CHE MI FA A PRENDERE L'ARRAY INTERESSATO DI TPerio
                    for (let i = 0; i < this.TPerio.length; i++) {
                        // CONDIZIONE CHE MI PRENDERE IL TPerio SELEZIONATO , CONFRONTO CON L'INFORMATION CARD IN ALTO A DESTRA
                        if (
                            this.information_card_mese == this.TPerio[i].Fmonth &&
                            this.information_card_anno == this.TPerio[i].Fyear
                        ) {
                            // CICLI SUL ARRAY CHE MI PASSA IL DB
                            for (let j = 0; j < EsForecastTCeTot.length; j++) {
                                for (let c = 0; c < EsForecastTCeTot[j].TPerio.length; c++) {
                                    if (
                                        this.information_card_anno == EsForecastTCeTot[j].TPerio[c].Fyear &&
                                        this.information_card_mese == EsForecastTCeTot[j].TPerio[c].Fmonth
                                    ) {
                                        // VALORIIZAZIONE/AGGIORNAMENTO TPerio
                                        this.TPerio[i].Costs = EsForecastTCeTot[j].TPerio[c].Costs;
                                        this.TPerio[i].Revenues = EsForecastTCeTot[j].TPerio[c].Revenues;
                                        this.TPerio[i].Profitability = EsForecastTCeTot[j].TPerio[c].Profitability;
                                        this.TPerio[i].type = 'blueCard';
                                        console.log(this.TPerio[i]);
                                    }
                                }
                            }
                        }
                    }
                    this.wbsManagerService.passDataToAcr(response);

                    this.wbsManagerService.getWbsPrcstGetlist().subscribe(response => {
                        this.EtPrcstList = response;
                    });

                    this.wbsManagerService.getWbsSupplGetlist().subscribe(response => {
                        this.EtSupplList = response;
                    });
                    this.wbsManagerService.getWbsCeGetList(wbs).subscribe(response => {
                        this.WbsCe = response;
                        this.WbsCe.data.EtCeList = this.WbsCe.data.EtCeList.filter(function (item: any) {
                            return item.CeDetType === 'G';
                        });
                    });
                });
            });
    }

    // funzione per calcolare le stringhe dei mesi
    new_mese_fnct(new_mese_int: number) {
        let new_mese_str: any;
        // ripasso in stringa il nuovo mese calcolato e faccio una condizione
        // true : i mesi che sono minori di 10 devono essere formati da 0+numero
        // false : i mesi che sono maggiorni di 10 vengono semplicemente passati a stringa
        if (new_mese_int < 10) {
            new_mese_str = '0' + new_mese_int.toString();
        } else {
            new_mese_str = new_mese_int.toString();
        }
        return new_mese_str;
    }

    // FUNZIONE CHE AGGIUNGE VALORI A TPERIO
    add_TPerio(
        Billing: any,
        Costs: any,
        Fmonth: any,
        Fyear: any,
        NetWip: any,
        Profitability: any,
        Revenues: any,
        PerioFrom: any,
        ChangeInd: any,
        RevManInd: any,
        PerioTo: any,
        type: any
    ) {
        this.TPerio.push({
            Billing: Billing,
            Costs: Costs,
            Fmonth: Fmonth,
            Fyear: Fyear,
            NetWip: NetWip,
            Profitability: Profitability,
            Revenues: Revenues,
            PerioFrom: PerioFrom,
            ChangeInd: ChangeInd,
            RevManInd: RevManInd,
            PerioTo: PerioTo,
            type: type,
        });
    }

    comparerTCeEmpl(otherArray: any) {
        return function (current: any) {
            return (
                otherArray.filter(function (other: any) {
                    return other.Fyear == current.Fyear && other.Fmonth == current.Fmonth;
                }).length == 0
            );
        };
    }

    comparerTBalCons(otherArray: any) {
        return function (current: any) {
            return (
                otherArray.filter(function (other: any) {
                    return other.Fyear == current.Fyear && other.Fmonth == current.Fmonth;
                }).length == 0
            );
        };
    }

    // salva() {
    // 	let detailDate: any;
    // 	detailDate = {
    // 		Fyear: this.information_card_anno,
    // 		Fmonth: this.information_card_mese,
    // 	};
    // 	this.click_forecast(detailDate, false);
    // 	this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((element: any, index: any) => {
    // 		if (
    // 			element.CostProfile === null &&
    // 			element.DailyCost === null &&
    // 			element.Quantity === null &&
    // 			element.Value === null
    // 		) {
    // 			this.dataWBsDetail.data.EsForecast.TCeEmpl.splice(index, 1);
    // 		}
    // 	});
    // 	this.dataWBsDetail.data.EsForecast.TCeCons.forEach((element: any, index: any) => {
    // 		if (
    // 			element.DescSupplier === null &&
    // 			element.DailyCost === null &&
    // 			element.Quantity === null &&
    // 			element.Value === null
    // 		) {
    // 			this.dataWBsDetail.data.EsForecast.TCeCons.splice(index, 1);
    // 		}
    // 	});
    // 	this.TCostElement.forEach((element: any, index: any) => {
    // 		if (element.DescrCe === null && element.Value === null) {
    // 			this.TCostElement.splice(index, 1);
    // 		}
    // 	});
    //
    // 	let checkCostoPersonaleChanged: boolean = false;
    // 	if (this.CostoPersonale.length < this.dataWBsDetail.data.EsForecast.TCeEmpl.length) {
    // 		checkCostoPersonaleChanged = true;
    // 	} else {
    // 		this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((element: any) => {
    // 			this.CostoPersonale.forEach((item: any) => {
    // 				if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && element.IdRow === item.IdRow) {
    // 					if (element.Quantity !== item.Quantity || element.Value !== item.Value) {
    // 						checkCostoPersonaleChanged = true;
    // 					}
    // 				}
    // 			});
    // 		});
    // 	}
    //
    // 	let checkConsulenzaChanged: boolean = false;
    // 	if (this.CostoConsulenza.length < this.dataWBsDetail.data.EsForecast.TCeCons.length) {
    // 		checkConsulenzaChanged = true;
    // 	} else {
    // 		this.dataWBsDetail.data.EsForecast.TCeCons.forEach((element: any) => {
    // 			this.CostoConsulenza.forEach((item: any) => {
    // 				if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && element.IdRow === item.IdRow) {
    // 					if (
    // 						element.DailyCost !== item.DailyCost ||
    // 						element.Quantity !== item.Quantity ||
    // 						element.Value !== item.Value
    // 					) {
    // 						checkConsulenzaChanged = true;
    // 					}
    // 				}
    // 			});
    // 		});
    // 	}
    //
    // 	let checkCostElementChanged: boolean = false;
    // 	if (this.CostoGenerico.length < this.TCostElement.length) {
    // 		checkCostElementChanged = true;
    // 	} else {
    // 		this.TCostElement.forEach((element: any) => {
    // 			this.CostoGenerico.forEach((item: any) => {
    // 				if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && element.IdRow === item.IdRow) {
    // 					if (element.Value !== item.Value) {
    // 						checkCostElementChanged = true;
    // 					}
    // 				}
    // 			});
    // 		});
    // 	}
    //
    // 	/*if (checkCostoPersonaleChanged === false && checkConsulenzaChanged === false && checkCostElementChanged === false && this.appare_tab_forecast === true) {
    //     const unauthorized = {};
    //     const modalRef = this.modalService.open(ModalComponent);
    //     modalRef.componentInstance.unauthorized = unauthorized;
    //     return;
    //   }*/
    // 	let invalidVodiciDicostoBool: boolean = false;
    //
    // 	this.vociDiCostoForm.value.itemsVociDiCosto.forEach((item: any) => {
    // 		if (item.Value != null && item.DescrCe == null) invalidVodiciDicostoBool = true;
    // 	});
    //
    // 	if (invalidVodiciDicostoBool) {
    // 		const invalidVociCosto = {};
    // 		const modalRef = this.modalService.open(ModalComponent);
    // 		modalRef.componentInstance.invalidVociCosto = invalidVociCosto;
    // 		return;
    // 	}
    // 	let TCeEmpl: any = [];
    // 	let checkTCeEmplIdRow: any = [];
    // 	TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl;
    // 	if (TCeEmpl !== []) {
    // 		TCeEmpl.forEach((element: any) => {
    // 			if (element.IdRow !== undefined && element.IdRow !== null) {
    // 				checkTCeEmplIdRow.push(parseInt(element.IdRow));
    // 			}
    // 		});
    // 		checkTCeEmplIdRow.sort(function (a: any, b: any) {
    // 			return b - a;
    // 		});
    // 		let itemForIterationTCeEmpl: number = 0;
    // 		if (checkTCeEmplIdRow.length !== 0) {
    // 			itemForIterationTCeEmpl = checkTCeEmplIdRow[0];
    // 		}
    // 		TCeEmpl.forEach((element: any) => {
    // 			if (element.IdRow === undefined || element.IdRow === null) {
    // 				itemForIterationTCeEmpl = itemForIterationTCeEmpl + 1;
    // 				element.IdRow = itemForIterationTCeEmpl;
    // 				if (element.IdRow.toString().length === 1) {
    // 					element.IdRow = '0' + '0' + element.IdRow;
    // 				}
    // 				if (element.IdRow.toString().length === 2) {
    // 					element.IdRow = '0' + element.IdRow;
    // 				}
    // 				if (element.IdRow.toString().length >= 3) {
    // 					element.IdRow = element.IdRow.toString();
    // 				}
    // 			}
    // 		});
    // 		let newArrayTCeEmpl: any = [];
    // 		TCeEmpl.forEach((element: any) => {
    // 			newArrayTCeEmpl.push({
    // 				CostProfile: element.CostProfile,
    // 				DailyCost: element.DailyCost,
    // 				Fmonth: element.Fmonth,
    // 				Fyear: element.Fyear,
    // 				IdRow: element.IdRow,
    // 				Quantity: element.Quantity,
    // 				Value: element.Value,
    // 			});
    // 		});
    // 		TCeEmpl = [];
    // 		TCeEmpl = newArrayTCeEmpl;
    // 		let checkCostElementsForTCeEmpl: any = [];
    // 		checkCostElementsForTCeEmpl = this.dataWBsDetail.data.EsForecast.TCostElement;
    // 		TCeEmpl.forEach((element: any) => {
    // 			checkCostElementsForTCeEmpl.forEach((item: any) => {
    // 				if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && item.CeDetType === 'E') {
    // 					element.ParentIdRow = item.IdRow;
    // 				}
    // 			});
    // 		});
    // 		var onlyInATCeEmpl = TCeEmpl.filter(this.comparerTCeEmpl(checkCostElementsForTCeEmpl));
    // 		var onlyInBTCeEmpl = checkCostElementsForTCeEmpl.filter(this.comparerTCeEmpl(TCeEmpl));
    // 		let resultTCeEmpl: any = [];
    // 		resultTCeEmpl = onlyInATCeEmpl.concat(onlyInBTCeEmpl);
    // 		resultTCeEmpl = resultTCeEmpl.filter(function (item: any) {
    // 			return !item.CeDetType;
    // 		});
    // 		if (resultTCeEmpl.lenght !== 0) {
    // 			let checkTCeEmplCostElementsIdRowTCeEmpl: any = [];
    // 			this.dataWBsDetail.data.EsForecast.TCostElement.forEach((items1: any) => {
    // 				checkTCeEmplCostElementsIdRowTCeEmpl.push(parseInt(items1.IdRow));
    // 			});
    // 			checkTCeEmplCostElementsIdRowTCeEmpl.sort(function (a: any, b: any) {
    // 				return b - a;
    // 			});
    // 			let itemForIterationTCeEmplCostElements: number = 0;
    // 			let IdRowCostelements: string;
    // 			if (checkTCeEmplCostElementsIdRowTCeEmpl.length !== 0) {
    // 				itemForIterationTCeEmplCostElements = checkTCeEmplCostElementsIdRowTCeEmpl[0];
    // 			}
    // 			resultTCeEmpl = resultTCeEmpl.reduce((itemSearch: any, item: any) => {
    // 				const found = itemSearch.find(
    // 					(resultTCeEmpl: any) => resultTCeEmpl.Fyear === item.Fyear && resultTCeEmpl.Fmonth === item.Fmonth
    // 				);
    // 				if (!found) {
    // 					itemSearch.push({ Fyear: item.Fyear, Fmonth: item.Fmonth, data: [item] });
    // 				} else {
    // 					found.data.push(item);
    // 				}
    // 				return itemSearch;
    // 			}, []);
    // 			resultTCeEmpl.forEach((element: any) => {
    // 				itemForIterationTCeEmplCostElements = itemForIterationTCeEmplCostElements + 1;
    // 				if (itemForIterationTCeEmplCostElements.toString().length === 1) {
    // 					IdRowCostelements = '0' + '0' + itemForIterationTCeEmplCostElements;
    // 				}
    // 				if (itemForIterationTCeEmplCostElements.toString().length === 2) {
    // 					IdRowCostelements = '0' + itemForIterationTCeEmplCostElements;
    // 				}
    // 				if (itemForIterationTCeEmplCostElements.toString().length >= 3) {
    // 					IdRowCostelements = itemForIterationTCeEmplCostElements.toString();
    // 				}
    // 				this.dataWBsDetail.data.EsForecast.TCostElement.push({
    // 					CeDetType: 'E',
    // 					CeInd: 'R',
    // 					CostElement: 'F0002',
    // 					DescrCe: 'COSTO DEL PERSONALE',
    // 					Fmonth: element.Fmonth,
    // 					Fyear: element.Fyear,
    // 					IdRow: IdRowCostelements,
    // 				});
    // 				this.dataWBsDetail.data.EsForecast.TCostElement.forEach((element: any) => {
    // 					TCeEmpl.forEach((item: any) => {
    // 						if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && item.ParentIdRow === null) {
    // 							item.ParentIdRow = element.IdRow;
    // 						}
    // 					});
    // 				});
    // 			});
    // 		}
    // 		// console.log('TCeEmpl', TCeEmpl)
    // 		let TCostElementsTCeEmplSetValues: any = [];
    // 		TCostElementsTCeEmplSetValues = TCeEmpl.reduce((itemSearch: any, item: any) => {
    // 			const found = itemSearch.find(
    // 				(values: any) =>
    // 					values.Fyear === item.Fyear && values.Fmonth === item.Fmonth && values.ParentIdRow === item.ParentIdRow
    // 			);
    // 			if (!found) {
    // 				itemSearch.push({ Fyear: item.Fyear, Fmonth: item.Fmonth, ParentIdRow: item.ParentIdRow, data: [item] });
    // 			} else {
    // 				found.data.push(item);
    // 			}
    // 			return itemSearch;
    // 		}, []);
    // 		let checkTCeEmplCostElementsIdRowTCeEmpl: any = [];
    // 		this.dataWBsDetail.data.EsForecast.TCostElement.forEach((items1: any) => {
    // 			checkTCeEmplCostElementsIdRowTCeEmpl.push(parseInt(items1.IdRow));
    // 		});
    // 		checkTCeEmplCostElementsIdRowTCeEmpl.sort(function (a: any, b: any) {
    // 			return b - a;
    // 		});
    // 		let itemForIterationTCeEmplCostElements: number = 0;
    // 		let IdRowCostelements: string;
    // 		if (checkTCeEmplCostElementsIdRowTCeEmpl.length !== 0) {
    // 			itemForIterationTCeEmplCostElements = checkTCeEmplCostElementsIdRowTCeEmpl[0];
    // 		}
    // 		TCostElementsTCeEmplSetValues.forEach((element: any) => {
    // 			let status: any;
    // 			status = this.dataWBsDetail.data.EsForecast.TCostElement.some(function (item: any) {
    // 				return item.Fyear == element.Fyear && item.Fmonth == element.Fmonth && item.CeDetType === 'E';
    // 			});
    // 			if (status === false) {
    // 				if (element.ParentIdRow === undefined) {
    // 					itemForIterationTCeEmplCostElements = itemForIterationTCeEmplCostElements + 1;
    // 					if (itemForIterationTCeEmplCostElements.toString().length === 1) {
    // 						IdRowCostelements = '0' + '0' + itemForIterationTCeEmplCostElements;
    // 					}
    // 					if (itemForIterationTCeEmplCostElements.toString().length === 2) {
    // 						IdRowCostelements = '0' + itemForIterationTCeEmplCostElements;
    // 					}
    // 					if (itemForIterationTCeEmplCostElements.toString().length >= 3) {
    // 						IdRowCostelements = itemForIterationTCeEmplCostElements.toString();
    // 					}
    // 					this.dataWBsDetail.data.EsForecast.TCostElement.push({
    // 						CeDetType: 'E',
    // 						CeInd: 'R',
    // 						CostElement: 'F0002',
    // 						DescrCe: 'COSTO DEL PERSONALE',
    // 						Fmonth: element.Fmonth,
    // 						Fyear: element.Fyear,
    // 						IdRow: IdRowCostelements,
    // 					});
    // 				}
    // 			}
    // 		});
    // 		TCostElementsTCeEmplSetValues.forEach((element: any) => {
    // 			this.dataWBsDetail.data.EsForecast.TCostElement.forEach((item: any) => {
    // 				if (item.Fyear == element.Fyear && item.Fmonth == element.Fmonth && item.ParentIdRow === undefined) {
    // 					element.ParentIdRow = item.IdRow;
    // 				}
    // 			});
    // 		});
    // 		TCostElementsTCeEmplSetValues.forEach((element: any) => {
    // 			let CostElementsTCeEmplValues: any = [];
    // 			element.data.forEach((item: any) => {
    // 				CostElementsTCeEmplValues.push(item.Value);
    // 			});
    // 			let totalCost = CostElementsTCeEmplValues.reduce((x: any, y: any) => parseInt(x) + parseInt(y));
    // 			element.totalCost = parseInt(totalCost);
    // 		});
    // 		TCeEmpl.forEach((element: any) => {
    // 			this.dataWBsDetail.data.EsForecast.TCostElement.forEach((item: any) => {
    // 				if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && item.CeDetType === 'E') {
    // 					element.ParentIdRow = item.IdRow;
    // 				}
    // 			});
    // 		});
    // 		// console.log('TCostElementsTCeEmplSetValues', TCostElementsTCeEmplSetValues)
    // 		TCostElementsTCeEmplSetValues.forEach((item: any) => {
    // 			this.dataWBsDetail.data.EsForecast.TCostElement.forEach((element: any) => {
    // 				if (
    // 					element.Fyear === item.Fyear &&
    // 					element.Fmonth === item.Fmonth &&
    // 					element.Value === undefined &&
    // 					element.IdRow === item.ParentIdRow
    // 				) {
    // 					element.Value = item.totalCost;
    // 				}
    // 				if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && element.IdRow === item.ParentIdRow) {
    // 					element.Value = parseInt(element.Value);
    // 					element.Value = item.totalCost;
    // 				}
    // 			});
    // 		});
    // 		TCeEmpl.forEach((element: any) => {
    // 			if (typeof element.Value === 'number') {
    // 				element.Value = element.Value.toFixed(2);
    // 				element.Value = element.Value.toString();
    // 			}
    // 		});
    // 		// console.log('TCeEmpl', TCeEmpl)
    // 		// console.log('this.dataWBsDetail.data.EsForecast.TCostElement 1', this.dataWBsDetail.data.EsForecast.TCostElement)
    // 	}
    //
    // 	let TCeCons: any = [];
    // 	let checkTBalConsIdRow: any = [];
    // 	TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons;
    // 	if (TCeCons !== []) {
    // 		TCeCons.forEach((element: any) => {
    // 			if (element.IdRow !== undefined && element.IdRow !== null) {
    // 				checkTBalConsIdRow.push(parseInt(element.IdRow));
    // 			}
    // 		});
    // 		checkTBalConsIdRow.sort(function (a: any, b: any) {
    // 			return b - a;
    // 		});
    // 		let itemForIterationTBalCons: number = 0;
    // 		if (checkTBalConsIdRow.length !== 0) {
    // 			itemForIterationTBalCons = checkTBalConsIdRow[0];
    // 		}
    // 		TCeCons.forEach((element: any) => {
    // 			if (element.IdRow === undefined || element.IdRow === null) {
    // 				itemForIterationTBalCons = itemForIterationTBalCons + 1;
    // 				element.IdRow = itemForIterationTBalCons;
    // 				if (element.IdRow.toString().length === 1) {
    // 					element.IdRow = '0' + '0' + element.IdRow;
    // 				}
    // 				if (element.IdRow.toString().length === 2) {
    // 					element.IdRow = '0' + element.IdRow;
    // 				}
    // 				if (element.IdRow.toString().length >= 3) {
    // 					element.IdRow = element.IdRow.toString();
    // 				}
    // 			}
    // 		});
    // 		let newArrayTBalCons: any = [];
    // 		TCeCons.forEach((element: any) => {
    // 			newArrayTBalCons.push({
    // 				DailyCost: element.DailyCost,
    // 				DescSupplier: element.DescSupplier,
    // 				Fmonth: element.Fmonth,
    // 				Fyear: element.Fyear,
    // 				IdRow: element.IdRow,
    // 				Quantity: element.Quantity,
    // 				Value: element.Value,
    // 			});
    // 		});
    // 		TCeCons = [];
    // 		TCeCons = newArrayTBalCons;
    // 		let checkCostElementsForTBalCons: any = [];
    // 		checkCostElementsForTBalCons = this.dataWBsDetail.data.EsForecast.TCostElement;
    // 		TCeCons.forEach((element: any) => {
    // 			checkCostElementsForTBalCons.forEach((item: any) => {
    // 				if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && item.CeDetType === 'C') {
    // 					element.ParentIdRow = item.IdRow;
    // 				}
    // 			});
    // 		});
    // 		var onlyInATBalCons = TCeCons.filter(this.comparerTBalCons(checkCostElementsForTBalCons));
    // 		var onlyInBTBalCons = checkCostElementsForTBalCons.filter(this.comparerTBalCons(TCeCons));
    // 		let resultTBalCons: any = [];
    // 		resultTBalCons = onlyInATBalCons.concat(onlyInBTBalCons);
    // 		resultTBalCons = resultTBalCons.filter(function (item: any) {
    // 			return !item.CeDetType;
    // 		});
    // 		if (resultTBalCons.lenght !== 0) {
    // 			let checkTCeEmplCostElementsIdRowTBalCons: any = [];
    // 			this.dataWBsDetail.data.EsForecast.TCostElement.forEach((items1: any) => {
    // 				checkTCeEmplCostElementsIdRowTBalCons.push(parseInt(items1.IdRow));
    // 			});
    // 			checkTCeEmplCostElementsIdRowTBalCons.sort(function (a: any, b: any) {
    // 				return b - a;
    // 			});
    // 			let itemForIterationTBalConsCostElements: number = 0;
    // 			let IdRowCostelements: string;
    // 			if (checkTCeEmplCostElementsIdRowTBalCons.length !== 0) {
    // 				itemForIterationTBalConsCostElements = checkTCeEmplCostElementsIdRowTBalCons[0];
    // 			}
    // 			resultTBalCons = resultTBalCons.reduce((itemSearch: any, item: any) => {
    // 				const found = itemSearch.find(
    // 					(resultTBalCons: any) => resultTBalCons.Fyear === item.Fyear && resultTBalCons.Fmonth === item.Fmonth
    // 				);
    // 				if (!found) {
    // 					itemSearch.push({ Fyear: item.Fyear, Fmonth: item.Fmonth, data: [item] });
    // 				} else {
    // 					found.data.push(item);
    // 				}
    // 				return itemSearch;
    // 			}, []);
    // 			resultTBalCons.forEach((element: any) => {
    // 				itemForIterationTBalConsCostElements = itemForIterationTBalConsCostElements + 1;
    // 				if (itemForIterationTBalConsCostElements.toString().length === 1) {
    // 					IdRowCostelements = '0' + '0' + itemForIterationTBalConsCostElements;
    // 				}
    // 				if (itemForIterationTBalConsCostElements.toString().length === 2) {
    // 					IdRowCostelements = '0' + itemForIterationTBalConsCostElements;
    // 				}
    // 				if (itemForIterationTBalConsCostElements.toString().length >= 3) {
    // 					IdRowCostelements = itemForIterationTBalConsCostElements.toString();
    // 				}
    // 				this.dataWBsDetail.data.EsForecast.TCostElement.push({
    // 					CeDetType: 'C',
    // 					CeInd: 'C',
    // 					CostElement: 'F0004',
    // 					DescrCe: 'CONSULENZE',
    // 					Fmonth: element.Fmonth,
    // 					Fyear: element.Fyear,
    // 					IdRow: IdRowCostelements,
    // 				});
    // 				this.dataWBsDetail.data.EsForecast.TCostElement.forEach((element: any) => {
    // 					TCeCons.forEach((item: any) => {
    // 						if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && item.ParentIdRow === null) {
    // 							item.ParentIdRow = element.IdRow;
    // 						}
    // 					});
    // 				});
    // 			});
    // 		}
    // 		//  console.log('TCeCons', TCeCons)
    // 		let TCostElementsTBalConsSetValues: any = [];
    // 		TCostElementsTBalConsSetValues = TCeCons.reduce((itemSearch: any, item: any) => {
    // 			const found = itemSearch.find(
    // 				(values: any) =>
    // 					values.Fyear === item.Fyear && values.Fmonth === item.Fmonth && values.ParentIdRow === item.ParentIdRow
    // 			);
    // 			if (!found) {
    // 				itemSearch.push({ Fyear: item.Fyear, Fmonth: item.Fmonth, ParentIdRow: item.ParentIdRow, data: [item] });
    // 			} else {
    // 				found.data.push(item);
    // 			}
    // 			return itemSearch;
    // 		}, []);
    // 		let checkTCeEmplCostElementsIdRowTBalCons: any = [];
    // 		this.dataWBsDetail.data.EsForecast.TCostElement.forEach((items1: any) => {
    // 			checkTCeEmplCostElementsIdRowTBalCons.push(parseInt(items1.IdRow));
    // 		});
    // 		checkTCeEmplCostElementsIdRowTBalCons.sort(function (a: any, b: any) {
    // 			return b - a;
    // 		});
    // 		let itemForIterationTBalConsCostElements: number = 0;
    // 		let IdRowCostelements: string;
    // 		if (checkTCeEmplCostElementsIdRowTBalCons.length !== 0) {
    // 			itemForIterationTBalConsCostElements = checkTCeEmplCostElementsIdRowTBalCons[0];
    // 		}
    // 		TCostElementsTBalConsSetValues.forEach((element: any) => {
    // 			let status: any;
    // 			status = this.dataWBsDetail.data.EsForecast.TCostElement.some(function (item: any) {
    // 				return item.Fyear == element.Fyear && item.Fmonth == element.Fmonth && item.CeDetType === 'C';
    // 			});
    // 			if (status === false) {
    // 				if (element.ParentIdRow === undefined) {
    // 					itemForIterationTBalConsCostElements = itemForIterationTBalConsCostElements + 1;
    // 					if (itemForIterationTBalConsCostElements.toString().length === 1) {
    // 						IdRowCostelements = '0' + '0' + itemForIterationTBalConsCostElements;
    // 					}
    // 					if (itemForIterationTBalConsCostElements.toString().length === 2) {
    // 						IdRowCostelements = '0' + itemForIterationTBalConsCostElements;
    // 					}
    // 					if (itemForIterationTBalConsCostElements.toString().length >= 3) {
    // 						IdRowCostelements = itemForIterationTBalConsCostElements.toString();
    // 					}
    // 					this.dataWBsDetail.data.EsForecast.TCostElement.push({
    // 						CeDetType: 'C',
    // 						CeInd: 'C',
    // 						CostElement: 'F0004',
    // 						DescrCe: 'CONSULENZE',
    // 						Fmonth: element.Fmonth,
    // 						Fyear: element.Fyear,
    // 						IdRow: IdRowCostelements,
    // 					});
    // 				}
    // 			}
    // 		});
    // 		TCostElementsTBalConsSetValues.forEach((element: any) => {
    // 			this.dataWBsDetail.data.EsForecast.TCostElement.forEach((item: any) => {
    // 				if (item.Fyear == element.Fyear && item.Fmonth == element.Fmonth && item.ParentIdRow === undefined) {
    // 					element.ParentIdRow = item.IdRow;
    // 				}
    // 			});
    // 		});
    // 		TCostElementsTBalConsSetValues.forEach((element: any) => {
    // 			let CostElementsTBalConsValues: any = [];
    // 			element.data.forEach((item: any) => {
    // 				CostElementsTBalConsValues.push(item.Value);
    // 			});
    // 			let totalCost = CostElementsTBalConsValues.reduce((x: any, y: any) => parseInt(x) + parseInt(y));
    // 			element.totalCost = parseInt(totalCost);
    // 		});
    // 		TCeCons.forEach((element: any) => {
    // 			this.dataWBsDetail.data.EsForecast.TCostElement.forEach((item: any) => {
    // 				if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && item.CeDetType === 'C') {
    // 					element.ParentIdRow = item.IdRow;
    // 				}
    // 			});
    // 		});
    // 		// console.log('TCeCons', TCeCons)
    // 		//  console.log('TCostElementsTBalConsSetValues', TCostElementsTBalConsSetValues)
    // 		this.dataWBsDetail.data.EsForecast.TCostElement.forEach((element: any) => {
    // 			TCostElementsTBalConsSetValues.forEach((item: any) => {
    // 				if (
    // 					element.Fyear === item.Fyear &&
    // 					element.Fmonth === item.Fmonth &&
    // 					element.Value === undefined &&
    // 					element.IdRow === item.ParentIdRow
    // 				) {
    // 					element.Value = item.totalCost;
    // 				}
    // 				if (element.Fyear === item.Fyear && element.Fmonth === item.Fmonth && element.IdRow === item.ParentIdRow) {
    // 					element.Value = parseInt(element.Value);
    // 					element.Value = item.totalCost;
    // 				}
    // 			});
    // 		});
    // 		TCeCons.forEach((element: any) => {
    // 			if (typeof element.Value === 'number') {
    // 				element.Value = element.Value.toFixed(2);
    // 				element.Value = element.Value.toString();
    // 			}
    // 		});
    // 		//console.log('TCeCons', TCeCons)
    // 		// console.log('this.dataWBsDetail.data.EsForecast.TCostElement 2', this.dataWBsDetail.data.EsForecast.TCostElement)
    // 	}
    //
    // 	let CostElements: any = [];
    // 	let checkTCostElementIdRow: any = [];
    // 	this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(function (
    // 		item: any
    // 	) {
    // 		return item.CeDetType !== 'G';
    // 	});
    // 	if (this.TCostElement !== []) {
    // 		this.TCostElement.forEach((element: any) => {
    // 			this.dataWBsDetail.data.EsForecast.TCostElement.push(element);
    // 		});
    // 	}
    // 	CostElements = this.dataWBsDetail.data.EsForecast.TCostElement;
    // 	if (CostElements !== []) {
    // 		CostElements.forEach((element: any) => {
    // 			if (element.IdRow !== undefined && element.IdRow !== null) {
    // 				checkTCostElementIdRow.push(parseInt(element.IdRow));
    // 			}
    // 		});
    // 		checkTCostElementIdRow.sort(function (a: any, b: any) {
    // 			return b - a;
    // 		});
    // 		let itemForIterationTCostElement: number = 0;
    // 		if (checkTCostElementIdRow.length !== 0) {
    // 			itemForIterationTCostElement = checkTCostElementIdRow[0];
    // 		}
    // 		CostElements.forEach((element: any) => {
    // 			if (element.IdRow === undefined || element.IdRow === null) {
    // 				itemForIterationTCostElement = itemForIterationTCostElement + 1;
    // 				element.IdRow = itemForIterationTCostElement;
    // 				if (element.IdRow.toString().length === 1) {
    // 					element.IdRow = '0' + '0' + element.IdRow;
    // 				}
    // 				if (element.IdRow.toString().length === 2) {
    // 					element.IdRow = '0' + element.IdRow;
    // 				}
    // 				if (element.IdRow.toString().length >= 3) {
    // 					element.IdRow = element.IdRow.toString();
    // 				}
    // 			}
    // 		});
    // 		let newArrayTCostElement: any = [];
    // 		CostElements.forEach((element: any) => {
    // 			newArrayTCostElement.push({
    // 				CeDetType: element.CeDetType,
    // 				CeInd: element.CeInd,
    // 				CostElement: element.CostElement,
    // 				DescrCe: element.DescrCe,
    // 				Fmonth: element.Fmonth,
    // 				Fyear: element.Fyear,
    // 				IdRow: element.IdRow,
    // 				Value: element.Value,
    // 			});
    // 		});
    // 		CostElements = [];
    // 		CostElements = newArrayTCostElement;
    // 		CostElements.forEach((element: any) => {
    // 			if (typeof element.Value === 'number') {
    // 				element.Value = element.Value.toFixed(2);
    // 				element.Value = element.Value.toString();
    // 			}
    // 		});
    // 	}
    // 	CostElements.forEach((element: any) => {
    // 		TCeEmpl.forEach((item: any) => {
    // 			if (
    // 				element.DescrCe === 'COSTO DEL PERSONALE' &&
    // 				element.Fyear === item.Fyear &&
    // 				element.Fmonth === item.Fmonth
    // 			) {
    // 				item.ParentIdRow = element.IdRow;
    // 			}
    // 		});
    // 	});
    // 	CostElements.forEach((element: any) => {
    // 		TCeCons.forEach((item: any) => {
    // 			if (element.DescrCe === 'CONSULENZE' && element.Fyear === item.Fyear && element.Fmonth === item.Fmonth) {
    // 				item.ParentIdRow = element.IdRow;
    // 			}
    // 		});
    // 	});
    // 	let costoPersonale = TCeEmpl.reduce((itemSearch: any, item: any) => {
    // 		const found = itemSearch.find(
    // 			(findItem: any) =>
    // 				findItem.Fyear === item.Fyear && findItem.Fmonth === item.Fmonth && findItem.ParentIdRow === item.ParentIdRow
    // 		);
    // 		if (!found) {
    // 			itemSearch.push({ Fyear: item.Fyear, Fmonth: item.Fmonth, ParentIdRow: item.ParentIdRow, data: [item] });
    // 		} else {
    // 			found.data.push(item);
    // 		}
    // 		return itemSearch;
    // 	}, []);
    // 	costoPersonale.forEach((element: any) => {
    // 		let CostElement: any = [];
    // 		element.data.forEach((item: any) => {
    // 			CostElement.push(item.Value);
    // 		});
    // 		let totalCost = CostElement.reduce((x: any, y: any) => parseInt(x) + parseInt(y));
    // 		element.totalCost = totalCost.toString();
    // 	});
    // 	// console.log('costoPersonale', costoPersonale)
    // 	CostElements.forEach((element: any) => {
    // 		costoPersonale.forEach((item: any) => {
    // 			if (element.IdRow === item.ParentIdRow && element.Fyear === item.Fyear && element.Fmonth === item.Fmonth) {
    // 				element.Value = item.totalCost;
    // 			}
    // 		});
    // 	});
    //
    // 	let consulenzeTecniche = TCeCons.reduce((itemSearch: any, item: any) => {
    // 		const found = itemSearch.find(
    // 			(findItem: any) =>
    // 				findItem.Fyear === item.Fyear && findItem.Fmonth === item.Fmonth && findItem.ParentIdRow === item.ParentIdRow
    // 		);
    // 		if (!found) {
    // 			itemSearch.push({ Fyear: item.Fyear, Fmonth: item.Fmonth, ParentIdRow: item.ParentIdRow, data: [item] });
    // 		} else {
    // 			found.data.push(item);
    // 		}
    // 		return itemSearch;
    // 	}, []);
    // 	consulenzeTecniche.forEach((element: any) => {
    // 		let CostElement: any = [];
    // 		element.data.forEach((item: any) => {
    // 			CostElement.push(item.Value);
    // 		});
    // 		let totalCost = CostElement.reduce((x: any, y: any) => parseInt(x) + parseInt(y));
    // 		element.totalCost = totalCost.toString();
    // 	});
    // 	// console.log('consulenzeTecniche', consulenzeTecniche)
    // 	CostElements.forEach((element: any) => {
    // 		consulenzeTecniche.forEach((item: any) => {
    // 			if (element.IdRow === item.ParentIdRow && element.Fyear === item.Fyear && element.Fmonth === item.Fmonth) {
    // 				element.Value = item.totalCost;
    // 			}
    // 		});
    // 	});
    //
    // 	let StartDate = this.dataWBsDetail.data.EsForecast.StartDate;
    // 	let EndDate = this.dataWBsDetail.data.EsForecast.EndDate;
    //
    // 	const data = {
    // 		IWbs: this.wbs,
    // 		IsForecast: {
    // 			StartDate: StartDate,
    // 			EndDate: EndDate,
    // 			TCostElement: CostElements,
    // 			TCeEmpl: TCeEmpl,
    // 			TCeCons: TCeCons,
    // 		},
    // 	};
    // 	this.wbsManagerService
    // 		// .getWbsChange(this.wbs, StartDate, EndDate, CostElements, TCeEmpl, TCeCons, null)
    // 		.getWbsChange(data)
    // 		.subscribe(response => {
    // 			this.notificationToastrService.showMessage(response);
    // 			this.disbaledInvia = false;
    // 			//  NUOVA RISPOSTA DB
    // 			this.wbsManagerService.getWBSDetail(this.wbs, this.isObject).subscribe((response: any) => {
    // 				this.dataWBsDetail = response;
    // 				// AGGIORNAENTO ARRAY TPERIO DOPO LA MODIFICA DELLE TABELLE
    // 				const EsForecastTCeTot = this.dataWBsDetail.data.EsForecast.TCeTot;
    // 				// CICLO CHE MI FA A PRENDERE L'ARRAY INTERESSATO DI TPerio
    //
    // 				for (let i = 0; i < EsForecastTCeTot.length; i++) {
    // 					for (let j = 0; j < EsForecastTCeTot[i].TPerio.length; j++) {
    // 						if (
    // 							parseInt(EsForecastTCeTot[i].TPerio[j].Fyear) == parseInt(this.dataWBsDetail.data.EsForecast.Fyear) &&
    // 							parseInt(EsForecastTCeTot[i].TPerio[j].Fmonth) >= parseInt(this.dataWBsDetail.data.EsForecast.Fmonth)
    // 						) {
    // 							for (let c = 0; c < this.informationsCards.length; c++) {
    // 								for (let t = 0; t < this.informationsCards[c].TPerio.length; t++) {
    // 									if (
    // 										this.informationsCards[c].TPerio[t].Fyear == EsForecastTCeTot[i].TPerio[j].Fyear &&
    // 										this.informationsCards[c].TPerio[t].Fmonth == EsForecastTCeTot[i].TPerio[j].Fmonth
    // 									) {
    // 										this.informationsCards[c].TPerio[t].Costs = EsForecastTCeTot[i].TPerio[j].Costs;
    // 										this.informationsCards[c].TPerio[t].Revenues = EsForecastTCeTot[i].TPerio[j].Revenues;
    // 										this.informationsCards[c].TPerio[t].Profitability = EsForecastTCeTot[i].TPerio[j].Profitability;
    // 										this.informationsCards[c].TPerio[t].type = 'blueCard';
    // 									}
    // 								}
    // 							}
    // 						} else if (
    // 							parseInt(EsForecastTCeTot[i].TPerio[j].Fyear) > parseInt(this.dataWBsDetail.data.EsForecast.Fyear)
    // 						) {
    // 							for (let c = 0; c < this.informationsCards.length; c++) {
    // 								for (let t = 0; t < this.informationsCards[c].TPerio.length; t++) {
    // 									if (
    // 										this.informationsCards[c].TPerio[t].Fyear == EsForecastTCeTot[i].TPerio[j].Fyear &&
    // 										this.informationsCards[c].TPerio[t].Fmonth == EsForecastTCeTot[i].TPerio[j].Fmonth
    // 									) {
    // 										this.informationsCards[c].TPerio[t].Costs = EsForecastTCeTot[i].TPerio[j].Costs;
    // 										this.informationsCards[c].TPerio[t].Revenues = EsForecastTCeTot[i].TPerio[j].Revenues;
    // 										this.informationsCards[c].TPerio[t].Profitability = EsForecastTCeTot[i].TPerio[j].Profitability;
    // 										this.informationsCards[c].TPerio[t].type = 'blueCard';
    // 									}
    // 								}
    // 							}
    // 						}
    // 					}
    // 				}
    //
    // 				// confrontiamo il vecchio TCeEmpl con il nuovo così da vedere dove modificare i suoi valori
    // 				this.wbsManagerService.passDataToAcr(response);
    //
    // 				this.wbsManagerService.getWbsPrcstGetlist().subscribe(response => {
    // 					this.EtPrcstList = response;
    // 				});
    //
    // 				this.wbsManagerService.getWbsSupplGetlist().subscribe(response => {
    // 					this.EtSupplList = response;
    // 				});
    // 				this.wbsManagerService.getWbsCeGetList(this.wbs).subscribe(response => {
    // 					this.WbsCe = response;
    // 					this.WbsCe.data.EtCeList = this.WbsCe.data.EtCeList.filter(function (item: any) {
    // 						return item.CeDetType === 'G';
    // 					});
    // 				});
    // 			});
    // 		});
    // 	// FUNZIONE PER IL PASSAGGIO DA UN BLUE FORECAST A UNA CARD TRATTEGIATA
    // 	// ASPETTARE MOFICHE BACK END
    // 	this.blue_to_dash();
    // 	// salvataggio compiuto
    // }

    prepareDataToSave(): any {
        this.storageService.secureStorage.setItem('change_forecast', 'false');
        // FUNZIONE CHE RIPOTA TUTTI I VALORI DEGLI ARRAY CON IL PUNTINO PER SEPRARLI DAI DECIMALI
        this.tableDataPoint();
        // ARROTONDAMENTO DEI VALORI DELLA TABELLA
        this.rounted();

        let TCostElement: any = [];
        for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
            if (this.dataWBsDetail.data.EsForecast.TCostElement[i].CeDetType == 'G') {
                TCostElement.push(this.dataWBsDetail.data.EsForecast.TCostElement[i]);
            }
        }

        let TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl;
        let TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons;

        let IsBalanceObj: any = [];

        this.dataWBsDetail.data.EsBalance.TBalCe.forEach((item: any) => {
            if ((item.Fmonth !== this.cons_sel_mese || item.Fyear !== this.cons_sel_anno) &&
                (item.ManInd === 'X' || item.AutoInd === 'X')) {
                // const objectToPush = { ...item, Value: item.Value.replace(/[^\d,-]/g, '').replace(/,/g, '.') }
                const objectToPush = {

                    Fyear: item.Fyear,
                    Fmonth: item.Fmonth,
                    IdRow: item.IdRow,
                    CostElement: item.CostElement,
                    Description: item.Description,
                    Value: item.ValueMan, // valore modifcato manulamente
                    ManInd: item.ManInd,
                    AutoInd: item.AutoInd
                };

                IsBalanceObj.push(objectToPush);
            }
        });

        this.TBalCe.forEach(({data}: any) => {
            if (data[0].ManInd === 'X' || data[0].AutoInd === 'X') {
                const objectToPush = {
                    Fyear: data[0].Fyear,
                    Fmonth: data[0].Fmonth,
                    IdRow: data[0].IdRow,
                    CostElement: data[0].CostElement,
                    Description: data[0].Description,
                    Value: data[0].ValueMan, // valore modifcato manulamente
                    ManInd: data[0].ManInd,
                    AutoInd: data[0].AutoInd
                };

                IsBalanceObj.push(objectToPush);
            }
        })

        const data = {
            IWbs: this.wbs,
            IsForecast: {
                StartDate: this.dataWBsDetail.data.EsForecast.StartDate,
                EndDate: this.dataWBsDetail.data.EsForecast.EndDate,
                TCostElement: TCostElement,
                TCeEmpl: TCeEmpl,
                TCeCons: TCeCons,
            },
            IsBalance: {
                TCostElement: IsBalanceObj,
                TCeProf: this.dataWBsDetail.data.EsBalance.TBalProf,
            },
            IsProfCtr: this.dataWBsDetail.data.EsProfCtr,
        };

        return data;
    }

    invia() {
        let dateNull = this.date_null();
        // CONTROLLO
        // SE dateNull == true : tutte le righe sono state avvalorate e può fare il salvataggio
        // SE dateNull == false : ci sono righe ch non sono state avvalorate e non si può salvare
        if (!dateNull) {
            const save_null = {};
            const modalRef = this.modalService.open(ModalComponent);
            modalRef.componentInstance.save_null = save_null;
            return;
        }

        const data = this.prepareDataToSave();

        this.wbsManagerService.getWbsChange(data).subscribe(response => {
            this.disbaledInvia = false;
            this.notificationToastrService.showMessage(response);
            // invio dati
            this.wbsManagerService.getWbsRelease(this.wbs).subscribe(response => {
                this.notificationToastrService.showMessage(response);
                this.disbaledInvia = true;
                window.location.reload();
            });
        });
    }

    hasPlanning(): boolean{
        let fromCurrentYear: any = this.informationsCards.filter(
            (year: any) => Number(year.Fyear) >= (new Date()).getFullYear()
        );
        let tPeriod: any = fromCurrentYear
            .flatMap((period: any) => Array.isArray(period.TPerio) ? period.TPerio : [])
            .filter((period: any) => period.type !== "consuntivo");

        let totalCosts: number = tPeriod
            .map((period: any) => Number(period?.Costs) || 0)
            .reduce((a: number, b: number) => a + b, 0);

        return totalCosts > 0;
    }

    comparerForecastCostoPer(otherArray: any) {
        return function (current: any) {
            return (
                otherArray.filter(function (other: any) {
                    return other.Fyear == current.Fyear && other.Fmonth == current.Fmonth;
                }).length == 0
            );
        };
    }

    checkForecastCostoPerForm(show: boolean) {
        if (this.costoPerForm.value.itemsCostoPer.length !== 0) {
            let onlyInA = this.dataWBsDetail.data.EsForecast.TCeEmpl.filter(
                this.comparerForecastCostoPer(this.costoPerForm.value.itemsCostoPer)
            );
            let onlyInB = this.costoPerForm.value.itemsCostoPer.filter(
                this.comparerForecastCostoPer(this.dataWBsDetail.data.EsForecast.TCeEmpl)
            );
            let result = [];
            result = onlyInA.concat(onlyInB);
            if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length < result.length) {
                this.dataWBsDetail.data.EsForecast.TCeEmpl = [];
                this.dataWBsDetail.data.EsForecast.TCeEmpl = result;
            }
            if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length > result.length) {
                this.dataWBsDetail.data.EsForecast.TCeEmpl = [];
                this.dataWBsDetail.data.EsForecast.TCeEmpl = result;
                this.costoPerForm.value.itemsCostoPer.map((item: any) => {
                    this.dataWBsDetail.data.EsForecast.TCeEmpl.push(item);
                });
            }
            this.costoPerForm.reset();
        }
        // else if (this.costoPerForm.value.itemsCostoPer.length == 0 && !show) {
        // 	for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeEmpl.length; i++) {
        // 		if (
        // 			this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fmonth == this.information_card_mese &&
        // 			this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fyear == this.information_card_anno
        // 		) {
        // 			for (let j = 0; j < this.dataWBsDetail.data.EsForecast.TCostElement.length; j++) {
        // 				if (
        // 					this.dataWBsDetail.data.EsForecast.TCostElement[j].Fmonth ==
        // 						this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fmonth &&
        // 					this.dataWBsDetail.data.EsForecast.TCostElement[j].Fyear ==
        // 						this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fyear &&
        // 					this.dataWBsDetail.data.EsForecast.TCostElement[j].CeDetType == 'E'
        // 				) {
        // 					this.dataWBsDetail.data.EsForecast.TCostElement.splice(j, 1);
        // 				}
        // 			}
        // 			this.dataWBsDetail.data.EsForecast.TCeEmpl.splice(i, 1);
        // 		}
        // 	}
        // 	// CANCELLAZIONE CON TUTOR (DA PROBLEMI)
        // 	//  this.dataWBsDetail.data.EsForecast.TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl.filter(
        // 	//     (item:any)=>{
        // 	//       return item.Fyear != this.information_card_anno && item.Fmonth != this.information_card_mese;
        // 	//     }
        // 	//   )
        // 	//   //il filter da fastidio
        // 	//   console.log(this.dataWBsDetail.data.EsForecast.TCostElement,'cancellazione costo personale PRIMA');
        // 	//   this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(
        // 	//     (item:any)=>{
        // 	//       return item.Fyear != this.information_card_anno && item.Fmonth != this.information_card_mese && item.CeDetType != 'E';
        // 	//     }
        // 	//   )
        // 	/*  console.log(this.dataWBsDetail.data.EsForecast.TCostElement,'cancellazione costo personale Dopo');*/
        // }
    }

    comparerConsulenzaTecnicaForm(otherArray: any) {
        return function (current: any) {
            return (
                otherArray.filter(function (other: any) {
                    return other.Fyear == current.Fyear && other.Fmonth == current.Fmonth;
                }).length == 0
            );
        };
    }

    checkConsulenzaTecnicaForm(show: boolean) {
        if (this.consulenzaTecnicaForm.value.itemsConsulenzaTecnica.length !== 0) {
            let onlyInA = this.dataWBsDetail.data.EsForecast.TCeCons.filter(
                this.comparerConsulenzaTecnicaForm(this.consulenzaTecnicaForm.value.itemsConsulenzaTecnica)
            );
            let onlyInB = this.consulenzaTecnicaForm.value.itemsConsulenzaTecnica.filter(
                this.comparerConsulenzaTecnicaForm(this.dataWBsDetail.data.EsForecast.TCeCons)
            );
            let result = [];
            result = onlyInA.concat(onlyInB);
            if (this.dataWBsDetail.data.EsForecast.TCeCons.length < result.length) {
                this.dataWBsDetail.data.EsForecast.TCeCons = [];
                this.dataWBsDetail.data.EsForecast.TCeCons = result;
            }
            if (this.dataWBsDetail.data.EsForecast.TCeCons.length > result.length) {
                this.dataWBsDetail.data.EsForecast.TCeCons = [];
                this.dataWBsDetail.data.EsForecast.TCeCons = result;
                this.consulenzaTecnicaForm.value.itemsConsulenzaTecnica.map((item: any) => {
                    this.dataWBsDetail.data.EsForecast.TCeCons.push(item);
                });
            }
            this.consulenzaTecnicaForm.reset();
        }
        // else if (this.consulenzaTecnicaForm.value.itemsConsulenzaTecnica.length == 0 && !show) {
        // 	for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeCons.length; i++) {
        // 		if (
        // 			this.dataWBsDetail.data.EsForecast.TCeCons[i].Fmonth == this.information_card_mese &&
        // 			this.dataWBsDetail.data.EsForecast.TCeCons[i].Fyear == this.information_card_anno
        // 		) {
        // 			for (let j = 0; j < this.dataWBsDetail.data.EsForecast.TCostElement.length; j++) {
        // 				if (
        // 					this.dataWBsDetail.data.EsForecast.TCostElement[j].Fmonth ==
        // 						this.dataWBsDetail.data.EsForecast.TCeCons[i].Fmonth &&
        // 					this.dataWBsDetail.data.EsForecast.TCostElement[j].Fyear ==
        // 						this.dataWBsDetail.data.EsForecast.TCeCons[i].Fyear &&
        // 					this.dataWBsDetail.data.EsForecast.TCostElement[j].CeDetType == 'C'
        // 				) {
        // 					this.dataWBsDetail.data.EsForecast.TCostElement.splice(j, 1);
        // 				}
        // 			}
        // 			this.dataWBsDetail.data.EsForecast.TCeCons.splice(i, 1);
        // 		}
        // 	}
        // 	// CANCELLAZIONE CON TUTOR ( DA PROBLEMI )
        // 	/*this.dataWBsDetail.data.EsForecast.TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons.filter(
        //     (item:any)=>{
        //       return item.Fyear != this.information_card_anno && item.Fmonth != this.information_card_mese;
        //     }
        //   )
        //   this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(
        //     (item:any)=>{
        //       return item.Fyear != this.information_card_anno && item.Fmonth != this.information_card_mese && item.CeDetType != 'C';
        //     }
        //   )*/
        // }
    }

    comparerVociDiCostoForm(otherArray: any) {
        return function (current: any) {
            return (
                otherArray.filter(function (other: any) {
                    return other.Fyear == current.Fyear && other.Fmonth == current.Fmonth;
                }).length == 0
            );
        };
    }

    checkVociDiCostoForm(show: boolean) {
        if (this.vociDiCostoForm.value.itemsVociDiCosto.length !== 0) {
            let onlyInA = this.TCostElement.filter(this.comparerVociDiCostoForm(this.vociDiCostoForm.value.itemsVociDiCosto));
            let onlyInB = this.vociDiCostoForm.value.itemsVociDiCosto.filter(this.comparerVociDiCostoForm(this.TCostElement));
            let result = [];
            result = onlyInA.concat(onlyInB);
            if (this.TCostElement.length < result.length) {
                this.TCostElement = [];
                this.TCostElement = result;
            }
            if (this.TCostElement.length > result.length) {
                this.TCostElement = [];
                this.TCostElement = result;
                this.vociDiCostoForm.value.itemsVociDiCosto.map((item: any) => {
                    this.TCostElement.push(item);
                });
            }
            this.vociDiCostoForm.reset();
        }
        // else if (this.vociDiCostoForm.value.itemsVociDiCosto.length == 0 && !show) {
        // 	for (let i = 0; i < this.TCostElement.length; i++) {
        // 		if (
        // 			this.TCostElement[i].Fmonth == this.information_card_mese &&
        // 			this.TCostElement[i].Fyear == this.information_card_anno &&
        // 			this.TCostElement[i].CeDetType == 'G'
        // 		) {
        // 			for (let j = 0; j < this.dataWBsDetail.data.EsForecast.TCostElement.length; j++) {
        // 				if (
        // 					this.dataWBsDetail.data.EsForecast.TCostElement[j].Fyear == this.TCostElement[i].Fyear &&
        // 					this.dataWBsDetail.data.EsForecast.TCostElement[j].Fmonth == this.TCostElement[i].Fmonth &&
        // 					this.dataWBsDetail.data.EsForecast.TCostElement[j].CeDetType == this.TCostElement[i].CeDetType
        // 				) {
        // 					this.dataWBsDetail.data.EsForecast.TCostElement.splice(j, 1);
        // 				}
        // 			}
        // 			this.TCostElement.splice(i, 1);
        // 		}
        // 	}
        // 	// CANCELLAZIONE CON TUTOR ( DA PROBLEMI )
        // 	/* this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(
        //     (item:any)=>{
        //         return item.Fyear != this.information_card_anno && item.Fmonth != this.information_card_mese ;
        //     }
        //   )
        //   this.TCostElement = this.TCostElement.filter(
        //     (item:any)=>{
        //       return  item.Fyear != this.information_card_anno && item.Fmonth != this.information_card_mese && item.CeDetType != 'G';
        //     }
        //   )
        //   this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(
        //     (item:any)=>{
        //         return item.Fyear != this.information_card_anno && item.Fmonth != this.information_card_mese && item.CeDetType != 'G';
        //     }
        //   )*/
        // }
    }

    // FUNZIONE CHE FA APPARIRE LE TABELLE DEL FORECAST
    public click_forecast(Tperio: any, show: boolean) {
        this.appare_tab_consuntivo = false;
        this.information_card_mese = Tperio.Fmonth;
        this.information_card_anno = Tperio.Fyear;
        /*this.checkForecastCostoPerForm(show);
    this.checkConsulenzaTecnicaForm(show);
    this.checkVociDiCostoForm(show);*/
        this.getDetailConsuntivo();
        this.getForecastDetail();
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl !== []) {
            this.TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl.filter(function (item: any) {
                return item.Fyear === Tperio.Fyear && item.Fmonth === Tperio.Fmonth;
            });
        }
        if (this.TCeEmpl !== []) {
            this.costoPerForm = this.formBuilder.group({
                itemsCostoPer: this.formBuilder.array(
                    this.TCeEmpl.map((item: any) =>
                        // this.formBuilder.group({
                        // 	attribute: [item.attribute],
                        // 	IdRow: [item.IdRow],
                        // 	Fyear: [Tperio.Fyear],
                        // 	Fmonth: [Tperio.Fmonth],
                        // 	CostProfile: [item.CostProfile],
                        // 	DailyCost: [item.DailyCost],
                        // 	Quantity: [item.Quantity],
                        // 	Value: [item.Value],
                        // 	Rate: [item.Rate],
                        // })
                        this.formBuilder.group({...item})
                    )
                ),
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons !== []) {
            this.CostoCunsulenza = this.dataWBsDetail.data.EsForecast.TCeCons.filter(function (item: any) {
                return item.Fyear === Tperio.Fyear && item.Fmonth === Tperio.Fmonth;
            });
        }
        if (this.CostoCunsulenza !== []) {
            this.consulenzaTecnicaForm = this.formBuilder.group({
                itemsConsulenzaTecnica: this.formBuilder.array(
                    this.CostoCunsulenza.map((item: any) =>
                        // this.formBuilder.group({
                        // 	attribute: [item.attribute],
                        // 	IdRow: [item.IdRow],
                        // 	Fyear: [Tperio.Fyear],
                        // 	Fmonth: [Tperio.Fmonth],
                        // 	DescSupplier: [item.DescSupplier],
                        // 	Supplier: [item.Supplier],
                        // 	DailyCost: [item.DailyCost],
                        // 	Quantity: [item.Quantity],
                        // 	Value: [item.Value],
                        // })
                        this.formBuilder.group({...item})
                    )
                ),
            });
        }
        if (this.TCostElement !== []) {
            this.EtCeList = this.TCostElement.filter(function (item: any) {
                return item.Fyear === Tperio.Fyear && item.Fmonth === Tperio.Fmonth;
            });
        }
        if (this.EtCeList !== []) {
            this.vociDiCostoForm = this.formBuilder.group({
                itemsVociDiCosto: this.formBuilder.array(
                    this.EtCeList.map((item: any) =>
                        // this.formBuilder.group({
                        // 	attribute: [item.attribute],
                        // 	IdRow: [item.IdRow],
                        // 	CeDetType: [item.CeDetType],
                        // 	CeInd: [item.CeInd],
                        // 	Fyear: [Tperio.Fyear],
                        // 	Fmonth: [Tperio.Fmonth],
                        // 	CostElement: [item.CostElement],
                        // 	DescrCe: [item.DescrCe],
                        // 	Value: [item.Value],
                        // })
                        this.formBuilder.group({...item})
                    )
                ),
            });
        }
        if (show) {
            this.appare_tab_forecast = true;
        }
        // FUNZIONE CHE METTA LA VIRGOLA AI VALORI NUMERICI DELLE TABELLE DEL FORECAST
        //this.tableDataComma();

        this.visualizzaTabellaTM = Tperio.ChangeInd && this.visualizzaTabellaTM ? true : false;
        this.mostraVdcModificabile = Tperio.ChangeInd && this.mostraVdcModificabile ? true : false;

    }

    // FUNZIONE PER IL PASSAGGIO DA UN BLUE FORECAST A UNA CARD TRATTEGIATA
    // ASPETTARE MOFICHE BACK END
    blue_to_dash() {
        let controll = false;
        for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
            if (
                this.dataWBsDetail.data.EsForecast.TCostElement[i].Fmonth == this.information_card_mese &&
                this.dataWBsDetail.data.EsForecast.TCostElement[i].Fyear == this.information_card_anno
            ) {
                controll = true;
            }
            if (controll == false) {
                for (let i = 0; i < this.TPerio.length; i++) {
                    if (
                        this.information_card_anno == this.TPerio[i].Fyear &&
                        this.information_card_mese == this.TPerio[i].Fmonth
                    ) {
                        this.TPerio[i].type = 'dash';
                    }
                }
            }
        }
    }

    change_forecast_modal() {
        this.storageService.secureStorage.setItem('change_forecast', 'false');
    }

    // CAMBIO DINAMICAMENTE IL COSTO DELLA CARD
    sommaAll_Importo() {
        let somma_float: any = 0;

        if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
            for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeEmpl.length; i++) {
                if (
                    this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fyear == this.information_card_anno &&
                    this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fmonth == this.information_card_mese
                ) {
                    let value = this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Value;
                    somma_float = parseFloat(value) + somma_float;
                }
            }
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
            for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeCons.length; i++) {
                if (
                    this.dataWBsDetail.data.EsForecast.TCeCons[i].Fyear == this.information_card_anno &&
                    this.dataWBsDetail.data.EsForecast.TCeCons[i].Fmonth == this.information_card_mese
                ) {
                    let value = this.dataWBsDetail.data.EsForecast.TCeCons[i].Value.replace(',', '.');
                    somma_float = parseFloat(value) + somma_float;
                }
            }
        }
        if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
            for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
                if (
                    this.dataWBsDetail.data.EsForecast.TCostElement[i].Fyear == this.information_card_anno &&
                    this.dataWBsDetail.data.EsForecast.TCostElement[i].Fmonth == this.information_card_mese &&
                    this.dataWBsDetail.data.EsForecast.TCostElement[i].CeDetType == 'G' &&
                    this.dataWBsDetail.data.EsForecast.TCostElement[i].CeInd == 'C'
                ) {
                    let value = this.dataWBsDetail.data.EsForecast.TCostElement[i].Value.replace(',', '.');
                    somma_float = parseFloat(value) + somma_float;
                }
            }
        }

        somma_float = Math.round((somma_float + Number.EPSILON) * 100) / 100;
        for (let i = 0; i < this.informationsCards.length; i++) {
            for (let j = 0; j < this.informationsCards[i].TPerio.length; j++) {
                if (
                    this.informationsCards[i].TPerio[j].Fyear == this.information_card_anno &&
                    this.informationsCards[i].TPerio[j].Fmonth == this.information_card_mese
                ) {
                    this.informationsCards[i].TPerio[j].Costs = somma_float.toString();
                }
            }
        }
    }

    // QUANDO INSERISCO UN VALORE IN UNA CARD DASH ME LO TRASFORMA IN BLUE
    dash_to_forecast() {
        for (let i = 0; i < this.informationsCards.length; i++) {
            for (let j = 0; j < this.informationsCards[i].TPerio.length; j++) {
                if (
                    this.informationsCards[i].TPerio[j].Fyear == this.information_card_anno &&
                    this.informationsCards[i].TPerio[j].Fmonth == this.information_card_mese
                ) {
                    if (this.informationsCards[i].TPerio[j].type !== 'blueCard') {
                        this.informationsCards[i].TPerio[j].Costs = '0';
                        this.informationsCards[i].TPerio[j].Revenues = '0'; // costi
                        this.informationsCards[i].TPerio[j].Profitability = '0'; // Margini
                        this.informationsCards[i].TPerio[j].type = 'blueCard';
                    }
                }
            }
        }
    }

    // QUANDO ELIMINO L'ULITMO VALORE PER QUEL FORECAST E LA CARD RITORNA DASH
    forecast_to_dash() {
        let controllo_TCeEmpl: boolean = false;
        let controllo_TCeCons: boolean = false;
        let controllo_TCostElement: boolean = false;
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
            for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeEmpl.length; i++) {
                if (
                    this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fyear == this.information_card_anno &&
                    this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fmonth == this.information_card_mese
                ) {
                    controllo_TCeEmpl = true;
                }
            }
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
            for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeCons.length; i++) {
                if (
                    this.dataWBsDetail.data.EsForecast.TCeCons[i].Fyear == this.information_card_anno &&
                    this.dataWBsDetail.data.EsForecast.TCeCons[i].Fmonth == this.information_card_mese
                ) {
                    controllo_TCeCons = true;
                }
            }
        }
        if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
            for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
                if (
                    this.dataWBsDetail.data.EsForecast.TCostElement[i].Fyear == this.information_card_anno &&
                    this.dataWBsDetail.data.EsForecast.TCostElement[i].Fmonth == this.information_card_mese &&
                    this.dataWBsDetail.data.EsForecast.TCostElement[i].CeDetType == 'G'
                ) {
                    controllo_TCostElement = true;
                }
            }
        }
        if (controllo_TCeEmpl == false && controllo_TCeCons == false && controllo_TCostElement == false) {
            for (let i = 0; i < this.informationsCards.length; i++) {
                for (let j = 0; j < this.informationsCards[i].TPerio.length; j++) {
                    if (
                        this.informationsCards[i].TPerio[j].Fyear == this.information_card_anno &&
                        this.informationsCards[i].TPerio[j].Fmonth == this.information_card_mese
                    ) {
                        this.informationsCards[i].TPerio[j].Costs = '0';
                        this.informationsCards[i].TPerio[j].Revenues = '0';
                        this.informationsCards[i].TPerio[j].Profitability = '0';
                        this.informationsCards[i].TPerio[j].type = 'dash';
                    }
                }
            }
        }
    }

    /**
     * Setta lo stile della card a 'dash' (vuoto) o 'blueCard' (forecast).<br>
     * E' usato principalmente per cambiare lo stile 'al volo' quando viene fatta una modifica (prima del salva).
     * @param toDash true -> dash, false -> forecast
     */
    toDashOrForecast(toDash = true) {
        let data = {Costs: '0', Revenues: '0', Profitability: '0', type: toDash ? 'dash' : 'blueCard'}
        let i = -1, j = -1;

        // trova gli indici della card in questione
        i = this.informationsCards.findIndex((elem: any) => this.information_card_anno == elem.Fyear);
        if (i > -1) j = this.informationsCards[i].TPerio.findIndex((card: any) => this.information_card_mese == card.Fmonth);

        // controlli
        if (toDash) {
            // se ha almeno un valore in una delle tre sezioni, rimane blueCard (forecast)
            if (this.checkCosts()) return;
        } else {
            // se è già blueCard (forecast), rimane forecast così non sovrascrivo i valori
            if (this.informationsCards[i].TPerio[j].type == 'blueCard') return;
        }

        // se sono arrivato qua
        // - toDash true, era forecast, non ha più righe, diventa dash
        // - toDash false, era dash, sono state aggiunti costi/ricavi, diventa blueCard
        if (i != -1 && j != -1)
            this.informationsCards[i].TPerio[j] = {...this.informationsCards[i].TPerio[j], ...data};
    }

    /**
     * Assegna lo stile alla singola card (consuntivo, blueCard, dash).
     * @param year anno della card
     * @param month mese della card
     * @param iYear (opzionale) indice della posizione in informationsCards
     * @param iMonth (opzionale) indice della posizione in informationsCard[iYear].TPerio
     */
    setStyleCard(year: number, month: number, iYear?: number, iMonth?: number) {
        // o prendi questi come punto di riferimento i information card year e month
        let currYear = parseInt(this.dataWBsDetail.data.EsForecast.Fyear);
        let currMonth = parseInt(this.dataWBsDetail.data.EsForecast.Fmonth);

        // indici anno e mese
        let inYear = iYear !== -1 ? iYear : this.informationsCards.findIndex((elem: any) => parseInt(elem.Fyear) === year);
        let inMonth = iMonth !== -1 ? iMonth : this.informationsCards[inYear].findIndex((elem: any) => parseInt(elem.TPerio.Fmonth) === month)

        if (year < currYear || (year === currYear && month < currMonth)) {
            // if (this.informationsCards[inYear].TPerio[inMonth].RevFc === 'X')
            // 	this.informationsCards[inYear].TPerio[inMonth].type = 'RevFc';
            // else
            this.informationsCards[inYear].TPerio[inMonth].type = 'consuntivo';
        } else if (year > currYear || (year === currYear && month >= currMonth)) {
            if (this.checkCosts(year, month)) //se riporta true, ha qualche valore quindi .costs != 0
                this.informationsCards[inYear].TPerio[inMonth].type = 'blueCard';
            else
                this.informationsCards[inYear].TPerio[inMonth].type = 'dash';
        }
    }

    /**
     * Assegna lo stile alle card (consuntivo, blueCard, dash).
     * @param year (opzionale) prende solo le card dell'anno specificato.
     */
    setAllStyleCards(year: number = -1) {
        if (year > -1) {
            let index = this.informationsCards.findIndex((elem: any) => parseInt(elem.Fyear) === year);
            this.informationsCards[index].forEach((elem: any) =>
                elem.TPerio.forEach((card: any, i: number) => this.setStyleCard(year, parseInt(card.Fmonth), index, i)));

            this.informationsCards[index].forEach((element: any) => {
                element.TPerio.sort(function (a: any, b: any) {
                    return parseInt(a.Fmonth) - parseInt(b.Fmonth);
                });
            });
        } else {
            this.informationsCards.forEach((elem: any, index: number) =>
                elem.TPerio.forEach((card: any, i: number) => this.setStyleCard(parseInt(elem.Fyear), parseInt(card.Fmonth), index, i)))

            this.informationsCards.forEach((element: any) => {
                element.TPerio.sort(function (a: any, b: any) {
                    return parseInt(a.Fmonth) - parseInt(b.Fmonth);
                });
            });
        }
    }

    /**
     * Controlla se nella singola card è presente almeno una riga di costo/ricavi
     * @param year (opzionale - default: anno selezionato)
     * @param month (opzionale - default: mese selezionato)
     */
    checkCosts(year: number = this.information_card_anno, month: number = this.information_card_mese) {
        let cTCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl?.some((item: any) => item.Fyear == year && item.Fmonth == month)
        let cTCeCons = this.dataWBsDetail.data.EsForecast.TCeCons?.some((item: any) => item.Fyear == year && item.Fmonth == month)
        let cTCostElement = this.dataWBsDetail.data.EsForecast.TCostElement?.some((item: any) => item.Fyear == year && item.Fmonth == month && item.CeDetType == 'G')

        //Se non ci sono valori, sto per passare allo stile della card "grigio"
        return cTCeEmpl || cTCeCons || cTCostElement;
    }

    truncateStringNumberDecimal(val: any, splitSymbol: string) {
        const split = val.split(splitSymbol);

        if (split[1]) {
            const decimalTruncate = split[1].substring(0, 2);
            return split[0] + splitSymbol + decimalTruncate;
        }

        return split[0];
    }

    public errore: boolean = false;

    // FUNZIONE SALVATAGGIO IN SESSIONE DEL MIO DATAWBSDATAIL
    session_dataWBsDetail(changed: string = 'true') {
        this.storageService.secureStorage.setItem('change_forecast', changed);
        this.storageService.secureStorage.setItem('dataWBsDetail', JSON.stringify(this.dataWBsDetail));
        this.storageService.secureStorage.setItem('informationCards', JSON.stringify(this.informationsCards));
    }

    //------------------------------ TABELLA COSTO DEL PERSONALE ------------------------------
    noteCstPer(note: any, index: number, TBalCe: any = null) {
        const writteNote = note.target.value;

        if (TBalCe) {
            const indexOfElement = this.searchIndexOfManInd(TBalCe);
            this.dataWBsDetail.data.EsBalance.TBalCe[indexOfElement].Description = writteNote;
        } else {
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].Description = writteNote;
            this.session_dataWBsDetail();
        }
    }

    noteVdc(event: any, TBalCe: any) {
        TBalCe.Description = event.target.value;
    }

    prfl_cst_fn() {
        for (let i = 0; i < this.EtPrcstList?.data?.EtPrcstList?.length; i++) {
            this.prfl_cst.push(this.EtPrcstList.data.EtPrcstList[i].CostProfile);
        }
        let unique_array: any = [];
        unique_array = this.prfl_cst;
        this.prfl_cst = unique_array.filter(function (ele: any, pos: any) {
            return unique_array.indexOf(ele) == pos;
        });
    }

    prfl_cst_selected(event: any, index: number) {
        // Cambio errore e lo do abbuono io come giusto
        this.dataWBsDetail.data.EsForecast.TCeEmpl[index].errorDailyCost = false;
        this.dataWBsDetail.data.EsForecast.TCeEmpl[index].CostProfile = event;
        for (let i = 0; i < this.EtPrcstList?.data?.EtPrcstList?.length; i++) {
            if (
                this.EtPrcstList.data.EtPrcstList[i].CostProfile ==
                this.dataWBsDetail.data.EsForecast.TCeEmpl[index].CostProfile
            ) {
                this.dataWBsDetail.data.EsForecast.TCeEmpl[index].DailyCost = this.EtPrcstList.data.EtPrcstList[i].DailyCost;
            }
        }
        this.costoPer_calcoloImporto(index);
        this.sommaAll_Importo();
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    costoPer_DailyCost(event: any, index: number) {
        let val = event.target.value.replaceAll('.', '').replaceAll(',', '.');
        let errore = checkInputNumber(event);
        if (errore == false) {
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].errorDailyCost = false;
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].DailyCost = val;
            this.costoPer_calcoloImporto(index);
            this.sommaAll_Importo();
            this.session_dataWBsDetail();
            // DETT
            this.dettaglioEsercizo();
        } else {
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].errorDailyCost = true;
        }
    }

    costoPer_Qunatity(event: any, index: number) {
        let val = event.target.value.replaceAll('.', '').replaceAll(',', '.');
        let errore = checkInputNumber(event);
        if (errore == false) {
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].errorQuantity = false;
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].Quantity = val;
            this.costoPer_calcoloImporto(index);
            this.sommaAll_Importo();
            this.session_dataWBsDetail();
            // DETT
            this.dettaglioEsercizo();
        } else {
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].errorQuantity = true;
        }
    }

    costoPer_Value(event: any, index: number) {
        let val = event.target.value.replaceAll('.', '').replaceAll(',', '.');
        let errore = checkInputNumber(event);
        if (errore == false) {
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].errorValue = false;
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].Value = val;
            this.sommaAll_Importo();
            this.session_dataWBsDetail();
            // DETT
            this.dettaglioEsercizo();
        } else {
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].errorValue = true;
        }
    }

    costoPer_calcoloImporto(index: number) {
        this.dataWBsDetail.data.EsForecast.TCeEmpl[index].errorValue = false;
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl[index].Quantity == '') {
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].Quantity = '0';
        }
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl[index].DailyCost == '') {
            this.dataWBsDetail.data.EsForecast.TCeEmpl[index].DailyCost = '0';
        }
        let DailyCost = this.dataWBsDetail.data.EsForecast.TCeEmpl[index].DailyCost.replace(',', '.');
        let Quantity = this.dataWBsDetail.data.EsForecast.TCeEmpl[index].Quantity.replace(',', '.');
        let value = parseFloat(Quantity) * parseFloat(DailyCost);
        value = Math.round((value + Number.EPSILON) * 100) / 100;
        this.dataWBsDetail.data.EsForecast.TCeEmpl[index].Value = value.toString();
        //this.dataWBsDetail.data.EsForecast.TCeEmpl[index].Value = this.dataWBsDetail.data.EsForecast.TCeEmpl[index].Value.replace('.', ',');
    }

    splice_CostoPer(index: number) {
        this.dataWBsDetail.data.EsForecast.TCeEmpl.splice(index, 1);
        this.sommaAll_Importo();
        // this.forecast_to_dash();
        this.toDashOrForecast(true);
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    cstPer_push() {
        // array profilo di costo della tabella costo del personale
        this.prfl_cst_fn();
        this.dataWBsDetail.data.EsForecast.TCeEmpl.push({
            CostProfile: null,
            DailyCost: '0',
            Fmonth: this.information_card_mese,
            Fyear: this.information_card_anno,
            IdRow: '000',
            ParentIdRow: '000',
            Quantity: '0',
            Value: '0',
            attribute: 'formItem',
            errorValue: false,
            errorDailyCost: false,
            errorQuantity: false,
            Rate: '',
            RateId: '',
            Profile: '',
            ProfileId: '',
        });
        // this.dash_to_forecast();
        this.toDashOrForecast(false);
        this.sommaAll_Importo();
        // FUNZIONE CHE INSERISCE IL COLORE DEL PALLINO ACCANTO AL MESE
        this.profitability_circle();
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    //---------------------------  TABELLA CONSULENZA TECNICA -------------------------

    forn_fnct() {
        for (let i = 0; i < this.EtSupplList?.data?.EtSupplList?.length; i++) {
            this.frn.push(this.EtSupplList.data.EtSupplList[i].DescrSupplier);
        }
        let unique_array: any = [];
        unique_array = this.frn;
        this.frn = unique_array.filter(function (ele: any, pos: any) {
            return unique_array.indexOf(ele) == pos;
        });
    }

    // FUNZIONE CHE MI RIESCE A INSERIRE ALTRE VOCI NELLA NG-SELECT
    noteConsTec(note: any, index: number) {
        this.dataWBsDetail.data.EsForecast.TCeCons[index].Description = note.target.value;
        this.session_dataWBsDetail();
    }

    name = '';

    addTag(name: any) {
        return name;
    }

    cons_descSupp(event: any, index: number) {
        console.log(event);
        this.dataWBsDetail.data.EsForecast.TCeCons[index].DescSupplier = event;
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    cons_DailyCost(event: any, index: number) {
        let val = event.target.value.replaceAll('.', '').replaceAll(',', '.');
        let errore = checkInputNumber(event);
        if (errore == false) {
            this.dataWBsDetail.data.EsForecast.TCeCons[index].errorDailyCost = false;
            this.dataWBsDetail.data.EsForecast.TCeCons[index].DailyCost = val;
            this.cons_calcoloImporto(index);
            this.sommaAll_Importo();
            this.session_dataWBsDetail();
            // DETT
            this.dettaglioEsercizo();
        } else {
            this.dataWBsDetail.data.EsForecast.TCeCons[index].errorDailyCost = true;
        }
    }

    cons_Quantity(event: any, index: number) {
        let val = event.target.value.replaceAll('.', '').replaceAll(',', '.');
        let errore = checkInputNumber(event);
        if (errore == false) {
            this.dataWBsDetail.data.EsForecast.TCeCons[index].errorQuantity = false;
            this.dataWBsDetail.data.EsForecast.TCeCons[index].Quantity = val;
            this.cons_calcoloImporto(index);
            this.sommaAll_Importo();
            this.session_dataWBsDetail();
            // DETT
            this.dettaglioEsercizo();
        } else {
            this.dataWBsDetail.data.EsForecast.TCeCons[index].errorQuantity = true;
        }
    }

    cons_Value(event: any, index: number) {
        let val = event.target.value.replaceAll('.', '').replaceAll(',', '.');
        let errore = checkInputNumber(event);
        if (errore == false) {
            this.dataWBsDetail.data.EsForecast.TCeCons[index].errorValue = false;
            this.dataWBsDetail.data.EsForecast.TCeCons[index].Value = val;
            this.sommaAll_Importo();
            this.session_dataWBsDetail();
            // DETT
            this.dettaglioEsercizo();
        } else {
            this.dataWBsDetail.data.EsForecast.TCeCons[index].errorValue = true;
        }
    }

    cons_calcoloImporto(index: number) {
        this.dataWBsDetail.data.EsForecast.TCeCons[index].errorValue = false;
        if (this.dataWBsDetail.data.EsForecast.TCeCons[index].Quantity == '') {
            this.dataWBsDetail.data.EsForecast.TCeCons[index].Quantity = '0';
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons[index].DailyCost == '') {
            this.dataWBsDetail.data.EsForecast.TCeCons[index].DailyCost = '0';
        }
        let DailyCost = this.dataWBsDetail.data.EsForecast.TCeCons[index].DailyCost.replace(',', '.');
        let Quantity = this.dataWBsDetail.data.EsForecast.TCeCons[index].Quantity.replace(',', '.');
        let value = parseFloat(DailyCost) * parseFloat(Quantity);
        value = Math.round((value + Number.EPSILON) * 100) / 100;
        this.dataWBsDetail.data.EsForecast.TCeCons[index].Value = value.toString();
        //this.dataWBsDetail.data.EsForecast.TCeCons[index].Value = this.dataWBsDetail.data.EsForecast.TCeCons[index].Value.replace('.', ',');
    }

    splice_Cons(index: number) {
        this.dataWBsDetail.data.EsForecast.TCeCons.splice(index, 1);
        this.sommaAll_Importo();
        // this.forecast_to_dash();
        this.toDashOrForecast(true);
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    consTec_push() {
        // valorizzazione ng select fornitore
        this.forn_fnct();
        this.dataWBsDetail.data.EsForecast.TCeCons.push({
            DailyCost: '0',
            DescSupplier: null,
            Fmonth: this.information_card_mese,
            Fyear: this.information_card_anno,
            IdRow: '000',
            ParentIdRow: '000',
            Quantity: '0',
            Supplier: '',
            Value: '0',
            attribute: 'formItem',
            errorValue: false,
            errorDailyCost: false,
            errorQuantity: false,
        });
        // this.dash_to_forecast();
        this.toDashOrForecast(false);
        this.sommaAll_Importo();
        // FUNZIONE CHE INSERISCE IL COLORE DEL PALLINO ACCANTO AL MESE
        this.profitability_circle();
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    //---------------------------------- TABELLA VOCI DI COSTO ---------------------
    noteVociCst(note: any, index: number) {
        this.dataWBsDetail.data.EsForecast.TCostElement[index].Description = note.target.value;
        this.session_dataWBsDetail();
    }

    dt_fnt() {
        for (let i = 0; i < this.WbsCe?.data?.EtCeList?.length; i++) {
            this.dt.push(this.WbsCe.data.EtCeList[i].DescrCe);
        }
        let unique_array: any = [];
        unique_array = this.dt;
        this.dt = unique_array.filter(function (ele: any, pos: any) {
            return unique_array.indexOf(ele) == pos;
        });
    }

    vcCost_DescrCe(event: any, index: number) {
        this.dataWBsDetail.data.EsForecast.TCostElement[index].DescrCe = event;
        for (let i = 0; i < this.WbsCe?.data?.EtCeList?.length; i++) {
            if (this.dataWBsDetail.data.EsForecast.TCostElement[index].DescrCe == this.WbsCe.data.EtCeList[i].DescrCe) {
                this.dataWBsDetail.data.EsForecast.TCostElement[index].CostElement = this.WbsCe.data.EtCeList[i].CostElement;
                this.dataWBsDetail.data.EsForecast.TCostElement[index].CeInd = this.WbsCe.data.EtCeList[i].CeInd;
            }
        }
        this.sommaAll_Importo();
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    vcCost_Value(event: any, index: number) {
        let val = event.target.value.replaceAll('.', '').replaceAll(',', '.');
        let errore = checkInputNumber(event);
        if (errore == false) {
            this.dataWBsDetail.data.EsForecast.TCostElement[index].errorValue = false;
            if (event.target.value == '') {
                this.dataWBsDetail.data.EsForecast.TCostElement[index].Value = '0';
            } else {
                this.dataWBsDetail.data.EsForecast.TCostElement[index].Value = val;
            }
            this.sommaAll_Importo();
            this.session_dataWBsDetail();
            // DETT
            this.dettaglioEsercizo();
        } else {
            this.dataWBsDetail.data.EsForecast.TCostElement[index].errorValue = true;
        }
    }

    splice_vcCost(index: number) {
        this.dataWBsDetail.data.EsForecast.TCostElement.splice(index, 1);
        this.sommaAll_Importo();
        // this.forecast_to_dash();
        this.toDashOrForecast(true);
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    vcCost_push() {
        // valorizzazione ng select dettaglio
        this.dt_fnt();
        this.dataWBsDetail.data.EsForecast.TCostElement.push({
            CeDetType: 'G',
            CeInd: 'C',
            CostElement: null,
            DescrCe: null,
            Fmonth: this.information_card_mese,
            Fyear: this.information_card_anno,
            IdRow: '000',
            Value: '0',
            attribute: 'formItem',
            errorValue: false,
        });
        // this.dash_to_forecast();
        this.toDashOrForecast(false);
        this.sommaAll_Importo();
        // FUNZIONE CHE INSERISCE IL COLORE DEL PALLINO ACCANTO AL MESE
        this.profitability_circle();
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    //-------------------------------- FUNZIONE CHE TROVA DATI UGUALI A 0 O NULL------------------------------
    date_null() {
        // ATTENZIONE - Il controllo avviene su tutti i mesi, non solo su quello selezionato
        let checkErrorTCeEmpl: boolean = true;
        let checkErrorTCeCons: boolean = true;
        let checkErrorTCostElement: boolean = true;
        let checkTCeEmpl: boolean = true;
        let checkTCeCons: boolean = true;
        let checkTCostElement: boolean = true;
        let checkErrorTBalProf: boolean = true;

        this.dataWBsDetail.data.EsForecast.TCeEmpl?.forEach((element: any) => {
            //|| element.CostProfile == null
            if (!this.checkIfIsPositiveNumber(element.Value)) {
                if (element.CostProfile !== 'TEAM' ||
                    (element.CostProfile === 'TEAM' && !this.checkIfIsPositiveNumber(element.Quantity * element.Rate))
                ) {
                    checkTCeEmpl = false;
                    console.log('non salvare TCeEmpl');
                }
            }
            if (element.errorValue == true || element.errorQuantity == true || element.errorDailyCost == true) {
                checkErrorTCeEmpl = false;
            }
        });

        this.dataWBsDetail.data.EsForecast.TCeCons?.forEach((element: any) => {
            //|| element.DescSupplier == null
            if (!this.checkIfIsNumberNotZero(element.Value) && !this.checkIfIsPositiveNumber(element.Quantity * element.Rate)) {
                checkTCeCons = false;
                console.log('non salvare TCeCons', element);
            }
            if (element.errorValue == true || element.errorQuantity == true || element.errorDailyCost == true) {
                checkErrorTCeCons = false;
            }
        });

        this.dataWBsDetail.data.EsForecast.TCostElement?.filter((elem: any) => elem.AutoInd !== 'X')?.forEach((element: any) => {
            // I ricavi possono essere >= 0
            if ((!this.checkIfIsPositiveNumber(element.Value, true) && element.CeDetType == 'G' && element.CeInd == 'R') ||
                // I costi devono essere > 0
                (!this.checkIfIsPositiveNumber(element.Value) && element.CeDetType == 'G' && element.CeInd == 'C')) {
                checkTCostElement = false;
                console.log('non salvare TCostElement');
            }
            if (element.errorValue == true) {
                checkTCostElement = false;
            }
        });

        this.dataWBsDetail.data.EsBalance.TBalProf?.forEach((element: any) => {
            // controllo che abbiano un valore il: profilo, importo (value) e gg (quantity - se il profile non è "altro")
            if (
                !element.ProfileId // ||
                // !this.checkIfIsPositiveNumber(element.Value) ||
                // (element.Profile.toLowerCase() !== 'altro' && !this.checkIfIsPositiveNumber(element.Quantity))
            ) {
                checkErrorTBalProf = false;
            }
        });

        return (
            checkTCeEmpl &&
            checkTCeCons &&
            checkTCostElement &&
            checkErrorTCeEmpl &&
            checkErrorTCeCons &&
            checkErrorTCostElement &&
            checkErrorTBalProf
        );
    }

    //-------------------------------- FUNZIONE SALVA DEL FORECAST -------------------------
    salva_forecast() {
        let dateNull = this.date_null();
        // CONTROLLO
        // SE dateNull == true : tutte le righe sono state avvalorate e può fare il salvataggio
        // SE dateNull == false : ci sono righe ch non sono state avvalorate e non si può salvare
        if (!dateNull) {
            const save_null = {};
            const modalRef = this.modalService.open(ModalComponent);
            modalRef.componentInstance.save_null = save_null;
            return;
        }

        const data = this.prepareDataToSave();

        this.wbsManagerService.getWbsChange(data).subscribe(
            response => {
                this.disbaledInvia = false;
                this.notificationToastrService.showMessage(response);
                this.wbsManagerService.getWBSDetail(this.wbs, this.isObject).subscribe((response: any) => {
                    this.dataWBsDetail = response;
                    // Aggiorno il padre con i valori nuovi;
                    this.dataWBsDetailUpdated.emit(response);
                    // CAMBIO VALORI DELLA SPALLA SINISTRA DI WBS-MANAGER
                    this.wbsManager.Profitability = this.dataWBsDetail.data.EsHeader.Profitability;
                    this.wbsManager.Costs = this.dataWBsDetail.data.EsBalance.Costs;
                    this.wbsManager.Revenues = this.dataWBsDetail.data.EsBalance.Revenues;
                    this.wbsManager.NetWip = this.dataWBsDetail.data.EsBalance.NetWip;
                    this.wbsManager.Billing = this.dataWBsDetail.data.EsBalance.Billing;
                    this.wbsManager.Marginalita = this.dataWBsDetail.data.EsForecast.Profitability;
                    this.wbsManager.Costi = this.dataWBsDetail.data.EsForecast.Costs;
                    this.wbsManager.Ricavi = this.dataWBsDetail.data.EsForecast.Revenues;
                    this.wbsManager.CostiFinire = this.dataWBsDetail.data.EsForecast.EndCosts;
                    this.wbsManagerService.passDataToAcr(response);
                    const EsForecastTCeTot = this.dataWBsDetail.data.EsForecast.TCeTot;

                    for (let i = 0; i < EsForecastTCeTot.length; i++) {
                        for (let j = 0; j < EsForecastTCeTot[i].TPerio.length; j++) {
                            if (
                                // se è un anno successivo al corrente o lo stesso anno ma con un mese successivo al corrente, allora...
                                parseInt(EsForecastTCeTot[i].TPerio[j].Fyear) > parseInt(this.dataWBsDetail.data.EsForecast.Fyear) ||
                                (
                                    parseInt(EsForecastTCeTot[i].TPerio[j].Fyear) == parseInt(this.dataWBsDetail.data.EsForecast.Fyear) &&
                                    parseInt(EsForecastTCeTot[i].TPerio[j].Fmonth) >= parseInt(this.dataWBsDetail.data.EsForecast.Fmonth)
                                )
                            ) {
                                for (let c = 0; c < this.informationsCards.length; c++) {
                                    for (let t = 0; t < this.informationsCards[c].TPerio.length; t++) {
                                        if (
                                            this.informationsCards[c].TPerio[t].Fyear == EsForecastTCeTot[i].TPerio[j].Fyear &&
                                            this.informationsCards[c].TPerio[t].Fmonth == EsForecastTCeTot[i].TPerio[j].Fmonth
                                        ) {
                                            this.informationsCards[c].TPerio[t].Costs = EsForecastTCeTot[i].TPerio[j].Costs;
                                            this.informationsCards[c].TPerio[t].Revenues = EsForecastTCeTot[i].TPerio[j].Revenues;
                                            this.informationsCards[c].TPerio[t].PerioFrom = EsForecastTCeTot[i].TPerio[j].PerioFrom;
                                            this.informationsCards[c].TPerio[t].ChangeInd = EsForecastTCeTot[i].TPerio[j].ChangeInd;
                                            this.informationsCards[c].TPerio[t].RevManInd = EsForecastTCeTot[i].TPerio[j].RevManInd;
                                            this.informationsCards[c].TPerio[t].PerioTo = EsForecastTCeTot[i].TPerio[j].PerioTo;
                                            this.informationsCards[c].TPerio[t].Profitability = EsForecastTCeTot[i].TPerio[j].Profitability;
                                            this.informationsCards[c].TPerio[t].type = 'blueCard';
                                            // FUNZIONE CHE INSERISCE IL COLORE DEL PALLINO ACCANTO AL MESE
                                            this.profitability_circle();
                                        }
                                    }
                                }
                            }
                        }
                    }
                    this.select_year_function(this.year);
                    this.wbsManagerService.getWbsPrcstGetlist().subscribe(response => {
                        this.EtPrcstList = response;
                    });

                    this.wbsManagerService.getWbsSupplGetlist().subscribe(response => {
                        this.EtSupplList = response;
                    });
                    this.wbsManagerService.getWbsCeGetList(this.wbs).subscribe(response => {
                        this.WbsCe = response;
                        this.WbsCe.data.EtCeList = this.WbsCe.data.EtCeList.filter(function (item: any) {
                            return item.CeDetType === 'G';
                        });
                    });

                    this.setAllStyleCards();
                });
            },
            error => console.log(error)
        );
    }

    // FUNZIONE CHE MI ARROTONDA A DUE CIFRE DECIMALI
    rounted() {
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl != 0) {
            this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((element: any) => {
                let value = parseFloat(element.Value);
                let quantity = parseFloat(element.Quantity);
                let dailyCost = parseFloat(element.DailyCost);
                value = Math.round(value * 100) / 100;
                element.Value = value.toString();
                quantity = Math.round(quantity * 100) / 100;
                element.Quantity = quantity.toString();
                dailyCost = Math.round(dailyCost * 100) / 100;
                element.DailyCost = dailyCost.toString();
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons != 0) {
            this.dataWBsDetail.data.EsForecast.TCeCons.forEach((element: any) => {
                let value = parseFloat(element.Value);
                let quantity = parseFloat(element.Quantity);
                let dailyCost = parseFloat(element.DailyCost);
                value = Math.round(value * 100) / 100;
                element.Value = value.toString();
                quantity = Math.round(quantity * 100) / 100;
                element.Quantity = quantity.toString();
                dailyCost = Math.round(dailyCost * 100) / 100;
                element.DailyCost = dailyCost.toString();
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCostElement != 0) {
            this.dataWBsDetail.data.EsForecast.TCostElement.forEach((element: any) => {
                if (element.CeDetType == 'G') {
                    let value = parseFloat(element.Value);
                    value = Math.round(value * 100) / 100;
                    element.Value = value.toString();
                }
            });
        }
    }

    // FUNZOINE CHE MI INSERISCE IL PUNTO DOVE STA LA VIRGOLA
    tableDataPoint() {
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl != 0) {
            this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((element: any) => {
                element.DailyCost = element.DailyCost.replace(',', '.');
                element.Quantity = element.Quantity.replace(',', '.');
                element.Value = element.Value.replace(',', '.');
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons != 0) {
            this.dataWBsDetail.data.EsForecast.TCeCons.forEach((element: any) => {
                element.DailyCost = element.DailyCost.replace(',', '.');
                element.Value = element.Value.replace(',', '.');
                element.Quantity = element.Quantity.replace(',', '.');
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCostElement != 0) {
            this.dataWBsDetail.data.EsForecast.TCostElement.forEach((element: any) => {
                if (element.CeDetType == 'G') {
                    element.Value = element.Value.replace(',', '.');
                }
            });
        }
    }

    // FUNZIONE CHE MI INSERISCE LA VIRGOLA DOVE STA IL PUNTO
    tableDataComma() {
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((element: any) => {
                element.Value = element.Value.replace('.', ',');
                element.Quantity = element.Quantity.replace('.', ',');
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCeCons.forEach((element: any) => {
                element.DailyCost = element.DailyCost.replace('.', ',');
                element.Value = element.Value.replace('.', ',');
                element.Quantity = element.Quantity.replace('.', ',');
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCostElement.forEach((element: any) => {
                if (element.CeDetType == 'G') {
                    element.Value = element.Value.replace('.', ',');
                }
            });
        }
    }

    copyToNextMonth(TPerio: any) {
        // EVIDENZIARE LA CARD
        this.information_card_mese = TPerio.Fmonth;
        this.information_card_anno = TPerio.Fyear;
        let split = this.dataWBsDetail.data.EsForecast.EndDate.split('-');
        let endDate = {anno: split[0], mese: split[1], giorno: split[2]};
        let next_month_int = parseInt(TPerio.Fmonth) + 1;
        let nextMonth = '';

        if (next_month_int < 13) {
            nextMonth = next_month_int < 10 ? '0' + next_month_int : next_month_int.toString();
            //------------- ESTENSIONE DEL PERIODO E COPIA DEL MESE PRECEDENTE -------------
            if (parseInt(endDate.anno) == parseInt(TPerio.Fyear) && parseInt(nextMonth) > parseInt(endDate.mese)) {
                this.informationsCards
                    .filter((elem: any) => elem.Fyear == TPerio.Fyear)
                    ?.forEach((elem: any) => elem.TPerio.push({...TPerio, Fmonth: nextMonth}))

                // FUNZIONE CHE INSERISCE IL COLORE DEL PALLINO ACCANTO AL MESE
                this.profitability_circle();
                let endDateForecast = this.getEndOfMonth(TPerio.Fyear, next_month_int);
                this.dataWBsDetail.data.EsForecast.EndDate = endDateForecast;
                this.select_year_function(this.year);
            }
            // ---------------------- CONTROLLO SE NEL MESE SUCCESSIVO CI SONO DEI DATI --------------
            // Se nel mese in cui si vogliono copiare i dati non ha nessun dato , si copia tutto senza modale
            if (!this.nextMonthHasData(this.information_card_anno, nextMonth)) {
                this.addRecordToNextMonth(TPerio, nextMonth);

                this.information_card_anno = TPerio.Fyear;
                this.information_card_mese = nextMonth;
                this.appare_tab_forecast = true;
                this.appare_tab_consuntivo = false;
                this.session_dataWBsDetail();
            } else {
                // APERURA MODALE
                const modal_copyNextMonth = {};
                const modalRef = this.modalService.open(ModalComponent);
                modalRef.componentInstance.modal_copyNextMonth = modal_copyNextMonth;
                // PASSAGGIO DI VALORI DAL COMPONENT MODAL
                modalRef.componentInstance.copyNextMonth.subscribe((element: any) => {
                    if (element == true) {
                        let TCeEmpl: any = [];
                        let TCeCons: any = [];
                        let TCostElement: any = [];

                        TCeEmpl.push(...this.dataWBsDetail.data.EsForecast.TCeEmpl
                            .filter((elem: any) => elem.Fyear == TPerio.Fyear && elem.Fmonth == nextMonth))
                        this.dataWBsDetail.data.EsForecast.TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl
                            .filter((item: any) => !TCeEmpl.includes(item));

                        TCeCons.push(...this.dataWBsDetail.data.EsForecast.TCeCons
                            .filter((elem: any) => elem.Fyear == TPerio.Fyear && elem.Fmonth == nextMonth))
                        this.dataWBsDetail.data.EsForecast.TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons
                            .filter((item: any) => !TCeCons.includes(item));

                        TCostElement.push(...this.dataWBsDetail.data.EsForecast.TCostElement
                            .filter((elem: any) => elem.Fyear == TPerio.Fyear && elem.Fmonth == nextMonth && elem.CeDetType == 'G'))
                        this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement
                            .filter((item: any) => !TCostElement.includes(item));

                        this.addRecordToNextMonth(TPerio, nextMonth);

                        this.information_card_anno = TPerio.Fyear;
                        this.information_card_mese = nextMonth;
                        this.appare_tab_forecast = true;
                        this.appare_tab_consuntivo = false;
                        this.session_dataWBsDetail();
                    }
                });
                return;
            }
        } else if (next_month_int >= 13) {
            let next_year_int = parseInt(TPerio.Fyear) + 1;
            let nextYear = next_year_int.toString();
            nextMonth = '01';
            //------------- ESTENSIONE DEL PERIODO E COPIA DEL MESE PRECEDENTE -------------
            if (next_year_int > parseInt(endDate.anno)) {
                this.informationsCards.push({...TPerio, Fyear: nextYear, TPerio: []});
                this.informationsCards.filter((elem: any) => elem.Fyear == nextYear)
                    .forEach((elem: any) => elem.TPerio.push({...TPerio, Fmonth: nextMonth, Fyear: nextYear}));

                // FUNZIONE CHE INSERISCE IL COLORE DEL PALLINO ACCANTO AL MESE
                this.profitability_circle();
                this.optionSelectAnno = [];
                this.initializationOptionSelectAnno();
                this.select_year = this.optionSelectAnno[this.optionSelectAnno.length - 1];
                this.select_year_function(next_year_int);
                this.appare_estendi_periodo();
                let endDate = this.getEndOfMonth(next_year_int, 1);
                this.dataWBsDetail.data.EsForecast.EndDate = endDate;
            }
            // ---------------------- CONTROLLO SE NEL MESE SUCCESSIVO CI SONO DEI DATI --------------
            if (!this.nextMonthHasData(nextYear, nextMonth)) {
                this.addRecordToNextMonth(TPerio, nextMonth, nextYear);

                this.information_card_anno = nextYear;
                this.information_card_mese = nextMonth;
                this.optionSelectAnno = [];
                this.initializationOptionSelectAnno();
                this.select_year = nextYear;
                this.select_year_function(next_year_int);
                this.appare_tab_forecast = true;
                this.appare_tab_consuntivo = false;
                this.session_dataWBsDetail();
            } else {
                // APERURA MODALE
                const modal_copyNextMonth = {};
                const modalRef = this.modalService.open(ModalComponent);
                modalRef.componentInstance.modal_copyNextMonth = modal_copyNextMonth;
                // PASSAGGIO DI VALORI DAL COMPONENT MODAL
                modalRef.componentInstance.copyNextMonth.subscribe((element: any) => {
                    // SVUOTA MESE SUCCESSIVO
                    let TCeEmpl: any = [];
                    let TCeCons: any = [];
                    let TCostElement: any = [];

                    TCeEmpl.push(...this.dataWBsDetail.data.EsForecast.TCeEmpl
                        .filter((elem: any) => elem.Fyear == nextYear && elem.Fmonth == nextMonth))
                    this.dataWBsDetail.data.EsForecast.TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl
                        .filter((item: any) => !TCeEmpl.includes(item));

                    TCeCons.push(...this.dataWBsDetail.data.EsForecast.TCeCons
                        .filter((elem: any) => elem.Fyear == nextYear && elem.Fmonth == nextMonth))
                    this.dataWBsDetail.data.EsForecast.TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons
                        .filter((item: any) => !TCeCons.includes(item));

                    TCostElement.push(...this.dataWBsDetail.data.EsForecast.TCostElement
                        .filter((elem: any) => elem.Fyear == nextYear && elem.Fmonth == nextMonth && elem.CeDetType == 'G'))
                    this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement
                        .filter((item: any) => !TCostElement.includes(item));

                    this.addRecordToNextMonth(TPerio, nextMonth, nextYear);

                    this.information_card_anno = nextYear;
                    this.information_card_mese = nextMonth;
                    this.optionSelectAnno = [];
                    this.initializationOptionSelectAnno();
                    this.select_year = nextYear;
                    this.select_year_function(next_year_int);
                    this.appare_tab_forecast = true;
                    this.appare_tab_consuntivo = false;
                    this.session_dataWBsDetail();
                });
                return;
            }
        }
        // DETT1
        this.dettaglioEsercizo();
        this.click_forecast(TPerio, true);
    }

    addRecordToNextMonth(TPerio: any, nextMonth: string, nextYear?: string) {
        let attrNew: {};
        let yearToCompare = nextYear ?? TPerio.Fyear;
        let attrOld = {
            Rate: '',
            RateId: '',
            Profile: '',
            ProfileId: ''
        }

        if (nextYear) {
            attrNew = {Fmonth: nextMonth, Fyear: nextYear}
        } else {
            attrNew = {Fmonth: nextMonth}
        }

        this.dataWBsDetail.data.EsForecast.TCeEmpl
            .filter((elem: any) => elem.Fyear == TPerio.Fyear && elem.Fmonth == TPerio.Fmonth)
            ?.forEach((elem: any) => this.dataWBsDetail.data.EsForecast.TCeEmpl.push({
                ...attrOld, ...elem, ...attrNew,
                attribute: 'formItem'
            }));

        this.dataWBsDetail.data.EsForecast.TCeCons
            .filter((elem: any) => elem.Fyear == TPerio.Fyear && elem.Fmonth == TPerio.Fmonth)
            ?.forEach((elem: any) => this.dataWBsDetail.data.EsForecast.TCeCons.push({
                ...elem, ...attrNew,
                attribute: 'formItem'
            }));

        this.dataWBsDetail.data.EsForecast.TCostElement
            .filter((elem: any) => elem.Fyear == TPerio.Fyear && elem.Fmonth == TPerio.Fmonth && elem.CeDetType == 'G' && elem.AutoInd != 'X')
            ?.forEach((elem: any) => this.dataWBsDetail.data.EsForecast.TCostElement.push({
                ...elem, ...attrNew,
                attribute: 'formItem',
                CeDetType: 'G'
            }));

        this.informationsCards.forEach((element: any) => {
                let index = element.TPerio.findIndex((elem: any) => elem.Fyear == yearToCompare && elem.Fmonth == nextMonth);
                if (index > -1) {
                    let rev = this.revType == 'CR' ? element.TPerio[index].Revenues : '0.00'
                    element.TPerio[index] = {...TPerio, ...attrNew, Revenues: rev};
                }
            }
        )
    }

    nextMonthHasData(year: string, month: string) {
        let lenEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl
            .filter((elem: any) => elem.Fyear == year && elem.Fmonth == month)
            .length

        let lenCons = this.dataWBsDetail.data.EsForecast.TCeCons
            .filter((elem: any) => elem.Fyear == year && elem.Fmonth == month)
            .length

        let lenCost = this.dataWBsDetail.data.EsForecast.TCostElement
            .filter((elem: any) => elem.Fyear == year && elem.Fmonth == month && elem.CeDetType == 'G')
            .length

        return lenEmpl > 0 || lenCons > 0 || lenCost > 0;
    }

    // FUNZIONE CHE INSERISCE IL MESE/ANNO DELL' ULTIMO CONSUNTIVO
    month_Year() {
        let month_str: any;
        let month_int = parseInt(this.dataWBsDetail.data.EsForecast.Fmonth) - 1;
        if (month_int >= 1) {
            if (month_int < 10) {
                month_str = '0' + month_int.toString();
            } else {
                month_str = month_int.toString();
            }
            this.lastConsMonth = month_str.toString();
            this.lastConsYear = this.dataWBsDetail.data.EsForecast.Fyear;
        } else if (month_int < 1) {
            let year_int = parseInt(this.dataWBsDetail.data.EsForecast.Fyear) - 1;
            this.lastConsMonth = '12';
            this.lastConsYear = year_int.toString();
        }
    }

    openConsuntivo(TPerio: any) {
        this.disabilitedYear = true;
        this.arrShowCard = TPerio;
        this.information_card_anno = TPerio.Fyear;
        this.information_card_mese = TPerio.Fmonth;
        this.appare_tab_forecast = false;
        this.appare_tab_consuntivo = true;
        this.getCostoPersonaleDetail();
        this.getConsulenzaDetail();
        this.getVociDiCostoDetail();
        this.tabExpandCons();
        console.log(this.arrShowCard);
        $(document).ready(function () {
            $('#cardConsuntivo').animate({
                height: 'toggle',
            });
            $('#card').show(1000);
            $('#card').animate({height: '70%', width: '100%', position: 'absolute', text: 'center'});
        });
    }

    closeConsuntivo() {
        this.disabilitedYear = false;
        this.appare_tab_forecast = false;
        this.appare_tab_consuntivo = true;
        $(document).ready(function () {
            $('#card').animate({
                height: 'toggle',
            });
            $('#cardConsuntivo').show(1000);
            $('#card').animate({height: '100%', width: '100%'});
        });
    }

    openForecast(TPerio: any) {
        this.disabilitedYear = true;
        this.arrShowCard = TPerio;
        this.information_card_anno = TPerio.Fyear;
        this.information_card_mese = TPerio.Fmonth;
        this.appare_tab_forecast = true;
        this.appare_tab_consuntivo = false;
        this.getCostoPersonaleDetail();
        this.getConsulenzaDetail();
        this.getVociDiCostoDetail();
        console.log(this.arrShowCard);
        $(document).ready(function () {
            $('#cardConsuntivo').animate({
                height: 'toggle',
            });
            $('#cardForecast').show(1000);
            $('#cardForecast').animate({height: '70%', width: '100%', position: 'absolute', text: 'center'});
        });
    }

    closeForecast() {
        this.disabilitedYear = false;
        this.appare_tab_forecast = true;
        this.appare_tab_consuntivo = false;
        $(document).ready(function () {
            $('#cardForecast').animate({
                height: 'toggle',
            });
            $('#cardConsuntivo').show(1000);
            $('#cardForecast').animate({height: '100%', width: '100%'});
        });
    }

    deleteForecast(TPerio: any) {
        let TCeEmpl: any = [];
        let TCeCons: any = [];
        let TCostElement: any = [];

        this.information_card_anno = TPerio.Fyear;
        this.information_card_mese = TPerio.Fmonth;
        this.appare_tab_consuntivo = false;
        this.appare_tab_forecast = true;

        if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
            TCeEmpl = [...this.dataWBsDetail.data.EsForecast.TCeEmpl.filter((item: any) => TPerio.Fyear == item.Fyear && TPerio.Fmonth == item.Fmonth)];
            // for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeEmpl.length; i++) {
            // 	if (
            // 		TPerio.Fyear == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fyear &&
            // 		TPerio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeEmpl[i].Fmonth
            // 	) {
            // 		TCeEmpl.push(this.dataWBsDetail.data.EsForecast.TCeEmpl[i]);
            // 	}
            // }
            this.dataWBsDetail.data.EsForecast.TCeEmpl = this.dataWBsDetail.data.EsForecast.TCeEmpl.filter(
                (item: any) => !TCeEmpl.includes(item)
            );
            console.log(this.dataWBsDetail.data.EsForecast.TCeEmpl);
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
            TCeCons = [...this.dataWBsDetail.data.EsForecast.TCeCons.filter((item: any) => TPerio.Fyear == item.Fyear && TPerio.Fmonth == item.Fmonth)];
            // for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCeCons.length; i++) {
            // 	if (
            // 		TPerio.Fyear == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fyear &&
            // 		TPerio.Fmonth == this.dataWBsDetail.data.EsForecast.TCeCons[i].Fmonth
            // 	) {
            // 		TCeCons.push(this.dataWBsDetail.data.EsForecast.TCeCons[i]);
            // 	}
            // }
            this.dataWBsDetail.data.EsForecast.TCeCons = this.dataWBsDetail.data.EsForecast.TCeCons.filter(
                (item: any) => !TCeCons.includes(item)
            );
        }
        if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
            TCostElement = [...this.dataWBsDetail.data.EsForecast.TCostElement.filter((item: any) => TPerio.Fyear == item.Fyear && TPerio.Fmonth == item.Fmonth)];
            // for (let i = 0; i < this.dataWBsDetail.data.EsForecast.TCostElement.length; i++) {
            // 	if (
            // 		TPerio.Fyear == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fyear &&
            // 		TPerio.Fmonth == this.dataWBsDetail.data.EsForecast.TCostElement[i].Fmonth
            // 	) {
            // 		TCostElement.push(this.dataWBsDetail.data.EsForecast.TCostElement[i]);
            // 	}
            // }
            this.dataWBsDetail.data.EsForecast.TCostElement = this.dataWBsDetail.data.EsForecast.TCostElement.filter(
                (item: any) => !TCostElement.includes(item)
            );
        }
        // this.forecast_to_dash();
        this.toDashOrForecast(true);
        this.session_dataWBsDetail();
        // DETT
        this.dettaglioEsercizo();
    }

    roundNumber(value: number): number {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }

    roundSumOfString(value1: string, value2: string): number {
        let sum = parseFloat(value1) + parseFloat(value2);
        return this.roundNumber(sum);
    }

    aggrTBalEmplDett(year: any, month?: any) {
        let TBalEmplDett: any = [];
        let TBalEmplList: any;

        if (month)
            TBalEmplList = this.dataWBsDetail.data.EsBalance.TBalEmpl?.filter((TBalEmpl: any) => TBalEmpl.Fyear == year && TBalEmpl.Fmonth == month);
        else
            TBalEmplList = this.dataWBsDetail.data.EsBalance.TBalEmpl?.filter((TBalEmpl: any) => TBalEmpl.Fyear == year);

        TBalEmplList.forEach((TBalEmpl: any) => {
            let i = TBalEmplDett.findIndex((dettaglio: any) => TBalEmpl.CostProfile == dettaglio.CostProfile);
            if (i == -1) {
                TBalEmplDett.push({...TBalEmpl});
            } else {
                TBalEmplDett[i].Value = this.roundSumOfString(TBalEmpl.Value, TBalEmplDett[i].Value).toString();
                TBalEmplDett[i].Quantity = this.roundSumOfString(TBalEmpl.Quantity, TBalEmplDett[i].Quantity).toString();
            }
        });

        return TBalEmplDett;
    }

    aggrTBalEmplName(year: any, month?: any) {
        let TBalEmplName: any = [];
        let TBalEmplList: any;

        if (month)
            TBalEmplList = this.dataWBsDetail.data.EsBalance.TBalEmpl?.filter((TBalEmpl: any) => TBalEmpl.Fyear == year && TBalEmpl.Fmonth == month);
        else
            TBalEmplList = this.dataWBsDetail.data.EsBalance.TBalEmpl?.filter((TBalEmpl: any) => TBalEmpl.Fyear == year);

        TBalEmplList.forEach((TBalEmpl: any) => {
            let i = TBalEmplName.findIndex((Name: any) => TBalEmpl.Name == Name.Name && TBalEmpl.CostProfile == Name.CostProfile);
            if (i == -1) {
                TBalEmplName.push({
                    Name: TBalEmpl.Name,
                    CostProfile: TBalEmpl.CostProfile,
                    Quantity: TBalEmpl.Quantity,
                    Value: TBalEmpl.Value,
                });
            } else {
                TBalEmplName[i].Value = this.roundSumOfString(TBalEmpl.Value, TBalEmplName[i].Value).toString();
                TBalEmplName[i].Quantity = this.roundSumOfString(TBalEmpl.Quantity, TBalEmplName[i].Quantity).toString();
            }
        });

        return TBalEmplName;
    }

    aggrTCeEmplDett(year: any, month?: any, toRound: boolean = false) {
        let TCeEmplDett: any = [];
        let TCeEmplList: any;

        if (month)
            TCeEmplList = this.dataWBsDetail.data.EsForecast.TCeEmpl?.filter((TCeEmpl: any) => TCeEmpl.Fyear == year && TCeEmpl.Fmonth == month);
        else
            TCeEmplList = this.dataWBsDetail.data.EsForecast.TCeEmpl?.filter((TCeEmpl: any) => TCeEmpl.Fyear == year);

        TCeEmplList.forEach((TCeEmpl: any) => {
            let i;
            if (TCeEmpl.CostProfile == "TEAM") {
                i = TCeEmplDett.findIndex((dettaglio: any) => dettaglio.DailyCost == TCeEmpl.DailyCost);
            } else {
                i = TCeEmplDett.findIndex((dettaglio: any) => TCeEmpl.CostProfile == dettaglio.CostProfile);
            }

            if (i == -1) {
                TCeEmplDett.push({...TCeEmpl});
            } else {
                let value = toRound ?
                    this.roundSumOfString(TCeEmpl.Value, TCeEmplDett[i].Value) : parseFloat(TCeEmpl.Value) + parseFloat(TCeEmplDett[i].Value);
                let quantity = toRound ?
                    this.roundSumOfString(TCeEmpl.Quantity, TCeEmplDett[i].Quantity) : parseFloat(TCeEmpl.Quantity) + parseFloat(TCeEmplDett[i].Quantity);

                TCeEmplDett[i].Value = value.toString();
                TCeEmplDett[i].Quantity = quantity.toString();
            }
        });

        return TCeEmplDett;
    }

    // dettaglioEsercizo() {
    //     let TBalConsDett: any = [];
    //     let TBalCeDett: any = [];
    //     let TCeEmplDett: any = [];
    //     let TCeConsDett: any = [];
    //     let TCostElementDett: any = [];
    //     let TBalEmplDett: any = [];
    //     let TBalEmplName: any = [];
    //     let check_TBalConsDett = false;
    //     let check_TBalCeDett = false;
    //     let check_TCeEmplDett = false;
    //     let check_TCeConsDett = false;
    //     let check_TCostElementDett = false;
    //     let check_TBalEmplDett = false;
    //     let check_TBalEmplName = false;
    //
    //     //***COSTO DEL PERSONALE CONSUNTIVO DETTAGLIO***//
    //     this.TBalEmplDett = this.aggrTBalEmplDett(this.information_card_anno, this.information_card_mese);
    //     this.TBalEmplName = this.aggrTBalEmplName(this.information_card_anno, this.information_card_mese);
    //
    //     // if (this.dataWBsDetail.data.EsBalance.TBalEmpl.length != 0) {
    //     // 	this.dataWBsDetail.data.EsBalance.TBalEmpl.forEach((TBalEmpl: any) => {
    //     // 		if (TBalEmpl.Fyear == this.information_card_anno) {
    //     // 			TBalEmplDett.forEach((dettaglio: any) => {
    //     // 				if (dettaglio.CostProfile == TBalEmpl.CostProfile) {
    //     // 					check_TBalEmplDett = true;
    //     // 					let value = parseFloat(dettaglio.Value) + parseFloat(TBalEmpl.Value);
    //     // 					value = Math.round((value + Number.EPSILON) * 100) / 100;
    //     // 					let quantity = parseFloat(TBalEmpl.Quantity) + parseFloat(dettaglio.Quantity);
    //     // 					quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
    //     // 					dettaglio.Value = value.toString();
    //     // 					dettaglio.Quantity = quantity.toString();
    //     // 				}
    //     // 			});
    //     // 			if (check_TBalEmplDett == false) {
    //     // 				TBalEmplDett.push({
    //     // 					CostProfile: TBalEmpl.CostProfile,
    //     // 					Fmonth: TBalEmpl.Fmonth,
    //     // 					Fyear: TBalEmpl.Fyear,
    //     // 					IdRow: TBalEmpl.IdRow,
    //     // 					Name: TBalEmpl.Name,
    //     // 					OrgUnit: TBalEmpl.OrgUnit,
    //     // 					ParentIdRow: TBalEmpl.ParentIdRow,
    //     // 					Persno: TBalEmpl.Persno,
    //     // 					Quantity: TBalEmpl.Quantity,
    //     // 					Value: TBalEmpl.Value,
    //     // 				});
    //     // 			} else {
    //     // 				check_TBalEmplDett = false;
    //     // 			}
    //     // 			//***NAME***//
    //     // 			TBalEmplName.forEach((Name: any) => {
    //     // 				if (TBalEmpl.Name == Name.Name && TBalEmpl.CostProfile == Name.CostProfile) {
    //     // 					check_TBalEmplName = true;
    //     // 					let value = parseFloat(Name.Value) + parseFloat(TBalEmpl.Value);
    //     // 					value = Math.round((value + Number.EPSILON) * 100) / 100;
    //     // 					let quantity = parseFloat(Name.Quantity) + parseFloat(TBalEmpl.Quantity);
    //     // 					quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
    //     // 					Name.Value = value.toString();
    //     // 					Name.Quantity = quantity.toString();
    //     // 				}
    //     // 			});
    //     // 			if (check_TBalEmplName == false) {
    //     // 				TBalEmplName.push({
    //     // 					Name: TBalEmpl.Name,
    //     // 					CostProfile: TBalEmpl.CostProfile,
    //     // 					Quantity: TBalEmpl.Quantity,
    //     // 					Value: TBalEmpl.Value,
    //     // 				});
    //     // 			} else {
    //     // 				check_TBalEmplName = false;
    //     // 			}
    //     // 		}
    //     // 	});
    //     // 	this.TBalEmplName = TBalEmplName;
    //     // 	this.TBalEmplDett = TBalEmplDett;
    //     // }
    //     //***CONSUNTIVO CONSULENZA TECNICA DETTAGLIO***//
    //     this.dataWBsDetail.data.EsBalance.TBalCons?.filter((TBalCons: any) => TBalCons.Fyear == this.information_card_anno)
    //         .forEach((TBalCons: any) => {
    //             let i = TBalConsDett.findIndex((dettaglio: any) => TBalCons.Description == dettaglio.Description)
    //             if (i == -1) {
    //                 TBalConsDett.push({...TBalCons});
    //             } else {
    //                 TBalConsDett[i].Value = this.roundSumOfString(TBalCons.Value, TBalConsDett[i].Value).toString();
    //             }
    //         })
    //     this.TBalConsDett = TBalConsDett;
    //
    //     // if (this.dataWBsDetail.data.EsBalance.TBalCons.length != 0) {
    //     // 	this.dataWBsDetail.data.EsBalance.TBalCons.forEach((TBalCons: any) => {
    //     // 		if (TBalCons.Fyear == this.information_card_anno) {
    //     // 			TBalConsDett.forEach((dettaglio: any) => {
    //     // 				if (dettaglio.Description == TBalCons.Description) {
    //     // 					let value = parseFloat(dettaglio.Value) + parseFloat(TBalCons.Value);
    //     // 					value = Math.round((value + Number.EPSILON) * 100) / 100;
    //     // 					dettaglio.Value = value.toString();
    //     // 					check_TBalConsDett = true;
    //     // 				}
    //     // 			});
    //     // 			if (check_TBalConsDett == false) {
    //     // 				TBalConsDett.push({
    //     // 					DescSupplier: TBalCons.DescSupplier,
    //     // 					Description: TBalCons.Description,
    //     // 					Fmonth: TBalCons.Fmonth,
    //     // 					Fyear: TBalCons.Fyear,
    //     // 					IdRow: TBalCons.IdRow,
    //     // 					Orderno: TBalCons.Orderno,
    //     // 					ParentIdRow: TBalCons.ParentIdRow,
    //     // 					Quantity: TBalCons.Quantity,
    //     // 					Supplier: TBalCons.Supplier,
    //     // 					Value: TBalCons.Value,
    //     // 				});
    //     // 			} else {
    //     // 				check_TBalConsDett = false;
    //     // 			}
    //     // 		}
    //     // 	});
    //     // 	this.TBalConsDett = TBalConsDett;
    //     // }
    //
    //     //***VOCI DI COSTO DETTAGLIO***//
    //     this.dataWBsDetail.data.EsBalance.TBalCe?.filter((TBalCe: any) => TBalCe.Fyear == this.information_card_anno)
    //         .forEach((TBalCe: any) => {
    //             let i = TBalCeDett.findIndex((dettaglio: any) => TBalCe.DescrCe == dettaglio.DescrCe)
    //             if (i == -1) {
    //                 TBalCeDett.push({...TBalCe});
    //             } else {
    //                 TBalCeDett[i].Value = this.roundSumOfString(TBalCe.Value, TBalCeDett[i].Value).toString();
    //             }
    //         });
    //     this.TBalCeDett = TBalCeDett;
    //
    //     // if (this.dataWBsDetail.data.EsBalance.TBalCe.length != 0) {
    //     // 	this.dataWBsDetail.data.EsBalance.TBalCe.forEach((TBalCe: any) => {
    //     // 		if (TBalCe.Fyear == this.information_card_anno) {
    //     // 			TBalCeDett.forEach((dettaglio: any) => {
    //     // 				if (TBalCe.DescrCe == dettaglio.DescrCe) {
    //     // 					check_TBalCeDett = true;
    //     // 					let value = parseFloat(TBalCe.Value) + parseFloat(dettaglio.Value);
    //     // 					value = Math.round((value + Number.EPSILON) * 100) / 100;
    //     // 					dettaglio.Value = value.toString();
    //     // 				}
    //     // 			});
    //     // 			if (check_TBalCeDett == false) {
    //     // 				TBalCeDett.push({
    //     // 					CeDetType: TBalCe.CeDetType,
    //     // 					CeInd: TBalCe.CeInd,
    //     // 					CostElement: TBalCe.CostElement,
    //     // 					DescrCe: TBalCe.DescrCe,
    //     // 					Fmonth: TBalCe.Fmonth,
    //     // 					Fyear: TBalCe.Fyear,
    //     // 					IdRow: TBalCe.IdRow,
    //     // 					Value: TBalCe.Value,
    //     // 				});
    //     // 			} else {
    //     // 				check_TBalCeDett = false;
    //     // 			}
    //     // 		}
    //     // 	});
    //     // 	this.TBalCeDett = TBalCeDett;
    //     // }
    //
    //     //***COSTO DEL PERSONALE FORECAST***//
    //     this.TCeEmplDett = this.aggrTCeEmplDett(this.information_card_anno);
    //
    //     // if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
    //     // 	this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((TCeEmpl: any) => {
    //     // 		if (TCeEmpl.Fyear == this.information_card_anno) {
    //     // 			TCeEmplDett.forEach((dettaglio: any) => {
    //     // 				if (TCeEmpl.CostProfile == dettaglio.CostProfile) {
    //     // 					check_TCeEmplDett = true;
    //     // 					let value = parseFloat(TCeEmpl.Value) + parseFloat(dettaglio.Value);
    //     // 					//value = Math.round((value + Number.EPSILON) * 100) / 100;
    //     // 					let quantity = parseFloat(TCeEmpl.Quantity) + parseFloat(dettaglio.Quantity);
    //     // 					//quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
    //     // 					dettaglio.Value = value.toString();
    //     // 					dettaglio.Quantity = quantity.toString();
    //     // 				}
    //     // 			});
    //     // 			if (check_TCeEmplDett == false) {
    //     // 				TCeEmplDett.push({
    //     // 					CostProfile: TCeEmpl.CostProfile,
    //     // 					DailyCost: TCeEmpl.DailyCost,
    //     // 					Fmonth: TCeEmpl.Fmonth,
    //     // 					Fyear: TCeEmpl.Fyear,
    //     // 					IdRow: TCeEmpl.IdRow,
    //     // 					ParentIdRow: TCeEmpl.ParentIdRow,
    //     // 					Quantity: TCeEmpl.Quantity,
    //     // 					Value: TCeEmpl.Value,
    //     // 				});
    //     // 			} else {
    //     // 				check_TCeEmplDett = false;
    //     // 			}
    //     // 		}
    //     // 		this.TCeEmplDett = TCeEmplDett;
    //     // 	});
    //     // }
    //
    //     //***CONSULENZA TECNICA FORECAST***//
    //     this.dataWBsDetail.data.EsForecast.TCeCons?.filter((TCeCons: any) => TCeCons.Fyear == this.information_card_anno)
    //         .forEach((TCeCons: any) => {
    //             let i = TCeConsDett.findIndex((dettaglio: any) => TCeCons.DescSupplier == dettaglio.DescSupplier);
    //             if (i == -1) {
    //                 TCeConsDett.push({...TCeCons});
    //             } else {
    //                 TCeConsDett[i].Value = this.roundSumOfString(TCeCons.Value, TCeConsDett[i].Value).toString();
    //                 TCeConsDett[i].Quantity = this.roundSumOfString(TCeCons.Quantity, TCeConsDett[i].Quantity).toString();
    //                 TCeConsDett[i].DailyCost = this.roundSumOfString(TCeCons.DailyCost, TCeConsDett[i].DailyCost).toString();
    //             }
    //         });
    //     this.TCeConsDett = TCeConsDett;
    //
    //     // if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
    //     // 	this.dataWBsDetail.data.EsForecast.TCeCons.forEach((TCeCons: any) => {
    //     // 		if (TCeCons.Fyear == this.information_card_anno) {
    //     // 			TCeConsDett.forEach((dettaglio: any) => {
    //     // 				if (TCeCons.DescSupplier == dettaglio.DescSupplier) {
    //     // 					check_TCeConsDett = true;
    //     // 					let value = parseFloat(TCeCons.Value) + parseFloat(dettaglio.Value);
    //     // 					value = Math.round((value + Number.EPSILON) * 100) / 100;
    //     // 					let quantity = parseFloat(TCeCons.Quantity) + parseFloat(dettaglio.Quantity);
    //     // 					quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
    //     // 					let dailyCost = parseFloat(TCeCons.DailyCost) + parseFloat(dettaglio.DailyCost);
    //     // 					dailyCost = Math.round((dailyCost + Number.EPSILON) * 100) / 100;
    //     // 					dettaglio.Value = value.toString();
    //     // 					dettaglio.Quantity = quantity.toString();
    //     // 					dettaglio.DailyCost = dailyCost.toString();
    //     // 				}
    //     // 			});
    //     // 			if (check_TCeConsDett == false) {
    //     // 				TCeConsDett.push({
    //     // 					DailyCost: TCeCons.DailyCost,
    //     // 					DescSupplier: TCeCons.DescSupplier,
    //     // 					Fmonth: TCeCons.Fmonth,
    //     // 					Fyear: TCeCons.Fyear,
    //     // 					IdRow: TCeCons.IdRow,
    //     // 					ParentIdRow: TCeCons.ParentIdRow,
    //     // 					Quantity: TCeCons.Quantity,
    //     // 					Supplier: TCeCons.Supplier,
    //     // 					Value: TCeCons.Value,
    //     // 				});
    //     // 			} else {
    //     // 				check_TCeConsDett = false;
    //     // 			}
    //     // 		}
    //     // 	});
    //     // 	this.TCeConsDett = TCeConsDett;
    //     // }
    //
    //     //***VOCI DI COSTO FORECAST***//
    //     this.dataWBsDetail.data.EsForecast.TCostElement?.filter((TCostElement: any) => TCostElement.Fyear == this.information_card_anno)
    //         .forEach((TCostElement: any) => {
    //             let i = TCostElementDett.findIndex((dettaglio: any) => TCostElement.DescrCe == dettaglio.DescrCe);
    //             if (i == -1) {
    //                 TCostElementDett.push({...TCostElement});
    //             } else {
    //                 TCostElementDett[i].Value = this.roundSumOfString(TCostElement.Value, TCostElementDett[i].Value).toString();
    //             }
    //         });
    //     this.TCostElementDett = TCostElementDett;
    //     // if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
    //     // 	this.dataWBsDetail.data.EsForecast.TCostElement.forEach((TCostElement: any) => {
    //     // 		if (TCostElement.Fyear == this.information_card_anno) {
    //     // 			TCostElementDett.forEach((dettaglio: any) => {
    //     // 				if (dettaglio.DescrCe == TCostElement.DescrCe) {
    //     // 					check_TCostElementDett = true;
    //     // 					let value = parseFloat(TCostElement.Value) + parseFloat(dettaglio.Value);
    //     // 					value = Math.round((value + Number.EPSILON) * 100) / 100;
    //     // 					dettaglio.Value = value.toString();
    //     // 				}
    //     // 			});
    //     // 			if (check_TCostElementDett == false) {
    //     // 				TCostElementDett.push({
    //     // 					CeDetType: TCostElement.CeDetType,
    //     // 					CeInd: TCostElement.CeInd,
    //     // 					CostElement: TCostElement.CostElement,
    //     // 					DescrCe: TCostElement.DescrCe,
    //     // 					Description: TCostElement.Description,
    //     // 					Fmonth: TCostElement.Fmonth,
    //     // 					Fyear: TCostElement.Fyear,
    //     // 					IdRow: TCostElement.IdRow,
    //     // 					Value: TCostElement.Value,
    //     // 				});
    //     // 			} else {
    //     // 				check_TCostElementDett = false;
    //     // 			}
    //     // 		}
    //     // 	});
    //     // 	this.TCostElementDett = TCostElementDett;
    //     // }
    // }

    dettaglioEsercizo() {
        let TBalConsDett: any = [];
        let TBalCeDett: any = [];
        let TCeEmplDett: any = [];
        let TCeConsDett: any = [];
        let TCostElementDett: any = [];
        let TBalEmplDett: any = [];
        let TBalEmplName: any = [];
        let check_TBalConsDett = false;
        let check_TBalCeDett = false;
        let check_TCeEmplDett = false;
        let check_TCeConsDett = false;
        let check_TCostElementDett = false;
        let check_TBalEmplDett = false;
        let check_TBalEmplName = false;
        //***COSTO DEL PERSONALE CONSUNTIVO DETTAGLIO***//
        if (this.dataWBsDetail.data.EsBalance.TBalEmpl.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalEmpl.forEach((TBalEmpl: any) => {
                if (TBalEmpl.Fyear == this.information_card_anno) {
                    TBalEmplDett.forEach((dettaglio: any) => {
                        if (dettaglio.CostProfile == TBalEmpl.CostProfile) {
                            check_TBalEmplDett = true;
                            let value = parseFloat(dettaglio.Value) + parseFloat(TBalEmpl.Value);
                            value = Math.round((value + Number.EPSILON) * 100) / 100;
                            let quantity = parseFloat(TBalEmpl.Quantity) + parseFloat(dettaglio.Quantity);
                            quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
                            dettaglio.Value = value.toString();
                            dettaglio.Quantity = quantity.toString();
                        }
                    });
                    if (check_TBalEmplDett == false) {
                        TBalEmplDett.push({
                            CostProfile: TBalEmpl.CostProfile,
                            Fmonth: TBalEmpl.Fmonth,
                            Fyear: TBalEmpl.Fyear,
                            IdRow: TBalEmpl.IdRow,
                            Name: TBalEmpl.Name,
                            OrgUnit: TBalEmpl.OrgUnit,
                            ParentIdRow: TBalEmpl.ParentIdRow,
                            Persno: TBalEmpl.Persno,
                            Quantity: TBalEmpl.Quantity,
                            Value: TBalEmpl.Value,
                        });
                    } else {
                        check_TBalEmplDett = false;
                    }
                    //***NAME***//
                    TBalEmplName.forEach((Name: any) => {
                        if (TBalEmpl.Name == Name.Name && TBalEmpl.CostProfile == Name.CostProfile) {
                            check_TBalEmplName = true;
                            let value = parseFloat(Name.Value) + parseFloat(TBalEmpl.Value);
                            value = Math.round((value + Number.EPSILON) * 100) / 100;
                            let quantity = parseFloat(Name.Quantity) + parseFloat(TBalEmpl.Quantity);
                            quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
                            Name.Value = value.toString();
                            Name.Quantity = quantity.toString();
                        }
                    });
                    if (check_TBalEmplName == false) {
                        TBalEmplName.push({
                            Name: TBalEmpl.Name,
                            CostProfile: TBalEmpl.CostProfile,
                            Quantity: TBalEmpl.Quantity,
                            Value: TBalEmpl.Value,
                        });
                    } else {
                        check_TBalEmplName = false;
                    }
                }
            });
            this.TBalEmplName = TBalEmplName;
            this.TBalEmplDett = TBalEmplDett;
        }
        //***CONSUNTIVO CONSULENZA TECNICA DETTAGLIO***//
        if (this.dataWBsDetail.data.EsBalance.TBalCons.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalCons.forEach((TBalCons: any) => {
                if (TBalCons.Fyear == this.information_card_anno) {
                    TBalConsDett.forEach((dettaglio: any) => {
                        if (dettaglio.Description == TBalCons.Description) {
                            let value = parseFloat(dettaglio.Value) + parseFloat(TBalCons.Value);
                            value = Math.round((value + Number.EPSILON) * 100) / 100;
                            dettaglio.Value = value.toString();
                            check_TBalConsDett = true;
                        }
                    });
                    if (check_TBalConsDett == false) {
                        TBalConsDett.push({
                            DescSupplier: TBalCons.DescSupplier,
                            Description: TBalCons.Description,
                            Fmonth: TBalCons.Fmonth,
                            Fyear: TBalCons.Fyear,
                            IdRow: TBalCons.IdRow,
                            Orderno: TBalCons.Orderno,
                            ParentIdRow: TBalCons.ParentIdRow,
                            Quantity: TBalCons.Quantity,
                            Supplier: TBalCons.Supplier,
                            Value: TBalCons.Value,
                        });
                    } else {
                        check_TBalConsDett = false;
                    }
                }
            });
            this.TBalConsDett = TBalConsDett;
        }
        //***VOCI DI COSTO DETTAGLIO***//
        if (this.dataWBsDetail.data.EsBalance.TBalCe.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalCe.forEach((TBalCe: any) => {
                if (TBalCe.Fyear == this.information_card_anno) {
                    TBalCeDett.forEach((dettaglio: any) => {
                        if (TBalCe.DescrCe == dettaglio.DescrCe) {
                            check_TBalCeDett = true;
                            let value = parseFloat(TBalCe.Value) + parseFloat(dettaglio.Value);
                            value = Math.round((value + Number.EPSILON) * 100) / 100;
                            dettaglio.Value = value.toString();
                        }
                    });
                    if (check_TBalCeDett == false) {
                        TBalCeDett.push({
                            CeDetType: TBalCe.CeDetType,
                            CeInd: TBalCe.CeInd,
                            CostElement: TBalCe.CostElement,
                            DescrCe: TBalCe.DescrCe,
                            Fmonth: TBalCe.Fmonth,
                            Fyear: TBalCe.Fyear,
                            IdRow: TBalCe.IdRow,
                            Value: TBalCe.Value,
                        });
                    } else {
                        check_TBalCeDett = false;
                    }
                }
            });
            this.TBalCeDett = TBalCeDett;
        }
        //***COSTO DEL PERSONALE FORECAST***//
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((TCeEmpl: any) => {
                if (TCeEmpl.Fyear == this.information_card_anno) {
                    TCeEmplDett.forEach((dettaglio: any) => {
                        if (TCeEmpl.CostProfile == dettaglio.CostProfile) {
                            check_TCeEmplDett = true;
                            let value = parseFloat(TCeEmpl.Value) + parseFloat(dettaglio.Value);
                            //value = Math.round((value + Number.EPSILON) * 100) / 100;
                            let quantity = parseFloat(TCeEmpl.Quantity) + parseFloat(dettaglio.Quantity);
                            //quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
                            dettaglio.Value = value.toString();
                            dettaglio.Quantity = quantity.toString();
                        }
                    });
                    if (check_TCeEmplDett == false) {
                        TCeEmplDett.push({
                            CostProfile: TCeEmpl.CostProfile,
                            DailyCost: TCeEmpl.DailyCost,
                            Fmonth: TCeEmpl.Fmonth,
                            Fyear: TCeEmpl.Fyear,
                            IdRow: TCeEmpl.IdRow,
                            ParentIdRow: TCeEmpl.ParentIdRow,
                            Quantity: TCeEmpl.Quantity,
                            Value: TCeEmpl.Value,
                        });
                    } else {
                        check_TCeEmplDett = false;
                    }
                }
            });
            this.TCeEmplDett = TCeEmplDett;
        }
        //***CONSULENZA TECNICA FORECAST***//
        if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCeCons.forEach((TCeCons: any) => {
                if (TCeCons.Fyear == this.information_card_anno) {
                    TCeConsDett.forEach((dettaglio: any) => {
                        if (TCeCons.DescSupplier == dettaglio.DescSupplier) {
                            check_TCeConsDett = true;
                            let value = parseFloat(TCeCons.Value) + parseFloat(dettaglio.Value);
                            value = Math.round((value + Number.EPSILON) * 100) / 100;
                            let quantity = parseFloat(TCeCons.Quantity) + parseFloat(dettaglio.Quantity);
                            quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
                            let dailyCost = parseFloat(TCeCons.DailyCost) + parseFloat(dettaglio.DailyCost);
                            dailyCost = Math.round((dailyCost + Number.EPSILON) * 100) / 100;
                            dettaglio.Value = value.toString();
                            dettaglio.Quantity = quantity.toString();
                            dettaglio.DailyCost = dailyCost.toString();
                        }
                    });
                    if (check_TCeConsDett == false) {
                        TCeConsDett.push({
                            DailyCost: TCeCons.DailyCost,
                            DescSupplier: TCeCons.DescSupplier,
                            Fmonth: TCeCons.Fmonth,
                            Fyear: TCeCons.Fyear,
                            IdRow: TCeCons.IdRow,
                            ParentIdRow: TCeCons.ParentIdRow,
                            Quantity: TCeCons.Quantity,
                            Supplier: TCeCons.Supplier,
                            Value: TCeCons.Value,
                        });
                    } else {
                        check_TCeConsDett = false;
                    }
                }
            });
            this.TCeConsDett = TCeConsDett;
        }
        //***VOCI DI COSTO FORECAST***//
        if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCostElement.forEach((TCostElement: any) => {
                if (TCostElement.Fyear == this.information_card_anno) {
                    TCostElementDett.forEach((dettaglio: any) => {
                        if (dettaglio.DescrCe == TCostElement.DescrCe) {
                            check_TCostElementDett = true;
                            let value = parseFloat(TCostElement.Value) + parseFloat(dettaglio.Value);
                            value = Math.round((value + Number.EPSILON) * 100) / 100;
                            dettaglio.Value = value.toString();
                        }
                    });
                    if (check_TCostElementDett == false) {
                        TCostElementDett.push({
                            CeDetType: TCostElement.CeDetType,
                            CeInd: TCostElement.CeInd,
                            CostElement: TCostElement.CostElement,
                            DescrCe: TCostElement.DescrCe,
                            Description: TCostElement.Description,
                            Fmonth: TCostElement.Fmonth,
                            Fyear: TCostElement.Fyear,
                            IdRow: TCostElement.IdRow,
                            Value: TCostElement.Value,
                        });
                    } else {
                        check_TCostElementDett = false;
                    }
                }
            });
            this.TCostElementDett = TCostElementDett;
        }
    }

    //*******************************************//
    // GESTIONE DEI NOMI E DEI PROFILI DI COSTO DELLA TABELLA COSTO DEL PERSONALE E DEL COSTO DEL PERSONALE DEL DORECAST
    // NELLA EXPAND CONSUNTIVO (openConsuntivo)
    //******************************************//
    TCeEmplExpand: any = [];
    TBalEmplExpand: any = [];
    TBalEmplExpandName: any = [];

    tabExpandCons() {
        let TBalEmplDett: any = [];
        let TBalEmplName: any = [];
        let TCeEmplDett: any = [];
        let check_TBalEmplName = false;
        let check_TBalEmplDett = false;
        let check_TCeEmplDett = false;
        //***COSTO DEL PERSONALE CONSUNTIVO EXPAND***//
        this.TBalEmplExpand = this.aggrTBalEmplDett(this.information_card_anno, this.information_card_mese);
        this.TBalEmplExpandName = this.aggrTBalEmplName(this.information_card_anno, this.information_card_mese);

        // if (this.dataWBsDetail.data.EsBalance.TBalEmpl.length != 0) {
        // 	this.dataWBsDetail.data.EsBalance.TBalEmpl.forEach((TBalEmpl: any) => {
        // 		if (TBalEmpl.Fyear == this.information_card_anno && TBalEmpl.Fmonth == this.information_card_mese) {
        // 			TBalEmplDett.forEach((dettaglio: any) => {
        // 				if (dettaglio.CostProfile == TBalEmpl.CostProfile) {
        // 					check_TBalEmplDett = true;
        // 					let value = parseFloat(dettaglio.Value) + parseFloat(TBalEmpl.Value);
        // 					value = Math.round((value + Number.EPSILON) * 100) / 100;
        // 					let quantity = parseFloat(TBalEmpl.Quantity) + parseFloat(dettaglio.Quantity);
        // 					quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
        // 					dettaglio.Value = value.toString();
        // 					dettaglio.Quantity = quantity.toString();
        // 				}
        // 			});
        // 			if (check_TBalEmplDett == false) {
        // 				TBalEmplDett.push({
        // 					CostProfile: TBalEmpl.CostProfile,
        // 					Fmonth: TBalEmpl.Fmonth,
        // 					Fyear: TBalEmpl.Fyear,
        // 					IdRow: TBalEmpl.IdRow,
        // 					Name: TBalEmpl.Name,
        // 					OrgUnit: TBalEmpl.OrgUnit,
        // 					ParentIdRow: TBalEmpl.ParentIdRow,
        // 					Persno: TBalEmpl.Persno,
        // 					Quantity: TBalEmpl.Quantity,
        // 					Value: TBalEmpl.Value,
        // 				});
        // 			} else {
        // 				check_TBalEmplDett = false;
        // 			}
        // 			//***NAME***//
        // 			TBalEmplName.forEach((Name: any) => {
        // 				if (TBalEmpl.Name == Name.Name && TBalEmpl.CostProfile == Name.CostProfile) {
        // 					check_TBalEmplName = true;
        // 					let value = parseFloat(Name.Value) + parseFloat(TBalEmpl.Value);
        // 					value = Math.round((value + Number.EPSILON) * 100) / 100;
        // 					let quantity = parseFloat(Name.Quantity) + parseFloat(TBalEmpl.Quantity);
        // 					quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
        // 					Name.Value = value.toString();
        // 					Name.Quantity = quantity.toString();
        // 				}
        // 			});
        // 			if (check_TBalEmplName == false) {
        // 				TBalEmplName.push({
        // 					Name: TBalEmpl.Name,
        // 					CostProfile: TBalEmpl.CostProfile,
        // 					Quantity: TBalEmpl.Quantity,
        // 					Value: TBalEmpl.Value,
        // 				});
        // 			} else {
        // 				check_TBalEmplName = false;
        // 			}
        // 		}
        // 	});
        // 	this.TBalEmplExpandName = TBalEmplName;
        // 	this.TBalEmplExpand = TBalEmplDett;
        // }
        //***COSTO DEL PERSONALE FORECAST EXPAND***//
        this.TCeEmplExpand = this.aggrTCeEmplDett(this.information_card_anno, this.information_card_mese, true);

        // if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
        // 	this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((TCeEmpl: any) => {
        // 		if (TCeEmpl.Fyear == this.information_card_anno && TCeEmpl.Fmonth == this.information_card_mese) {
        // 			TCeEmplDett.forEach((dettaglio: any) => {
        // 				if (TCeEmpl.CostProfile == dettaglio.CostProfile) {
        // 					check_TCeEmplDett = true;
        // 					let value = parseFloat(TCeEmpl.Value) + parseFloat(dettaglio.Value);
        // 					value = Math.round((value + Number.EPSILON) * 100) / 100;
        // 					let quantity = parseFloat(TCeEmpl.Quantity) + parseFloat(dettaglio.Quantity);
        // 					quantity = Math.round((quantity + Number.EPSILON) * 100) / 100;
        // 					dettaglio.Value = value.toString();
        // 					dettaglio.Quantity = quantity.toString();
        // 				}
        // 			});
        // 			if (check_TCeEmplDett == false) {
        // 				TCeEmplDett.push({
        // 					CostProfile: TCeEmpl.CostProfile,
        // 					DailyCost: TCeEmpl.DailyCost,
        // 					Fmonth: TCeEmpl.Fmonth,
        // 					Fyear: TCeEmpl.Fyear,
        // 					IdRow: TCeEmpl.IdRow,
        // 					ParentIdRow: TCeEmpl.ParentIdRow,
        // 					Quantity: TCeEmpl.Quantity,
        // 					Value: TCeEmpl.Value,
        // 				});
        // 			} else {
        // 				check_TCeEmplDett = false;
        // 			}
        // 		}
        // 	});
        // 	this.TCeEmplExpand = TCeEmplDett;
        // }
    }

    //**************************EXPROT EXCEL DETTAGLIO**********************//
    data: any = [];

    exportDettagliConsuntivo() {
        this.data = [];
        if (this.dataWBsDetail.data.EsBalance.TBalEmpl.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalEmpl.forEach((item: any) => {
                if (item.Fyear == this.select_year) {
                    this.data.push({
                        Wbs: this.wbs,
                        Descrizione: this.descrWbs,
                        Anno: item.Fyear,
                        Mese: item.Fmonth,
                        VoceCosto: 'COSTO DEL PERSONALE',
                        Nome: item.Name,
                        Dettaglio: '',
                        ProfiloCosto: item.CostProfile,
                        GG: item.Quantity,
                        Valore: item.Value,
                    });
                }
            });
        }
        if (this.dataWBsDetail.data.EsBalance.TBalCons.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalCons.forEach((item: any) => {
                if (item.Fyear == this.select_year) {
                    this.data.push({
                        Wbs: this.wbs,
                        Descrizione: this.descrWbs,
                        Anno: item.Fyear,
                        Mese: item.Fmonth,
                        VoceCosto: 'CONSULENZE',
                        Nome: item.DescSupplier,
                        Dettaglio: item.Description,
                        ProfiloCosto: '',
                        GG: '',
                        Valore: item.Value,
                    });
                }
            });
        }
        if (this.dataWBsDetail.data.EsBalance.TBalCe.length != 0) {
            this.dataWBsDetail.data.EsBalance.TBalCe.forEach((item: any) => {
                if (item.Fyear == this.select_year && item.CeDetType == 'G') {
                    this.data.push({
                        Wbs: this.wbs,
                        Descrizione: this.descrWbs,
                        Anno: item.Fyear,
                        Mese: item.Fmonth,
                        VoceCosto: item.DescrCe,
                        Nome: '',
                        Dettaglio: '',
                        ProfiloCosto: '',
                        GG: '',
                        Valore: item.Value,
                    });
                }
            });
        }
        // SEPARO I VALORI DECIMALI CON LA VIRGOLA
        if (this.data.length != 0) {
            this.data.forEach((data: any) => {
                if (data.GG != '') {
                    data.GG = parseFloat(data.GG).toFixed(2).toString(); // always two decimal digits
                    data.GG = data.GG.replace('.', ',');
                    data.GG = data.GG.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                }
                if (data.Valore != '') {
                    data.Valore = parseFloat(data.Valore).toFixed(2).toString();
                    data.Valore = data.Valore.replace('.', ',');
                    data.Valore = data.Valore.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                }
            });
        }
        this.excelService.exportAsExcelFile(this.data, 'Dettaglio_Consuntivo');
    }

    exportDettagliForecast() {
        this.data = [];
        if (this.dataWBsDetail.data.EsForecast.TCeEmpl.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCeEmpl.forEach((item: any) => {
                if (item.Fyear == this.select_year) {
                    this.data.push({
                        Wbs: this.wbs,
                        Descrizione: this.descrWbs,
                        Anno: item.Fyear,
                        Mese: item.Fmonth,
                        VoceCosto: 'COSTO DEL PERSONALE',
                        Nome: '',
                        ProfiloCosto: item.CostProfile,
                        Note: item.Description,
                        GG: item.Quantity,
                        Valore: item.Value,
                    });
                }
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCeCons.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCeCons.forEach((item: any) => {
                if (item.Fyear == this.select_year) {
                    this.data.push({
                        Wbs: this.wbs,
                        Descrizione: this.descrWbs,
                        Anno: item.Fyear,
                        Mese: item.Fmonth,
                        VoceCosto: 'CONSULENZA TECNICA',
                        Nome: item.DescSupplier,
                        ProfiloCosto: '',
                        Note: item.Description,
                        GG: item.Quantity,
                        Valore: item.Value,
                    });
                }
            });
        }
        if (this.dataWBsDetail.data.EsForecast.TCostElement.length != 0) {
            this.dataWBsDetail.data.EsForecast.TCostElement.forEach((item: any) => {
                if (item.Fyear == this.select_year && item.CeDetType == 'G') {
                    this.data.push({
                        Wbs: this.wbs,
                        Descrizione: this.descrWbs,
                        Anno: item.Fyear,
                        Mese: item.Fmonth,
                        VoceCosto: item.DescrCe,
                        Nome: '',
                        ProfiloCosto: '',
                        Note: item.Description,
                        GG: '',
                        Valore: item.Value,
                    });
                }
            });
        }
        if (this.data.length != 0) {
            this.data.forEach((data: any) => {
                if (data.GG != '') {
                    data.GG = parseFloat(data.GG).toFixed(2).toString(); // always two decimal digits
                    data.GG = data.GG.replace('.', ',');
                    data.GG = data.GG.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                }
                if (data.Valore != '') {
                    data.Valore = parseFloat(data.Valore).toFixed(2).toString();
                    data.Valore = data.Valore.replace('.', ',');
                    data.Valore = data.Valore.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                }
            });
        }
        this.excelService.exportAsExcelFile(this.data, 'Dettaglio_Forecast');
    }

    ngOnDestroy() {
        this.session_dataWBsDetail(this.storageService.secureStorage.getItem('change_forecast') ?? 'false');
        this.checkForecastCostoPerForm(false);
        this.checkConsulenzaTecnicaForm(false);
        this.checkVociDiCostoForm(false);
    }

    // Se non dovessero funzionare le modifiche nuove, questa è la funzione vecchia

    protected readonly Array = Array;
}
