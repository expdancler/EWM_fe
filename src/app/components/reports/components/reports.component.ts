import {Component, OnInit, ViewChild} from '@angular/core';
import {WbsManagerService} from '../../wbs-manager/services/wbs-manager.service';
import {ExcelService} from '../services/excel.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import 'anychart';
import * as $ from 'jquery';
import * as Flexmonster from 'flexmonster';
import moment from 'moment/moment';
import {StorageService} from '../../../utils/secureStorage';

@Component({
	selector: 'app-reports',
	templateUrl: './reports.component.html',
	styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
	@ViewChild('closebutton') closebutton: any;

	// L'ordine è specifico, quindi cambia i campi (o la loro posizione) solo se richiesto
	fieldsBaseDefaultShown: string[] = [
		'Wbs', 'DescrWbs', 'Customer','Account', 'Rac', 'ProjectManager',
		'Marketunit', 'DigitalFactory', 'DescrDlvctr', 'Currency',
	]
	fieldsBaseReport: string[] = [
		// 'Wbs','DescrWbs','Customer','Account', 'Rac', 'ProjectManager', 'Marketunit', 'DigitalFactory', 'DescrDlvctr', 'Currency',
		this.fieldsBaseDefaultShown[0],this.fieldsBaseDefaultShown[1],this.fieldsBaseDefaultShown[2],
		'DescrCustomer','StartDate','EndDate',
		this.fieldsBaseDefaultShown[3],this.fieldsBaseDefaultShown[4],this.fieldsBaseDefaultShown[5],
		this.fieldsBaseDefaultShown[6],'DescrMarket',this.fieldsBaseDefaultShown[7],'DescrDf','DeliveryCenter',
		this.fieldsBaseDefaultShown[8],'RevType', 'DescrRevType','DescrBusinessProj','Opportunity',
		'DescrOpp','SfOpp','SfQuote','SfProd','FlagCq', 'DescrFlagCq','Itembudget','DescrItembudget',
		'Performoblig','DescrPerformoblig','OfferNumber','CtrNum', 'CtrStartDate','CtrEndDate','DescrCtr',
		this.fieldsBaseDefaultShown[9],'Status','DescrStatus','SendPerio','SendDate','SendTime'
	];
	fieldsHdrMeasures: string[] = [
		'FcRevenues','FcCosts','FcCostsEmp','FcCostsCons','FcCostsOther','FcProfit',
		'EndCosts','BalRevenues','BalCosts','BalCostsEmp','BalCostsCons','BalCostsOther','BalProfit',
		'NetWip','Billing',
		'AcrRevenues','AcrCosts','AcrCostsEmp','AcrCostsCons','AcrCostsOther','AcrProfit',
	];
	fieldsHdr: string[] = [
		...this.fieldsHdrMeasures,
		'UpdDate', // 'UpdTime'
	];
	fieldsDateMeasures: string[] = [
		'FcRevenues','FcCosts','FcCostsEmp','FcCostsCons','FcCostsOther','FcProfit','EndCosts',
		'BalRevenues','BalCosts','BalCostsEmp','BalCostsCons','BalCostsOther','BalProfit',
		'NetWip', 'Billing',
	];
	fieldsDate: string[] = [
		'Wbs', 'Fyear',
		...this.fieldsDateMeasures,
	];
	fieldsYear: string[] = [
		...this.fieldsDate
	];
	fieldsMonth: string[] = [
		this.fieldsDate[0],this.fieldsDate[1],'Fmonth',
		...this.fieldsDateMeasures,
	];
	fieldsBalanceMeasures: string[] = [
		'CeValue'
	]
	fieldsBalance: string[] = [
		'Wbs','Fyear','Fmonth','CeDescr',this.fieldsBalanceMeasures[0],
		'Employee','Name','OrgUnit','CostProfile',
		'Supplier', 'SupplierDescr', 'SupplierText',
		'Orderno', 'Quantity',
	];
	fieldsForecastMeasures: string[] = [
		'CeValue', 'DailyCost',
	]
	fieldsForecast: string[] = [
		'Wbs','Fyear','Fmonth','CeDescr', this.fieldsForecastMeasures[0],
		'CostProfile','Supplier','SupplierDescr','Description',
		this.fieldsForecastMeasures[1],'Quantity',
	];
	fieldsAcrMeasures: string[] = [
		'CeValue'
	]
	fieldsAcr: string[] = [
		'Wbs','CeDescr',
		...this.fieldsAcrMeasures,
	];
	fieldsBillingMeasures: string[] = [
		'Value'
	]
	fieldsBilling: string[] = [
		'Wbs','Fyear','Fmonth','Invoice','BillDate',
		...this.fieldsBillingMeasures,
	];

	allFields: any = {
		Hdr: this.fieldsHdr,
		Fy: this.fieldsYear,
		Fm: this.fieldsMonth,
		Bal: this.fieldsBalance,
		For: this.fieldsForecast,
		Acr: this.fieldsAcr,
		Bil: this.fieldsBilling,
	}
	allCaptionFields: any = {
		Wbs: {
			caption: 'Wbs',
		},
		DescrBusinessProj: {
			caption: 'Dett. tipologia WBS',
		},
		Opportunity: {
			caption: 'Opportunità Commerciale',
		},
		DescrOpp: {
			caption: 'Descrizione Opportunità',
		},
		SfOpp: {
			caption: 'Opportunità Salesforce',
		},
		SfQuote: {
			caption: 'Quote Salesforce',
		},
		SfProd: {
			caption: 'Prodotto Salesforce',
		},
		DescrFlagCq: {
			caption: 'Tipo di Contratto',
		},
		Itembudget: {
			caption: 'Item di Budget',
		},
		DescrItembudget: {
			caption: 'Descrizione Item di Budget',
		},
		Performoblig : {
			caption : 'Performance Obligation'
		},
		DescrPerformoblig: {
			caption: 'Descr. Performance Obligation',
		},
		OfferNumber: {
			caption: 'Numero Offerta',
		},
		CtrNum: {
			caption: 'Numero Contratto',
		},
		CtrStartDate: {
			caption: 'Inizio Validità',
		},
		CtrEndDate: {
			caption: 'Fine Validità',
		},
		DescrCtr: {
			caption: 'Descrizione Contratto',
		},
		DescrWbs: {
			caption: 'Descrizione WBS',
		},
		Customer: {
			caption: 'Codice Cliente',
		},
		DescrCustomer: {
			caption: 'Cliente',
		},
		StartDate: {
			caption: 'WBS Inizio',
		},
		EndDate: {
			caption: 'WBS Fine',
		},
		Rac: {
			caption: 'RAC',
		},
		ProjectManager: {
			caption: 'Project Manager',
		},
		Marketunit: {
			caption: 'Mercato',
		},
		DescrMarket: {
			caption: 'Descr. Account Unit',
		},
		DigitalFactory: {
			caption: 'Digital Factory',
		},
		DescrDf: {
			caption: 'Descr. DF',
		},
		DeliveryCenter: {
			caption: 'CdC',
			type: 'string',
		},
		DescrDlvctr: {
			caption: 'Descr. CdC',
		},
		Currency: {
			caption: 'Valuta',
		},
		DescrStatus: {
			caption: 'Descr. Stato WBS',
		},
		SendPerio: {
			caption: 'Periodo di invio',
		},
		SendDate: {
			caption: 'Data di invio',
		},
		SendTime: {
			caption: 'Ora di invio',
		},
		FcRevenues: {
			caption: 'Ricavi Forecast',
			type: 'number',
		},
		FcCosts: {
			caption: 'Costi Forecast',
			type: 'number',
		},
		FcCostsEmp: {
			caption: 'Costi del personale Forecast',
			type: 'number'
		},
		FcCostsCons: {
			caption: 'Costi di consulenza Forecast',
			type: 'number'
		},
		FcCostsOther: {
			caption: 'Altri costi Forecast',
			type: 'number'
		},
		FcProfit: {
			caption: 'Marginalità Forecast',
			type: 'number',
		},
		EndCosts: {
			caption: 'Costi a finire',
			type: 'number'
		},
		BalRevenues: {
			caption: 'Ricavi Consuntivo',
			type: 'number',
		},
		BalCosts: {
			caption: 'Costi Consuntivo',
			type: 'number',
		},
		BalCostsEmp: {
			caption: 'Costi del personale Consuntivo',
			type: 'number',
		},
		BalCostsCons: {
			caption: 'Costi di consulenza Consuntivo',
			type: 'number',
		},
		BalCostsOther: {
			caption: 'Altri costi Consuntivo',
			type: 'number',
		},
		BalProfit: {
			caption: 'Marginalità Consuntivo',
			type: 'number',
		},
		NetWip: {
			caption: 'W.I.P. Netto',
			type: 'number',
		},
		Billing: {
			caption: 'Fatturato',
			type: 'number'
		},
		AcrRevenues: {
			caption: 'Ricavi ACR',
			type: 'number',
		},
		AcrCosts: {
			caption: 'Costi ACR',
			type: 'number',
		},
		AcrCostsEmp: {
			caption: 'Costi del personale ACR',
			type: 'number',
		},
		AcrCostsCons: {
			caption: 'Costi di consulenza ACR',
			type: 'number',
		},
		AcrCostsOther: {
			caption: 'Altri costi ACR',
			type: 'number',
		},
		AcrProfit: {
			caption: 'Marginalità ACR',
			type: 'number',
		},
		UpdDate: {
			caption: 'Data ultimo aggior.'
		},
		UpdTime: {
			caption: 'Ora ultimo aggior.',
		},
		Fyear: {
			caption: 'Esercizio',
			type: 'string',
		},
		Fmonth: {
			caption: 'Periodo',
			type: 'string',
		},
		RevType: {
			caption: 'Cod.Tip.WBS'
		},
		DescrRevType: {
			caption: 'Descr.Tip.WBS'
		},
		FlagCq: {
			caption: 'Tipo Contratto'
		},
		Status: {
			caption: 'Codice Stato WBS'
		},
		Account: {
			caption: 'Account',
		},
		CeDescr: {
			caption: 'Voce di Costo',
		},
		CeValue: {
			caption: 'Importo',
			type: 'number'
		},
		Employee: {
			caption: 'CID dipendente',
		},
		Name: {
			caption: 'Nominativo dipendente'
		},
		OrgUnit: {
			caption: 'Unità organizz. dipendente',
		},
		CostProfile: {
			caption: 'Profilo di costo',
		},
		Supplier: {
			caption: 'Fornitore',
		},
		SupplierDescr: {
			caption: 'Nome Fornitore'
		},
		SupplierText: {
			caption: 'Descr. Fornitore'
		},
		Orderno: {
			caption: 'Numero Ordine',
		},
		Quantity: {
			caption: 'Quantità',
			type: 'number'
		},
		Description: {
			caption: 'Descrizione',
		},
		DailyCost: {
			caption: 'Costo giornaliero',
			type: 'number',
		},
		Invoice: {
			caption: 'N. Fattura'
		},
		BillDate: {
			caption: 'Data',
		},
		Value: {
			caption: 'Importo',
			type: 'number',
		}
	}

	reportDataOrig: any = [];
	option_selectAnnoReport: any = [];
	/// var per servizio flexMonster
	ELayoutJson: any;
	confirmName: any = '';
	//var modale
	clickButtonLayout = '';

	isActive: string = '';
	ReportDetail: any = {};

	private pivot: any = {};

	listWbs: any = [];
	layoutName = '';
	private layoutDescr = '';
	selectLayout: any;
	paramPivotMarket: string[] = this.fieldsBaseReport;
	valueSelctedPeriod: string = `${new Date().getFullYear() - 1}-01-01`; //`${new Date().getFullYear()}-01-01`;

	sectionList = 'EtRepHdr'; //EtRepList
	sapDataReport = 'ZewmRepGetdata'; //'ZewmRepGetlist';
	sapWbsList = 'ZewmWbsGetlist';

	constructor(
		private wbsManagerService: WbsManagerService,
		private excelService: ExcelService,
		private spinner: NgxSpinnerService,
		private activatedRoute: ActivatedRoute,
		private modalService: NgbModal,
		private formBuilder: FormBuilder,
		private storageService: StorageService
	) {}

	searchForm = this.formBuilder.group({
		merc_BD: true,
		merc_AA: true,
		merc_AI: true,
		merc_AU: true,
		merc_DSCA: true,
		merc_DSNA: true,
		merc_OG: true,
		int_temp: '1',
	});

	periodoSelezione: any[] = [
		{value: `${new Date().getFullYear()}-01-01`, label: 'Anno in corso'},
		{value: `${new Date().getFullYear() - 1}-01-01`, label: 'Ultimi 2 anni'},
		{value: '', label: 'Tutto'}
	];

	onChangePeriod({value}: any) {
		this.valueSelctedPeriod = value;
		this.wbsReport(); // rifaccio la chiamat wbsReport
	}

	prepareDataToExport(itemList: any[], fields: string[], measures: string[]){
		var elaboredData = itemList?.map((item: any) => {
			let temp: any = {};
			fields.forEach((col: string) => {
				let colCaption: string = this.allCaptionFields[col]?.caption ?? col;
				temp[colCaption] = measures.includes(col) && item[col] ? parseFloat(item[col]) : item[col];
			})
			return temp;
		});

		return elaboredData;
	}

	exportAllDataAsXLSX(): void {
		this.wbsManagerService.getCompleteWbsReport(this.valueSelctedPeriod).subscribe((response: any) => {
			var dataToExport: any = {};
			const fieldsHdr = this.getDetailArray(this.fieldsBaseReport, this.fieldsHdr);

			dataToExport.Hdr = this.prepareDataToExport(response.data.EtRepHdr, fieldsHdr, this.fieldsHdrMeasures);
			dataToExport.Fy = this.prepareDataToExport(response.data.EtRepYea, this.fieldsYear, this.fieldsDateMeasures);
			dataToExport.Fm = this.prepareDataToExport(response.data.EtRepMon, this.fieldsMonth, this.fieldsDateMeasures);
			dataToExport.Bal = this.prepareDataToExport(response.data.EtRepBal, this.fieldsBalance, this.fieldsBalanceMeasures);
			dataToExport.For = this.prepareDataToExport(response.data.EtRepFcs, this.fieldsForecast, this.fieldsForecastMeasures);
			dataToExport.Acr = this.prepareDataToExport(response.data.EtRepAcr, this.fieldsAcr, this.fieldsAcrMeasures);
			dataToExport.Bil = this.prepareDataToExport(response.data.EtRepBil, this.fieldsBilling, this.fieldsBillingMeasures);

			// TODO dovresti rendere le date come date

			this.excelService.exportAllDataAsExcelFile(dataToExport, 'WBS-Manager');
		});
	}

	// Lista che restituisce tutti i Layout
	WbsFlexGetlist: any = [];
	ListLayoutName: any = [];
	ngSelectName: any = [];
	ngSelectUsers: any = [];
	layoutUserList: any = [];
	showLayout: boolean = false;
	EtWbsList: any = [];

	/**
	 * Richiama le informazioni sui layout
	 */
	getWbsFlexGetlist(section?: string) {
		this.ngSelectName = [];

		let sections: string[] = section ? [section] : ['Hdr', 'Fy', 'Fm', 'Bal', 'For', 'Acr', 'Bil'];
		sections.forEach((sec: string) => {
			this.wbsManagerService.getWbsFlexGetlist(this.typeTab+sec).subscribe((response: any) => {
				response.data.EtFlexList.forEach((item: any) => {
					this.ngSelectName = [...this.ngSelectName, {section: sec, name: item.LayoutName}];
				});

			});
		})
		// if (this.typeTab == this.sapDataReport) {
		//
		//
		// 	// this.ngSelectName = this.ListName;
		// }
		// else if (this.typeTab == this.sapWbsList) {
		// 	this.wbsManagerService.getWbsFlexGetlist(this.typeTab).subscribe(response => {
		// 		this.WbsFlexGetlist = response;
		// 		this.WbsFlexGetlist.data.EtFlexList.forEach((item: any) => {
		// 			this.ListName.push(item.LayoutName);
		// 		});
		// 		this.ngSelectName = this.ListName;
		// 	});
		// }
	}

	getWBSList() {
		let wbsList: any = {
			stato: '0',
			wbs: null,
			descrizione: null,
			cliente: null,
			dataInizio: null,
			dataFine: null,
		};
		this.wbsManagerService.getWBSList(wbsList).subscribe(response => {
			this.EtWbsList = response.data[this.sectionList];
			this.EtWbsList.forEach((item: any) => {
				if (item.Status == '0') {
					item.Status = 'In Attesa';
				} else if (item.Status == '1') {
					item.Status = 'Attiva';
				} else if (item.Status == '2') {
					item.Status = 'Chiusa';
				}
			});
		});
	}

	ngOnInit(): void {
		this.wbsManagerService.getEmplList(moment().format('YYYY-MM-DD')).subscribe((response: any) => {
			this.ngSelectUsers = response.data?.EtEmplList?.map((emp: any) => {
				return { Uname: emp.Uname, Name: emp.Name, Mail: emp.Mail, full: emp.Uname+emp.Name+emp.Mail }
			})
		});

		// Così verranno mostrati anche campi non mappati (per qualunque motivo)
		this.fieldsBaseReport.forEach((col: string) => this.allCaptionFields[col] ? null : this.allCaptionFields[col] = { caption: col });
		this.fieldsHdr.forEach((col: string) => this.allCaptionFields[col] ? null : this.allCaptionFields[col] = { caption: col });
		this.fieldsAcr.forEach((col: string) => this.allCaptionFields[col] ? null : this.allCaptionFields[col] = { caption: col });
		this.fieldsBalance.forEach((col: string) => this.allCaptionFields[col] ? null : this.allCaptionFields[col] = { caption: col });
		this.fieldsBilling.forEach((col: string) => this.allCaptionFields[col] ? null : this.allCaptionFields[col] = { caption: col });
		this.fieldsYear.forEach((col: string) => this.allCaptionFields[col] ? null : this.allCaptionFields[col] = { caption: col });
		this.fieldsMonth.forEach((col: string) => this.allCaptionFields[col] ? null : this.allCaptionFields[col] = { caption: col });
		this.fieldsForecast.forEach((col: string) => this.allCaptionFields[col] ? null : this.allCaptionFields[col] = { caption: col });

		this.wbsReport();
	}

	wbsReport(){
		this.wbsManagerService.getCompleteWbsReport(this.valueSelctedPeriod).subscribe((response: any) => {
			var ethis = this;
			var detailRows: any = { Hdr: [], Fy: [], Fm: [], Bal: [], For: [], Acr: [], Bil: [] };

			response.data[this.sectionList].forEach((header: any) => {
				var cleanHeader: any = {};
				// Così prendo soltanto i campi 'base' che verranno uniti a quelli 'specifici'
				// (e avrò tutti quelli che 'potranno' essere mostrati)
				this.fieldsBaseReport.forEach((col: string) => cleanHeader[col] = header[col]);

				response.data?.EtRepYea?.filter((row: any) => row.Wbs === header.Wbs)?.forEach((row: any) => detailRows.Fy.push({...cleanHeader, ...row}));
				response.data?.EtRepMon?.filter((row: any) => row.Wbs === header.Wbs)?.forEach((row: any) => detailRows.Fm.push({...cleanHeader, ...row}));
				response.data?.EtRepBal?.filter((row: any) => row.Wbs === header.Wbs)?.forEach((row: any) => detailRows.Bal.push({ ...cleanHeader, ...row }));
				response.data?.EtRepFcs?.filter((row: any) => row.Wbs === header.Wbs)?.forEach((row: any) => detailRows.For.push({...cleanHeader, ...row}));
				response.data?.EtRepAcr?.filter((row: any) => row.Wbs === header.Wbs)?.forEach((row: any) => detailRows.Acr.push({...cleanHeader, ...row}));
				response.data?.EtRepBil?.filter((row: any) => row.Wbs === header.Wbs)?.forEach((row: any) => detailRows.Bil.push({ ...cleanHeader, ...row }));
			});

			this.ReportDetail.Bil = detailRows.Bil.map((row: any)=> {
				this.fieldsBillingMeasures.forEach((col: string) => row[col] = (Math.round((parseFloat(row[col]) + Number.EPSILON) * 100) / 100));
				return row;
			});
			this.ReportDetail.Bal = detailRows.Bal.map((row: any)=> {
				this.fieldsBalanceMeasures.forEach((col: string) => row[col] = (Math.round((parseFloat(row[col]) + Number.EPSILON) * 100) / 100));
				return row;
			});
			this.ReportDetail.Fy = detailRows.Fy.map((row: any)=> {
				this.fieldsDateMeasures.forEach((col: string) => row[col] = (Math.round((parseFloat(row[col]) + Number.EPSILON) * 100) / 100));
				return row;
			});
			this.ReportDetail.Fm = detailRows.Fm.map((row: any)=> {
				this.fieldsDateMeasures.forEach((col: string) => row[col] = (Math.round((parseFloat(row[col]) + Number.EPSILON) * 100) / 100));
				return row;
			});
			this.ReportDetail.Acr = detailRows.Acr.map((row: any)=> {
				this.fieldsAcrMeasures.forEach((col: string) => row[col] = (Math.round((parseFloat(row[col]) + Number.EPSILON) * 100) / 100));
				return row;
			});
			this.ReportDetail.For = detailRows.For.map((row: any)=> {
				this.fieldsForecastMeasures.forEach((col: string) => row[col] = (Math.round((parseFloat(row[col]) + Number.EPSILON) * 100) / 100));
				return row;
			});

			// Solo i dati relativi alle wbs (Hdr)
			this.ReportDetail.Hdr = response.data[this.sectionList].map(function (row: any) {
				var cleanRow: any = {};
				// In cleanRow mi porto soltanto i valori dei campi 'base'
				ethis.fieldsBaseReport.forEach((col: string) => cleanRow[col] = row[col]);
				// e poi ci aggiungo quelli relativi SOLO ai dati di testata
				ethis.fieldsHdr.forEach((col: string) => {
					if (ethis.fieldsHdrMeasures.includes(col))
						cleanRow[col] = (Math.round((parseFloat(row[col]) + Number.EPSILON) * 100) / 100)
					else
						cleanRow[col] = row[col]
				});

				return cleanRow;
			});

			this.tabPivot(this.fieldsHdr, 'Hdr');
			this.getWbsFlexGetlist();
			// this.getWBSList();

			this.reportDataOrig = response.data[this.sectionList];

			this.option_selectAnnoReport = response.data.EtYearList.map((item: any) => {
				return item.Fyear;
			});

		});
	}

	layoutNamefnt(name: any) {
		this.confirmName = '';
		this.layoutName = name.target.value;
	}

	layoutDescrfnt(descr: any) {
		this.layoutDescr = descr.target.value;
	}

	ngModelSelect: any;
	//-----FUNZIONI BUTTON LAYOUT
	savePivotTab() {
		var ebName = this.storageService.secureStorage.getItem("username_loggedUser") + "_" + this.layoutName;
		this.confirmName = '';
		if (this.layoutName == '' || this.layoutName == ' ') {
			this.confirmName = 'stringaVuota';
		}
		this.ngSelectName.forEach((item: any) => {
			if (ebName == item) {
				this.confirmName = 'nomeUguale';
			}
		});

		if (this.confirmName == '') {
			const save = this.pivot.getReport();
			const layoutOBJECT = {
				options: save.options,
				formats: save.formats,
				slice: save.slice,
				allConditions: this.pivot.getAllConditions(),
			};

			// Se non esiste l'options lo creo
			if (layoutOBJECT.options === undefined) {
				layoutOBJECT.options = { grid: { type: '', showGrandTotals: 'on', showTotals: 'on' } };
			} else {
				if (layoutOBJECT.options.grid.type === undefined) {
					layoutOBJECT.options.grid.type = ''; // value di default
				}
				if (layoutOBJECT.options.grid.showGrandTotals === undefined) {
					layoutOBJECT.options.grid.showGrandTotals = 'on'; // value di default
				}
				if (layoutOBJECT.options.grid.showTotals === undefined) {
					layoutOBJECT.options.grid.showTotals = 'on'; // value di default
				}
			}
			const layoutJSON = JSON.stringify(layoutOBJECT);

			[ { Uname: this.storageService.secureStorage.getItem("username_loggedUser") }, ...this.layoutUserList].forEach((user: any) => {
				this.wbsManagerService
					.getWbsFlexSave(ebName, this.layoutDescr, layoutJSON, this.typeTab+this.isActive, user.Uname)
					.subscribe(() => {
						this.getWbsFlexGetlist();
						this.ngModelSelect = {section: this.isActive, name: ebName};
						this.closebutton.nativeElement.click();
					});
			})
		}
	}

	svrLayout() {
		const save = this.pivot.getReport();
		const layoutOBJECT = {
			options: save.options,
			formats: save.formats,
			slice: save.slice,
			allConditions: this.pivot.getAllConditions(),
		};

		// Se non esiste l'options lo creo
		if (layoutOBJECT.options === undefined) {
			layoutOBJECT.options = { grid: { type: '', showGrandTotals: 'on', showTotals: 'on' } };
		} else {
			if (layoutOBJECT.options.grid.type === undefined) {
				layoutOBJECT.options.grid.type = ''; // value di default
			}
			if (layoutOBJECT.options.grid.showGrandTotals === undefined) {
				layoutOBJECT.options.grid.showGrandTotals = 'on'; // value di default
			}
			if (layoutOBJECT.options.grid.showTotals === undefined) {
				layoutOBJECT.options.grid.showTotals = 'on'; // value di default
			}
		}

		const layoutJSON = JSON.stringify(layoutOBJECT);
		this.wbsManagerService.getWbsFlexSave(this.ngModelSelect.name, this.layoutDescr, layoutJSON, this.typeTab+this.isActive).subscribe();
	}

	delateLayout() {
		if (this.ngModelSelect != undefined) {
			this.wbsManagerService.getWbsFlexDelete(this.ngModelSelect.name, this.typeTab+this.isActive).subscribe(response => {
				this.getWbsFlexGetlist();
				this.ngModelSelect = 'Selezione Layout';
				if (this.typeTab == this.sapDataReport) {
					this.tabPivot(this.paramPivotMarket, this.isActive);
				}
				// else if (this.typeTab == this.sapWbsList) {
				// 	this.listWbsPivot();
				// }
			});
		}
	}

	getDetailFlexMonster(layout: any) {
		this.wbsManagerService.getWbsFlexGetdetail(layout, this.typeTab+this.isActive).subscribe(response => {
			this.ELayoutJson = response;
			let layoutOBJECT = JSON.parse(this.ELayoutJson.data.ELayoutJson);

			this.pivot.removeAllConditions();

			if (layoutOBJECT.allConditions != undefined) {
				layoutOBJECT.allConditions.forEach((item: any) => {
					this.pivot.addCondition(item);
				});
			}

			// pulizia dati sporchi del format
			for (let measure of this.pivot.getMeasures()) {
				this.pivot.setFormat({}, measure.uniqueName);
			}

			layoutOBJECT.formats.forEach((format: any) => {
				this.pivot.setFormat(format, 'Measures');
			});

			this.pivot.updateData({ data: this.ReportDetail[this.isActive] });
			// visualizzo le colonne slice
			this.pivot.runQuery(layoutOBJECT.slice);

			this.pivot.setOptions(layoutOBJECT.options);
			this.pivot.collapseAllData();
			this.pivot.refresh();
		});
	}
	// NG SELECT LAYOUT SALVATO
	layoutSalvato(layout: any) {
		this.isActive = layout.section;
		this.selectLayout = layout.name;
		this.getDetailFlexMonster(layout.name);
		// if (layout) this.tabPivot(this.allFields[layout.section], layout.section, false);
	}

	// NG SELECT UTENTI ASSOCIATI
	changeUserLayout(users: any[]){
		this.layoutUserList = [...users];
		// console.log(this.dataWBsDetail.data.EsProfCtr);
	}

	// custom menu, quando clicco con il taso destro nella tabella, aggiunte due nuove voci
	customizeFlexmonsterContextMenu = (items: any, data: any, viewType: any) => {
		if (viewType !== 'flat') {
			items.push({
				label: 'Expand all',
				handler: () => {
					console.log('expand data');
					this.pivot.expandAllData();
				},
			});

			items.push({
				label: 'Collapse all',
				handler: () => {
					console.log('callapse data');
					this.pivot.collapseAllData();
				},
			});
		}
		return items;
	};

	customizeToolbar(toolbar: any) {
		// get all tabs
		let tabs = toolbar.getTabs();

		toolbar.getTabs = function () {
			// remove the Save tab using its id
			tabs = tabs.filter((tab: any) => tab.id != 'fm-tab-save');
			tabs = tabs.filter((tab: any) => tab.id != 'fm-tab-connect');
			tabs = tabs.filter((tab: any) => tab.id != 'fm-tab-open');

			return tabs;
		};
	}

	getDetailArray(header: string[], details: string[]): any {
		var merged: string[] = [...header];

		details.forEach((col) => {
			if (!header.includes(col))
				merged.push(col);
		})

		// console.log(merged);
		return merged;
	}

	getMeasureArray(section?: string): any {
		var array: string[] = [];

		switch (section){
			case 'Hdr':
				array = [...this.fieldsHdrMeasures];
				break;
			case 'Fy':
				array = [...this.fieldsDateMeasures];
				break;
			case 'Fm':
				array = [...this.fieldsDateMeasures];
				break;
			case 'Bal':
				array = [...this.fieldsBalanceMeasures];
				break;
			case 'Bil':
				array = [...this.fieldsBillingMeasures];
				break;
			case 'For':
				array = [...this.fieldsForecastMeasures];
				break;
			case 'Acr':
				array = [...this.fieldsAcrMeasures];
				break;
			default:
				break;
		}

		return array;
	}

	// Mappa tutti i campi della sezione scelta
	getSectionCaptionFields(section: string){
		var captions: any = {};

		this.getDetailArray(this.fieldsBaseReport, this.allFields[section]).forEach(
			(field: string) =>
				captions[field] = this.allCaptionFields[field] ?? { caption: field }
		);

		return captions;
	}

	private typeTab: any = '';

	tabPivot(type: string[], section?: string, manual: boolean = true) {
		section ? this.isActive = section : this.isActive = 'Hdr';
		// Se arrivo qui da un click sulla sezione, togli il layout
		if (section && manual) this.ngModelSelect = {section: this.isActive, name: 'Selezione Layout'};
		this.typeTab = this.sapDataReport;

		// Ora non viene più separato per sezione, quindi basta una chiamata
		// this.getWbsFlexGetlist();

		let nowYear = new Date().getFullYear().toString();
		let beforeYear = (parseFloat(nowYear) - 1).toString();
		let report: any;

		this.showLayout = true;

		/*
		Se un campo è tra i dati ma non nella sezione 'row' non sarà
		mostrato a video ma sarà selezionabile dalla finestra 'fields'
		*/
		this.pivot = new Flexmonster({
			container: 'pivot-container',
			licenseKey: 'Z7F1-XF1J2E-3G0O36-1V2K2R-2F230O-2P5B32-3J712N-1S6702-1M5K14-0J',
			componentFolder: 'https://cdn.flexmonster.com/',
			toolbar: true,
			beforetoolbarcreated: this.customizeToolbar,
			customizeContextMenu: this.customizeFlexmonsterContextMenu,
			// altezza tabella
			height: 930,
			report: {
				dataSource: {
					data: this.ReportDetail[this.isActive],
					mapping: this.getSectionCaptionFields(this.isActive),
				},
				conditions: [],
				formats: [
					{
						thousandsSeparator: '.',
						decimalSeparator: ',',
						maxDecimalPlaces: 2,
						nullValue: '-',
						textAlign: 'right',
						isPercent: false,
					},
				],
				options: {
					viewType: 'grid',
					grid: {
						type: 'flat',
					},
				},
				slice: {
					rows: this.getDetailArray(this.fieldsBaseDefaultShown, type).map((row: string) => { return { uniqueName: row } }),
					columns: [
						{
							uniqueName: '[Measures]',
						},
					],
					// reportFilters: [
					// 	{
					// 		uniqueName: 'Fyear',
					// 		caption: 'Year',
					// 		filter: {
					// 			members: [nowYear, beforeYear],
					// 		},
					// 	},
					// 	{ uniqueName: 'Fmonth', caption: 'Month' },
					// ],
					measures: this.getMeasureArray(this.isActive).map((col: string) => { return { uniqueName: col, aggregation: 'sum'} }),
				},
			},
		});
	}

	// listWbsPivot() {
	// 	this.ngModelSelect = 'Selezione Layout';
	// 	this.typeTab = this.sapWbsList;
	// 	this.getWbsFlexGetlist();
	// 	this.pivot = new Flexmonster({
	// 		container: 'pivot-container',
	// 		licenseKey: 'Z7F1-XF1J2E-3G0O36-1V2K2R-2F230O-2P5B32-3J712N-1S6702-1M5K14-0J',
	// 		componentFolder: 'https://cdn.flexmonster.com/',
	// 		toolbar: true,
	// 		beforetoolbarcreated: this.customizeToolbar,
	// 		customizeContextMenu: this.customizeFlexmonsterContextMenu,
	// 		report: {
	// 			dataSource: {
	// 				data: this.EtWbsList,
	// 				mapping: {
	// 					ProfitCtr: {
	// 						type: 'string',
	// 						caption: 'Profit center',
	// 					},
	// 					Customer: {
	// 						type: 'string',
	// 						caption: 'Codice Cliente',
	// 					},
	// 					ActFyear: {
	// 						type: 'string',
	// 						caption: 'Anno ultima versione inviata',
	// 					},
	// 					ActFmonth: {
	// 						type: 'string',
	// 						caption: 'Mese ultima versione inviata',
	// 					},
	// 					Wbs: {
	// 						caption: 'Elemento WBS',
	// 					},
	// 					DescrWbs: {
	// 						caption: 'Descrizione WBS',
	// 					},
	// 					PmCode: {
	// 						caption: 'Codice PM',
	// 					},
	// 					ProjectManager: {
	// 						caption: 'Project Manage',
	// 					},
	// 					CompCode: {
	// 						caption: 'CompCode',
	// 					},
	// 					StartDate: {
	// 						caption: "Data di inizio prevista per l'elemento WBS",
	// 					},
	// 					EndDate: {
	// 						caption: 'Data di fine prevista elemento WBS',
	// 					},
	// 					DescrCustomer: {
	// 						caption: 'Descrizione Cliente',
	// 					},
	// 					Rac: {
	// 						caption: 'Responsabile amm.vo (RAC)',
	// 					},
	// 					Opportunity: {
	// 						caption: 'Codice Opportunità',
	// 					},
	// 					DescrBusinessProj: {
	// 						caption: 'Dett. tipologia WBS',
	// 					},
	// 					DescrOpp: {
	// 						caption: 'Descrizione Opportunità',
	// 					},
	// 					ActTime: {
	// 						caption: 'Ora invio',
	// 					},
	// 					Account: {
	// 						caption: 'Account',
	// 					},
	// 					Marketunit: {
	// 						caption: 'Market Unit',
	// 					},
	// 					DigitalFact: {
	// 						caption: 'Digital Factory',
	// 					},
	// 					Status: {
	// 						caption: 'Status',
	// 					},
	// 					ActDate: {
	// 						caption: 'Data invio',
	// 					},
	// 				},
	// 			},
	// 			conditions: [],
	// 			formats: [
	// 				{
	// 					thousandsSeparator: '.',
	// 					decimalSeparator: ',',
	// 					maxDecimalPlaces: 2,
	// 					nullValue: '-',
	// 					textAlign: 'right',
	// 				},
	// 			],
	// 			options: {
	// 				viewType: 'grid',
	// 				grid: {
	// 					type: 'flat',
	// 				},
	// 			},
	// 			slice: {
	// 				rows: [
	// 					{ uniqueName: 'Wbs' },
	// 					{ uniqueName: 'DescrWbs' },
	// 					{ uniqueName: 'ProjectManager' },
	// 					{ uniqueName: 'CompCode' },
	// 					{ uniqueName: 'ProfitCtr' },
	// 					{ uniqueName: 'StartDate' },
	// 					{ uniqueName: 'EndDate' },
	// 					{ uniqueName: 'Customer' },
	// 					{ uniqueName: 'DescrCustomer' },
	// 					{ uniqueName: 'Rac' },
	// 					{ uniqueName: 'Opportunity' },
	// 					{ uniqueName: 'DescrOpp' },
	// 					{ uniqueName: 'Account' },
	// 					{ uniqueName: 'Marketunit' },
	// 					{ uniqueName: 'DigitalFact' },
	// 					{ uniqueName: 'Status' },
	// 					{ uniqueName: 'ActFyear' },
	// 					{ uniqueName: 'ActFmonth' },
	// 					{ uniqueName: 'ActDate' },
	// 					{ uniqueName: 'ActTime' },
	// 				],
	// 				columns: [
	// 					{
	// 						uniqueName: '[Measures]',
	// 					},
	// 				],
	// 				reportFilters: [],
	// 				measures: [],
	// 			},
	// 		},
	// 	});
	// }

}
