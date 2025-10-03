import { Component, DoCheck, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WbsManagerService } from '../../services/wbs-manager.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {StorageService} from '../../../../utils/secureStorage';

@Component({
	selector: 'app-wbs-manager',
	templateUrl: './wbs-manager.component.html',
	styleUrls: ['./wbs-manager.component.scss'],
})
export class WbsManagerComponent implements OnInit {
	wbs: any;
	revType: any;
	isObject: Object = {};
	commToRead: any;
	dataWBsDetail: any = {};
	EsHeader: any = {};
	newList: any = [];
	role: any;
	action: any;
	EtPrcstList: any = [];
	EtSupplList: any = [];
	WbsCe: any = [];
	change_forecast: any;
	Costs: any;
	Revenues: any;
	NetWip: any;
	Billing: any;
	Profitability: any;
	change_dataWBsDetail: any;
	informationCards: any;
	lastConsMonth: any;
	lastConsYear: any;
	Costi: any;
	Ricavi: any;
	Marginalita: any;
	CostiFinire: any;
	// chatLenght: number = 0;
	openSid: boolean = true;

	constructor(
		private route: ActivatedRoute,
		private wbsManagerService: WbsManagerService,
		private modalService: NgbModal,
		private storageService: StorageService
	) {}

	ngOnInit() {
		this.wbs = this.storageService.secureStorage.getItem('wbs');
		// dato preso dal work-space, per farmi passare il CommToRead presente nella chiamata getWBSList
		this.commToRead = this.storageService.secureStorage.getItem('CommToRead');
		this.role = this.storageService.secureStorage.getItem('role');
		this.revType = this.storageService.secureStorage.getItem('revType');
		this.action = this.storageService.secureStorage.getItem('action');
		this.change_forecast = this.storageService.secureStorage.getItem('change_forecast');
		this.change_dataWBsDetail = JSON.parse(this.storageService.secureStorage.getItem('dataWBsDetail'));
		this.informationCards = JSON.parse(this.storageService.secureStorage.getItem('informationCards'));

		this.isObject = {
			Header: 'X',
			Acr: 'X',
			Balance: 'X',
			Forecast: 'X',
			FcVersn: null,
			Communications: 'X',
			Versions: 'X',
			ProfCtr: 'X'
		};
		
		this.function_getWbsDetail();
	}

	changeDataWBbsDetail(dataWbsUpdated: any) {
		this.dataWBsDetail = { ...dataWbsUpdated };
	}

	textTipFatturazione(textInput: string) {
		switch (textInput) {
			case 'P':
				return 'Posticipata';
			case 'A':
				return 'Anticipata';
			default:
				return textInput;
		}
	}

	textFreqFatturazione(textInput: string) {
		switch (textInput) {
			case '01':
				return 'Mensile';
			case '02':
				return 'Bimestrale';
			case '03':
				return 'Trimestrale';
			case '04':
				return 'Quadrimestrale';
			case '06':
				return 'Semestrale';
			case '12':
				return 'Annuale';
			case '99':
				return 'Pluriennale';
			default:
				return textInput;
		}
	}

	getPerformanceDetail(EsHeader: any) {
		if (EsHeader.Performance === '0' || EsHeader.Performance === 0) {
			EsHeader.neutral = true;
		}
		if (EsHeader.Performance === '1' || EsHeader.Performance === 1) {
			EsHeader.red = true;
		}
		if (EsHeader.Performance === '2' || EsHeader.Performance === 2) {
			EsHeader.orange = true;
		}
		if (EsHeader.Performance === '3' || EsHeader.Performance === 3) {
			EsHeader.green = true;
		}
	}

	// APPARE INFORMATION CLIENTE
	public appare_cliente = true;
	public information_cliente() {
		this.appare_cliente = false;
	}
	public close_information_cliente() {
		this.appare_cliente = true;
	}
	// APPARE INFORMATION MATKET UNIT
	public appare_marketUnit = true;
	public information_marketUnit() {
		this.appare_marketUnit = false;
	}
	public close_information_marketUnit() {
		this.appare_marketUnit = true;
	}
	// APPARE INFORMATION DIGITAL FACTORY
	public appare_digitalFactory = true;
	public information_digitalFactory() {
		this.appare_digitalFactory = false;
	}
	public close_information_digitalFactory() {
		this.appare_digitalFactory = true;
	}
	// VARIABILI APPARE COMPONENTI ACR , FORECAST E COMUNICAZIONI
	public appare_forecast = false;
	public appare_comunicazioni = false;
	public appare_acr = true;
	public appare_tariffe = false;
	public appare_costiForecast = false;

	public saveMessLett(date: any) {
		this.commToRead = '0';
	}

	public viewCommToRead() {
		return this.commToRead === '0' ? null : `(${this.commToRead})`;
	}

	public sidebarOpen() {
		return (this.openSid = !this.openSid);
	}

	// FUNZIONE APPARE ACR
	public click_acr() {
		this.change_forecast = this.storageService.secureStorage.getItem('change_forecast');
		this.change_dataWBsDetail = JSON.parse(this.storageService.secureStorage.getItem('dataWBsDetail'));
		this.informationCards = JSON.parse(this.storageService.secureStorage.getItem('informationCards'));
		if (this.change_forecast == 'true') {
			this.dataWBsDetail = this.change_dataWBsDetail;
		}
		// else {
		//   this.function_getWbsDetail();
		// }
		this.appare_acr = true;
		this.appare_tariffe = false;
		this.appare_forecast = false;
		this.appare_comunicazioni = false;
		this.appare_costiForecast = false;
	}

	public click_tariffe() {
		this.change_forecast = this.storageService.secureStorage.getItem('change_forecast');
		this.change_dataWBsDetail = JSON.parse(this.storageService.secureStorage.getItem('dataWBsDetail'));
		this.informationCards = JSON.parse(this.storageService.secureStorage.getItem('informationCards'));
		if (this.change_forecast == 'true') {
			this.dataWBsDetail = this.change_dataWBsDetail;
		}
		this.appare_acr = false;
		this.appare_tariffe = true;
		this.appare_forecast = false;
		this.appare_comunicazioni = false;
		this.appare_costiForecast = false;
	}

	// FUNZIONE APPARE FORECAST
	public click_forecast() {
		this.change_forecast = this.storageService.secureStorage.getItem('change_forecast');
		this.change_dataWBsDetail = JSON.parse(this.storageService.secureStorage.getItem('dataWBsDetail'));
		this.informationCards = JSON.parse(this.storageService.secureStorage.getItem('informationCards'));
		if (this.change_forecast == 'true') {
			this.dataWBsDetail = this.change_dataWBsDetail;
		}
		// else {
		//   this.function_getWbsDetail();
		// }
		this.appare_acr = false;
		this.appare_tariffe = false;
		this.appare_forecast = true;
		this.appare_comunicazioni = false;
		this.appare_costiForecast = false;
	}
	// FUNZIONE APPARE COMUNICAZIONI
	public click_comunicazioni() {
		this.change_forecast = this.storageService.secureStorage.getItem('change_forecast');
		this.change_dataWBsDetail = JSON.parse(this.storageService.secureStorage.getItem('dataWBsDetail'));
		this.informationCards = JSON.parse(this.storageService.secureStorage.getItem('informationCards'));
		// servizio per settaggio messaggi a "letto"
		this.wbsManagerService.setWbsReadComm(this.wbs).subscribe((response: any) => {
			console.log('setWbsReadComm', response);
		});

		if (this.change_forecast == 'true') {
			this.dataWBsDetail = this.change_dataWBsDetail;
		}
		// else {
		//   this.function_getWbsDetail();
		// }
		this.appare_acr = false;
		this.appare_tariffe = false;
		this.appare_forecast = false;
		this.appare_comunicazioni = true;
		this.appare_costiForecast = false;
	}
	// FUNZIONE APPARE COSTI FORCAST
	public click_costiForecast() {
		this.appare_acr = false;
		this.appare_tariffe = false;
		this.appare_forecast = false;
		this.appare_comunicazioni = false;
		this.appare_costiForecast = true;
	}

	function_getWbsDetail() {
		this.wbsManagerService.getWBSDetail(this.wbs, this.isObject).subscribe((response: any) => {
			this.dataWBsDetail = response;
			this.month_Year();
			this.EsHeader = response.data.EsHeader;
			this.Profitability = this.EsHeader.Profitability;
			// Valorizzazione campi Performance
			this.Costs = this.dataWBsDetail.data.EsBalance?.Costs;
			this.Revenues = this.dataWBsDetail.data.EsBalance?.Revenues;
			this.NetWip = this.dataWBsDetail.data.EsBalance?.NetWip;
			this.Billing = this.dataWBsDetail.data.EsBalance?.Billing;
			// Valorizzazione campi previsione aggiornata
			this.Costi = this.dataWBsDetail.data.EsForecast.Costs;
			this.Ricavi = this.dataWBsDetail.data.EsForecast.Revenues;
			this.Marginalita = this.dataWBsDetail.data.EsForecast.Profitability;
			this.CostiFinire = this.dataWBsDetail.data.EsForecast.EndCosts;
			this.getPerformanceDetail(response.data.EsHeader);
			this.wbsManagerService.passDataToAcr(response);

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
		});
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

	// VARIABILE BOREDER NAVBAR
	public border_bottom = {
		border: 'solid',
		'border-left': 'none',
		'border-right': 'none',
		'border-top': 'none',
		'border-bottom-color': '#0D67D0',
	};
	public word_navbar = { color: '#0D67D0' };
}
