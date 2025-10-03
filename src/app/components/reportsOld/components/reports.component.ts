import { ThisReceiver } from '@angular/compiler';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { groupBy } from 'rxjs/operators';
import { WbsManagerService } from '../../wbs-manager/services/wbs-manager.service';
import { ExcelService } from '../services/excel.service';
import { SpinnerService } from '../../../services/spinner.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute, Params, RouterLinkWithHref } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { FormBuilder } from '@angular/forms';
import 'anychart';
import * as jQuery from 'jquery';
import * as Flexmonster from 'flexmonster';
import { FlexmonsterPivot } from 'ng-flexmonster';
import { parseJson } from '@angular/cli/utilities/json-file';
import { placeholdersToParams } from '@angular/compiler/src/render3/view/i18n/util';
import * as $ from 'jquery';
import { event } from 'jquery';

@Component({
	selector: 'app-reports',
	templateUrl: './reports.component.html',
	styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
	@ViewChild('closebutton') closebutton: any;
	reportDataMarketUnit: any = [];
	reportDataDC: any = [];
	reportDataDF: any = [];
	reportDataCliente: any = [];
	reportDataWBSs: any = [];
	reportDataOrig: any = [];
	option_selectAnnoReport: any = [];
	option_selectMeseReport: any = [];
	option_selectQuarterReport: any = [];
	option_selectHalfReport: any = [];
	option_tipiPeriodo: any = [];
	selectedMonth: any = null;
	selectedYear: any = null;
	selectedType: any = 'Month';
	selectedQuarter: any = null;
	selectedHalf: any = null;
	wbsSearch: any;
	raggruppato: any = [];
	reportDataWBS: any = [];
	/// var per servizio flexMonster
	ELayoutJson: any;
	confirmName: any = '';
	//var modale
	clickButtonLayout = '';

	showMonthSearch: boolean = false;
	showQuarter: boolean = false;
	showHalf: boolean = false;
	showYear: boolean = false;
	showReport: boolean = false;
	typePage: string = '';
	isActive: any = [];
	checkBoxes: any = [];
	Report: any = [];
	//CHART
	private chart: any;
	private chartStatistiche: any;
	private chartRicavi: any;
	private dataServer: any;
	private dataCommesse: any;
	private dataStatistiche: any;
	private dataRicavi: any;
	private validatinDate: boolean = false;
	private pivot: any = {};
	listWbs: any = [];
	layoutName = '';
	private layoutDescr = '';
	selectLayout: any;
	paramPivotMarket: string[] = ['Marketunit', 'DescrMarket', 'Account', 'DescrCustomer'];
	valueSelctedPeriod: string = `${new Date().getFullYear() - 1}-01-01`; //`${new Date().getFullYear()}-01-01`;
	constructor(
		private wbsManagerService: WbsManagerService,
		private excelService: ExcelService,
		private spinner: NgxSpinnerService,
		private activatedRoute: ActivatedRoute,
		private modalService: NgbModal,
		private formBuilder: FormBuilder
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
		console.log(value); // da eliminare
		this.valueSelctedPeriod = value;
		this.wbsReport(); // rifaccio la chiamat wbsReport
	}

	loadFirstData(data: any): void {
		var ethis = this;

		this.dataServer = this.reportDataOrig;
		//this.dataCommesse = [];

		this.populareDataReport(data);

		this.statisticheDigitalFactory(new Date().getFullYear().toString(), (new Date().getFullYear() - 1).toString());

		anychart.onDocumentReady(function () {
			// The data used in this sample can be obtained from the CDN
			// https://cdn.anychart.com/samples/heat-map-charts/heat-map-with-scroll/data.json
			// anychart.data.loadJsonFile(
			//   //In realtÃ  setto il json sotto
			//   '',
			//   function (data) {
			//     // Creates Heat Map
			//     ethis.chart = anychart.heatMap(data);
			//     // Sets colorScale
			//     var colorScale = anychart.scales.ordinalColor();
			//     // Sets colors for all points
			//     colorScale.ranges([
			//       { less: 25000, color: '#FFF9C4' },
			//       { from: 25000, to: 45000, color: '#F3D634' },
			//       { from: 45000, to: 65000, color: '#D6DF38' },
			//       { from: 65000, to: 80000, color: '#89BC53' },
			//       { greater: 80000, color: '#4F8C3E' }
			//     ]);
			//     ethis.chart.colorScale(colorScale);
			//     // Sets chart title
			//     ethis.chart
			//       .title()
			//       .enabled(true)
			//       .text('Ricavi Wbs')
			//       .padding([0, 0, 20, 0]);
			//     // Sets chart labels
			//     ethis.chart.labels().enabled(true).format('â‚¬{%Heat}');
			//     // Sets Scrolls for Axes
			//     ethis.chart.xScroller(true);
			//     ethis.chart.yScroller(true);
			//     // Sets starting zoom for Axes
			//     ethis.chart.xZoom().setToPointsCount(8);
			//     ethis.chart.yZoom().setToPointsCount(6);
			//     // Sets chart and hover chart settings
			//     ethis.chart.stroke('#fff');
			//     ethis.chart
			//       .hovered()
			//       .stroke('6 #fff')
			//       .fill('#545f69')
			//       .labels({ fontColor: '#fff' });
			//     // Sets legend
			//     ethis.chart
			//       .legend()
			//       .enabled(true)
			//       .align('center')
			//       .position('center-bottom')
			//       .itemsLayout('horizontal')
			//       .padding([20, 0, 0, 0]);
			//     ethis.chart.animation(true);
			//     // set container id for the chart
			//     ethis.chart.container('report_ricavi_button');
			//     // initiate chart drawing
			//     ethis.chart.data(ethis.dataCommesse);
			//     ethis.chart.draw();
			//   }
			// );
		});

		anychart.onDocumentReady(function () {
			// create data
			var data = [
				{ x: 'A', value: 637166 },
				{ x: 'B', value: 721630 },
				{ x: 'C', value: 148662 },
				{ x: 'D', value: 78662 },
				{ x: 'E', value: 90000 },
			];

			// create a pie chart and set the data
			var chart = anychart.pie(data);

			/* set the inner radius
      (to turn the pie chart into a doughnut chart)*/
			chart.innerRadius('50%');
			chart.title('Distribuzione Ricavi');
			var label = anychart.standalones.label();
			label.text('Ricavi');
			label.width('100%');
			label.height('100%');
			label.fontColor('#60727b');
			label.hAlign('center');
			label.vAlign('middle');

			// set the label as the center content
			chart.center().content(label);
			// set the container id
			chart.container('report_ricavi_button');

			// initiate drawing the chart
			chart.draw();
		});
		anychart.onDocumentReady(function () {
			var palette = ['#E91D0E', '#232066', '#D3D3D3'];

			// create data
			var data = [
				{ x: 'A', value: 637166 },
				{ x: 'B', value: 721630 },
				{ x: 'C', value: 148662 },
				{ x: 'D', value: 78662 },
				{ x: 'E', value: 90000 },
			];

			// create a pie chart and set the data
			var chart = anychart.pie(data);

			/* set the inner radius
      (to turn the pie chart into a doughnut chart)*/
			chart.innerRadius('50%');
			chart.title('Distribuzione Marginalità');
			chart.palette('sea');
			// create and configure a label
			var label = anychart.standalones.label();
			label.text('Marginalità');
			label.width('100%');
			label.height('100%');
			label.fontColor('#60727b');
			label.hAlign('center');
			label.vAlign('middle');

			// set the label as the center content
			chart.center().content(label);
			// set the container id
			chart.container('report_ricavi_button2');

			// initiate drawing the chart
			chart.draw();
		});

		anychart.onDocumentReady(function () {
			var data = [
				['Gennaio', 20000],
				['Febbraio', 18000],
				['Marzo', 17000],
				['Aprile', 16000],
				['Maggio', 18000],
				['Giugno', 10000],
				['Luglio', 12000],
				['Agosto', 18000],
				['Settembre', 11000],
				['Ottobre', 10000],
				['Novembre', 12000],
				['Dicembre', 18000],
			];

			// create a chart
			var chart = anychart.area();

			// create an area series and set the data
			var series = chart.area(data);
			var title = chart.title();
			//enables HTML tags
			title.enabled(true);
			title.align('left');
			title.useHtml(true);
			title.text(
				'<div style="text-align: left">' +
					// "<h5 style=\"text-align: right; color: grey;\">Actual</h5>"+
					'<a style="color: grey; font-size: 14px;">Costi</a><br>' +
					'<a style="color:#000; font-size: 18px; text-decoration: solid;">120M</a><br>' +
					'<a style="color:#BF0000; font-size: 15px;">13%</a><a style="font-size: 15px; color: grey;"> Mese precedente</a>' +
					'</div>'
			);
			// set the container id
			chart.container('report_costiG');

			// initiate drawing the chart
			chart.draw();
			// // create data set on our data
			// var dataSet = anychart.data.set(getData());

			// // map data for the first series, take x from the zero column and value from the first column of data set
			// var seriesData = dataSet.mapAs({ x: 0, value: 1 });

			// // create line chart
			// var chart = anychart.area();

			// // adding dollar symbols to yAxis labels
			// chart.yAxis().labels().format('â‚¬{%Value}');

			// // turn on chart animation
			// chart.animation(true);

			// // axes settings
			// chart.xAxis().labels(false);
			// chart.yAxis().labels(false);

			// var title = chart.title();
			// //enables HTML tags
			// title.enabled(true);
			// title.align("left")
			// title.useHtml(true);
			// title.text(
			//   "<div style=\"text-align: left\">" +
			//   // "<h5 style=\"text-align: right; color: grey;\">Actual</h5>"+
			//   "<a style=\"color: grey; font-size: 18px;\">Costi</a><br>" +
			//   "<a style=\"color:#000; font-size: 25px; text-decoration: solid;\">120M</a><br>" +
			//   "<a style=\"color:#BF0000; font-size: 15px;\">13%</a><a style=\"font-size: 15px; color: grey;\"> Mese precedente</a>" +
			//   "</div>"
			// );

			// // create a series with mapped data
			// var series = chart.area(seriesData);
			// // series.name('ACME Share Price');
			// // series.hovered().markers().enabled(true).type('circle').size(4);
			// series.normal().fill("#3FBC60", 0.3);
			// series.hovered().fill("#3FBC60", 0.1);
			// series.selected().fill("#3FBC60", 0.5);
			// series.normal().stroke("#3FBC60", 1, "", "bevel");
			// series.hovered().stroke("#3FBC60", 1, "", "bevel");
			// series.selected().stroke("#3FBC60", 1, "", "bevel");

			// // set chart tooltip and interactivity settings
			// chart
			//   .tooltip()
			//   .position('center-top')
			//   .anchor('center-bottom')
			//   .positionMode('point');

			// chart.interactivity().hoverMode('by-x');

			// // set container id for the chart
			// chart.container('report_costi');
			// // initiate chart drawing
			// chart.draw();
		});

		anychart.onDocumentReady(function () {
			// create data set on our data
			var dataSet = anychart.data.set(ethis.dataRicavi);

			// map data for the first series, take x from the zero column and value from the first column of data set
			var seriesData = dataSet.mapAs({ x: 0, value: 1 });

			// create line chart
			ethis.chartRicavi = anychart.area();

			// adding dollar symbols to yAxis labels
			ethis.chartRicavi.yAxis().labels().format('â‚¬{%Value}');

			// turn on chart animation
			ethis.chartRicavi.animation(true);

			// axes settings
			ethis.chartRicavi.xAxis().labels(false);
			ethis.chartRicavi.yAxis().labels(false);

			var title = ethis.chartRicavi.title();
			//enables HTML tags
			title.enabled(true);
			title.align('left');
			title.useHtml(true);
			title.text(
				'<div style="text-align: left">' +
					// "<h5 style=\"text-align: right; color: grey;\">Actual</h5>"+
					'<a style="color: grey; font-size: 18px;">Ricavi</a><br>' +
					'<a style="color:#000; font-size: 25px; text-decoration: solid;">84M</a><br>' +
					'<a style="color:#00E13C; font-size: 15px;">1.3%</a><a style="font-size: 15px; color: grey;"> Mese precedente</a>' +
					'</div>'
			);

			// create a series with mapped data
			var series = ethis.chartRicavi.area(seriesData);
			// series.name('ACME Share Price');
			// series.hovered().markers().enabled(true).type('circle').size(4);
			series.normal().fill('#3FBC60', 0.3);
			series.hovered().fill('#3FBC60', 0.1);
			series.selected().fill('#3FBC60', 0.5);
			series.normal().stroke('#3FBC60', 1, '', 'bevel');
			series.hovered().stroke('#3FBC60', 1, '', 'bevel');
			series.selected().stroke('#3FBC60', 1, '', 'bevel');

			// set chart tooltip and interactivity settings
			ethis.chartRicavi.tooltip().position('center-top').anchor('center-bottom').positionMode('point');

			ethis.chartRicavi.interactivity().hoverMode('by-x');

			// set container id for the chart
			ethis.chartRicavi.container('report_ricavi');
			// initiate chart drawing
			ethis.chartRicavi.draw();
		});

		anychart.onDocumentReady(function () {
			// create data set on our data
			var dataSet = anychart.data.set(getData());

			// map data for the first series, take x from the zero column and value from the first column of data set
			var seriesData = dataSet.mapAs({ x: 0, value: 1 });

			// create line chart
			var chart = anychart.area();

			// adding dollar symbols to yAxis labels
			chart.yAxis().labels().format('â‚¬{%Value}');

			// turn on chart animation
			chart.animation(true);

			var title = chart.title();
			//enables HTML tags
			title.enabled(true);
			title.align('left');
			title.useHtml(true);
			title.text(
				'<div style="text-align: left">' +
					// "<h5 style=\"text-align: right; color: grey;\">Actual</h5>"+
					'<a style="color: grey; font-size: 18px;">MarginalitÃ  media</a><br>' +
					'<a style="color:#000; font-size: 25px; text-decoration: solid;">36,3</a><br>' +
					'<a style="color:#BF0000; font-size: 15px;">0.2%</a><a style="font-size: 15px; color: grey;"> Mese precedente</a>' +
					'</div>'
			);

			// axes settings
			chart.xAxis().labels(false);
			chart.yAxis().labels(false);

			// create a series with mapped data
			var series = chart.area(seriesData);
			// series.name('ACME Share Price');
			// series.hovered().markers().enabled(true).type('circle').size(4);
			series.normal().fill('#3FBC60', 0.3);
			series.hovered().fill('#3FBC60', 0.1);
			series.selected().fill('#3FBC60', 0.5);
			series.normal().stroke('#3FBC60', 1, '', 'bevel');
			series.hovered().stroke('#3FBC60', 1, '', 'bevel');
			series.selected().stroke('#3FBC60', 1, '', 'bevel');

			// set chart tooltip and interactivity settings
			chart.tooltip().position('center-top').anchor('center-bottom').positionMode('point');

			chart.interactivity().hoverMode('by-x');

			// set container id for the chart
			chart.container('report_marginalita');
			// initiate chart drawing
			chart.draw();
		});

		function getData() {
			return [
				['2015/9/01', 10],
				['2015/9/02', 12],
				['2015/9/03', 11],
				['2015/9/04', 15],
				['2015/9/05', 20],
				['2015/9/06', 22],
				['2015/9/07', 21],
				['2015/9/08', 25],
				['2015/9/09', 31],
				['2015/9/10', 32],
				['2015/9/11', 28],
				['2015/9/12', 29],
				['2015/9/13', 40],
				['2015/9/14', 41],
				['2015/9/15', 45],
				['2015/9/16', 50],
				['2015/9/17', 65],
				['2015/9/18', 45],
				['2015/9/19', 50],
				['2015/9/20', 51],
				['2015/9/21', 65],
				['2015/9/22', 60],
				['2015/9/23', 62],
				['2015/9/24', 65],
				['2015/9/25', 45],
				['2015/9/26', 55],
				['2015/9/27', 59],
				['2015/9/28', 52],
				['2015/9/29', 53],
				['2015/9/30', 40],
			];
		}
	}

	onReportComplete(): void {
		this.pivot.flexmonster.off('reportcomplete');
		this.pivot.flexmonster.setReport({
			dataSource: {
				filename: 'https://cdn.flexmonster.com/data/data.json',
			},
		});
	}
	/***********Da verificare****************/
	openModalResponsive() {
		/*const modalSearch = {};
    const modalRef = this.modalService.open(ModalComponent, {
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.modalSearch = modalSearch;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry: any) => {
      let wbsPerformance = { neutral: false, red: false, orange: false, green: false };
      this.workSpaceService.getWBSList(receivedEntry).subscribe(response => {
        response.data.EtWbsList.forEach((item: any) => {
          Object.assign(item, wbsPerformance);
        });
        this.getPerformanceDetail(response.data.EtWbsList);
        this.EtWbsList = response.data.EtWbsList;
      });
    });*/
	}

	statisticheDigitalFactory(firstYear: string, secondYear: string) {
		var ethis = this;
		//Statistiche digital factory
		anychart.onDocumentReady(function () {
			var dataSet = anychart.data.set(ethis.dataStatistiche);

			// map data for the first series, take x from the zero column and value from the first column of data set
			var firstSeriesData = dataSet.mapAs({ x: 0, value: 1 });

			// map data for the second series, take x from the zero column and value from the second column of data set
			var secondSeriesData = dataSet.mapAs({ x: 0, value: 2 });

			// create column chart
			ethis.chartStatistiche = anychart.column();

			// turn on chart animation
			ethis.chartStatistiche.animation(true);

			// set chart title text settings
			ethis.chartStatistiche.title('Statistiche per Mercato');

			// temp variable to store series instance
			var series;

			// helper function to setup label settings for all series
			var setupSeries = function (series: any, name: any) {
				series.name(name);
				series.selected().fill('#f48fb1 0.8').stroke('1.5 #c2185b');
			};

			// create first series with mapped data
			series = ethis.chartStatistiche.column(firstSeriesData);
			series.xPointPosition(0.45);
			setupSeries(series, firstYear);

			// create second series with mapped data
			series = ethis.chartStatistiche.column(secondSeriesData);
			series.xPointPosition(0.25);
			setupSeries(series, secondYear);

			// set chart padding
			ethis.chartStatistiche.barGroupsPadding(0.3);

			// format numbers in y axis label to match browser locale
			ethis.chartStatistiche.yAxis().labels().format('€ {%Value}{groupsSeparator: }');

			// set titles for Y-axis
			ethis.chartStatistiche.yAxis().title('Valore');

			// turn on legend
			ethis.chartStatistiche.legend().enabled(true).fontSize(13).padding([0, 0, 20, 0]);

			ethis.chartStatistiche.interactivity().hoverMode('single');

			ethis.chartStatistiche.tooltip().format('€ {%Value}{groupsSeparator: }');

			// set container id for the chart

			ethis.chartStatistiche.container('report_statistiche');

			// initiate chart drawing
			ethis.chartStatistiche.draw();
		});
	}

	filtraStatisticheDigitalFactory() {
		let elemCheckati = this.checkBoxes.filter(function (item: any) {
			return item == true;
		});
		if (elemCheckati.length == 2) {
			let values: any = $("#btnGroup input[type='checkbox']:checked");
			const myAbsolutelyNotNullElement = window.document.getElementById('report_statistiche')!;
			myAbsolutelyNotNullElement.innerHTML = '';
			this.returnDataStatistiche(values[0].value, values[1].value, this.reportDataOrig);
			this.statisticheDigitalFactory(values[0].value, values[1].value);
		} else {
			alert('Attenzione - Devi selezionare due anni!');
		}
	}

	populareDataReport(data: any): void {
		var ethis = this;

		//Per i dati delle commesse
		this.dataCommesse = [];

		[
			{ mese: '01', stringMese: 'Gennaio' },
			{ mese: '02', stringMese: 'Febbraio' },
			{ mese: '03', stringMese: 'Marzo' },
			{ mese: '04', stringMese: 'Aprile' },
			{ mese: '05', stringMese: 'Maggio' },
			{ mese: '06', stringMese: 'Giugno' },
			{ mese: '07', stringMese: 'Luglio' },
			{ mese: '08', stringMese: 'Agosto' },
			{ mese: '09', stringMese: 'Settembre' },
			{ mese: '10', stringMese: 'Ottobre' },
			{ mese: '11', stringMese: 'Novembre' },
			{ mese: '12', stringMese: 'Dicembre' },
		].forEach(function (valuej, j) {
			data.forEach(function (valuei: any, i: any) {
				if (
					valuei.Fyear === '2021' &&
					valuei.Fmonth === valuej.mese &&
					((valuei.Marketunit === 'MIUE-BD' && ethis.searchForm.value.merc_BD) ||
						(valuei.Marketunit === 'MIUE-AA' && ethis.searchForm.value.merc_AA) ||
						(valuei.Marketunit === 'MIUE-AI' && ethis.searchForm.value.merc_AI) ||
						(valuei.Marketunit === 'MIUE-AU' && ethis.searchForm.value.merc_AU) ||
						(valuei.Marketunit === 'MIUPS-DSCA' && ethis.searchForm.value.merc_DSCA) ||
						(valuei.Marketunit === 'MIUPS-DSNA' && ethis.searchForm.value.merc_DSNA) ||
						(valuei.Marketunit === 'MIUE-OG' && ethis.searchForm.value.merc_OG))
				) {
					ethis.dataCommesse.push({
						x: valuej.stringMese,
						y: valuei.Wbs,
						heat: valuei.BalRevenues,
					});
				}
			});
		});

		this.returnDataStatistiche('2020', '2021', data);

		//Per i dati dei ricavi
		this.dataRicavi = [];
		[
			{ mese: '01', stringMese: 'Gennaio' },
			{ mese: '02', stringMese: 'Febbraio' },
			{ mese: '03', stringMese: 'Marzo' },
			{ mese: '04', stringMese: 'Aprile' },
			{ mese: '05', stringMese: 'Maggio' },
			{ mese: '06', stringMese: 'Giugno' },
			{ mese: '07', stringMese: 'Luglio' },
			{ mese: '08', stringMese: 'Agosto' },
			{ mese: '09', stringMese: 'Settembre' },
			{ mese: '10', stringMese: 'Ottobre' },
			{ mese: '11', stringMese: 'Novembre' },
			{ mese: '12', stringMese: 'Dicembre' },
		].forEach(function (valuej, j) {
			var ricavi_mensili = 0;
			data.forEach(function (valuei: any, i: any) {
				if (
					valuei.Fyear === '2021' &&
					valuei.Fmonth === valuej.mese &&
					((valuei.Marketunit === 'MIUE-BD' && ethis.searchForm.value.merc_BD) ||
						(valuei.Marketunit === 'MIUE-AA' && ethis.searchForm.value.merc_AA) ||
						(valuei.Marketunit === 'MIUE-AI' && ethis.searchForm.value.merc_AI) ||
						(valuei.Marketunit === 'MIUE-AU' && ethis.searchForm.value.merc_AU) ||
						(valuei.Marketunit === 'MIUPS-DSCA' && ethis.searchForm.value.merc_DSCA) ||
						(valuei.Marketunit === 'MIUPS-DSNA' && ethis.searchForm.value.merc_DSNA) ||
						(valuei.Marketunit === 'MIUE-OG' && ethis.searchForm.value.merc_OG))
				) {
					ricavi_mensili += parseFloat(valuei.BalRevenues);
				}
			});
			ethis.dataRicavi.push([valuej.stringMese, ricavi_mensili]);
		});
	}

	returnDataStatistiche(firstYear: string, secondYear: string, data: any) {
		//Per i dati delle statistiche
		var ethis = this;
		this.dataStatistiche = [];
		[
			{ mercato: 'MIUE-BD', stringmercato: '' },
			{ mercato: 'MIUE-AA', stringmercato: 'Application Aerospace account unit' },
			{ mercato: 'MIUE-AI', stringmercato: 'Application Industry acccount unit' },
			{ mercato: 'MIUE-AU', stringmercato: 'Application utilities account unit' },
			{ mercato: 'MIUPS-DSCA', stringmercato: 'Digital services Centro area Account unit' },
			{ mercato: 'MIUPS-DSNA', stringmercato: 'Digital services Nord area Account unit' },
			{ mercato: 'MIUE-OG', stringmercato: 'Oil & Gas Account unit' },
		].forEach(function (valuej, j) {
			if (
				(valuej.mercato === 'MIUE-BD' && ethis.searchForm.value.merc_BD) ||
				(valuej.mercato === 'MIUE-AA' && ethis.searchForm.value.merc_AA) ||
				(valuej.mercato === 'MIUE-AI' && ethis.searchForm.value.merc_AI) ||
				(valuej.mercato === 'MIUE-AU' && ethis.searchForm.value.merc_AU) ||
				(valuej.mercato === 'MIUPS-DSCA' && ethis.searchForm.value.merc_DSCA) ||
				(valuej.mercato === 'MIUPS-DSNA' && ethis.searchForm.value.merc_DSNA) ||
				(valuej.mercato === 'MIUE-OG' && ethis.searchForm.value.merc_OG)
			) {
				var valore_anno_precedente = 0;
				var valore_anno_attuale = 0;
				data.forEach(function (valuei: any, i: any) {
					if (valuei.Fyear === firstYear && valuei.Marketunit === valuej.mercato) {
						valore_anno_precedente += parseFloat(valuei.BalRevenues);
					} else if (valuei.Fyear === secondYear && valuei.Marketunit === valuej.mercato) {
						valore_anno_attuale += parseFloat(valuei.BalRevenues);
					}
				});
				ethis.dataStatistiche.push([valuej.mercato, valore_anno_precedente, valore_anno_attuale]);
			}
		});
	}

	searchList() {
		//console.log("MEMME MAI!!!!!");
		let search = this.searchForm.value;
		this.validatinDate = false;

		console.log(search);

		var ethis = this;
		//chart.data([]);
		//chart.refresh();

		this.populareDataReport(this.reportDataOrig);
		this.chart.data(this.dataCommesse);
		this.chartStatistiche.data(this.dataStatistiche);
		this.chartRicavi.data(this.dataRicavi);
		/*if (search.dataInizio && search.dataFine) {
      if (new Date(search.dataInizio) > new Date(search.dataFine)) {
        this.validatinDate = true;
         return;
      }
    }
    let wbsPerformance = { neutral: false, red: false, orange: false, green: false };
    this.workSpaceService.getWBSList(search).subscribe(response => {
      response.data.EtWbsList.forEach((item: any) => {
        Object.assign(item, wbsPerformance);
      });
      this.getPerformanceDetail(response.data.EtWbsList);
      this.EtWbsList = response.data.EtWbsList;
    });*/
	}

	resetForm() {
		/*this.searchForm.reset();
    this.searchList();*/
		//this.chart.draw();
	}

	reloadData(): void {}

	exportAsXLSX(): void {
		let dataToExport = this.reportDataOrig.map(function (row: any) {
			return {
				'Market Unit-CODE': row.Marketunit,
				'Market Unit-DESCR': row.DescrMarket,
				Account: row.Account,
				'Digital Factory-CODE': row.DigitalFactory,
				'Digital Factory-DESCR': row.DescrDf,
				'Profit Center-CODE': row.DeliveryCenter,
				'Profit Center-DESCR': row.DescrDlvctr,
				'Customer SAP-CODE': row.Customer,
				Customer: row.DescrCustomer,
				'Project Manager': row.ProjectManager,
				RAC: row.Rac,
				WBS: row.Wbs,
				'WBS-DESCR': row.DescrWbs,
				'START DATE':
					row.StartDate.split('-')[2] + '-' + row.StartDate.split('-')[1] + '-' + row.StartDate.split('-')[0],
				'END DATE': row.EndDate.split('-')[2] + '-' + row.EndDate.split('-')[1] + '-' + row.EndDate.split('-')[0],
				Anno: row.Fyear,
				Mese: row.Fmonth,
				'Forecast-Costi': parseFloat(row.FcCosts),
				'Consuntivo-Costi': parseFloat(row.BalCosts),
				'Forecast Ricavi': parseFloat(row.FcRevenues),
				'Consuntivo-Ricavi': parseFloat(row.BalRevenues),
				Currency: row.Currency,
			};
		});
		this.excelService.exportAsExcelFile(dataToExport, 'WBS-Manager');
	}
	// Lista che restituisce tutti i Layout
	WbsFlexGetlist: any = [];
	ListName: any = [];
	ngSelectName: any = [];
	showLayout: boolean = false;
	EtWbsList: any = [];

	getWbsFlexGetlist() {
		this.ListName = [];
		//let WbsFlexGetlist : any = [];
		if (this.typeTab == 'ZewmRepGetlist') {
			this.wbsManagerService.getWbsFlexGetlist(this.typeTab).subscribe(response => {
				this.WbsFlexGetlist = response;
				this.WbsFlexGetlist.data.EtFlexList.forEach((item: any) => {
					this.ListName.push(item.LayoutName);
				});
				this.ngSelectName = this.ListName;
			});
		} else if (this.typeTab == 'ZewmWbsGetlist') {
			this.wbsManagerService.getWbsFlexGetlist(this.typeTab).subscribe(response => {
				this.WbsFlexGetlist = response;
				this.WbsFlexGetlist.data.EtFlexList.forEach((item: any) => {
					this.ListName.push(item.LayoutName);
				});
				this.ngSelectName = this.ListName;
			});
		}
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
			this.EtWbsList = response.data.EtWbsList;
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
		/*$(document).ready(function(){
      $("#spinner").show();
    });*/
		function getData() {
			return [
				{
					Color: 'green',
					Country: 'Canada',
					State: 'Ontario',
					City: 'Toronto',
					Price: 174,
					Quantity: 22,
				},
				{
					Color: 'red',
					Country: 'USA',
					State: 'California',
					City: 'Los Angeles',
					Price: 166,
					Quantity: 19,
				},
			];
		}
		/////////////////////////////////////////
		this.wbsReport();

	}

	wbsReport(){
		this.wbsManagerService.getWbsReport(this.valueSelctedPeriod).subscribe((response: any) => {
			var ethis = this;
			this.activatedRoute.queryParams.subscribe(params => {
				this.typePage = params['type'];
				switch (this.typePage) {
					case 'Marketunit':
						this.showReport = true;
						this.isActive = [];
						this.isActive.MU = true;
						break;
					case 'DeliveryCenter':
						this.showReport = true;
						this.isActive = [];
						this.isActive.DC = true;
						break;
					case 'DigitalFactory':
						this.showReport = true;
						this.isActive = [];
						this.isActive.DF = true;
						break;
					case 'Cliente':
						this.showReport = true;
						this.isActive = [];
						this.isActive.Cli = true;
						break;
					case 'Wbs':
						this.showReport = true;
						this.isActive = [];
						this.isActive.WBS = true;
						break;
					case 'Graph':
						this.showReport = false;
						this.loadFirstData(response.data.EtRepList);
						this.isActive = [];
						this.isActive.Graph = true;
						break;
					case 'Pivot':
						this.showReport = false;

						break;
					default:
						this.isActive = [];
						break;
				}
			});
			this.Report = response.data.EtRepList.map(function (item: any) {
				item.BalCosts = parseFloat(item.BalCosts);
				item.BalCosts = Math.round((item.BalCosts + Number.EPSILON) * 100) / 100;
				item.BalRevenues = parseFloat(item.BalRevenues);
				item.BalRevenues = Math.round((item.BalRevenues + Number.EPSILON) * 100) / 100;
				item.FcCosts = item.FcCosts = parseFloat(item.FcCosts);
				item.FcCosts = Math.round((item.FcCosts + Number.EPSILON) * 100) / 100;
				item.FcRevenues = item.FcRevenues = parseFloat(item.FcRevenues);
				item.FcRevenues = Math.round((item.FcRevenues + Number.EPSILON) * 100) / 100;
				return item;
			});
			this.tabPivot(this.paramPivotMarket);
			this.getWbsFlexGetlist();
			this.getWBSList();
			if (this.typePage != 'Graph') {
				this.raggruppato = this.groupByKey(response.data.EtRepList, this.typePage);
				//  this.raggruppato[0]['intestazione'].totCosti = this.raggruppato[0]['intestazione'].totCosti.toFixed(2);
				let g = Object.keys(this.raggruppato).map(item => {
					let dato = this.raggruppato[item];

					return dato;
				});
				//  arrotondo tutto per due cifre decimali
				g = g.map(function (item) {
					item['intestazione'].totCostiC = item['intestazione'].totCostiC.toFixed(2).replace('.', ',');
					item['intestazione'].totRicaviC = item['intestazione'].totRicaviC.toFixed(2).replace('.', ',');
					item['intestazione'].totCostiF = item['intestazione'].totCostiF.toFixed(2).replace('.', ',');
					item['intestazione'].totRicaviF = item['intestazione'].totRicaviF.toFixed(2).replace('.', ',');

					return item;
				});

				//this.reportDataMarketUnit = g;
				this.assegnaDataSource(g);
			}

			this.reportDataOrig = response.data.EtRepList;

			this.option_selectAnnoReport = response.data.EtYearList.map((item: any) => {
				return item.Fyear;
			}); //['2019', '2020', '2021', '2022', '2023'];
			if (this.typePage == 'Graph') {
				//checka l'anno corrente e quello precedente
				if (this.option_selectAnnoReport.findIndex((item: any) => item == new Date().getFullYear()))
					this.checkBoxes[this.option_selectAnnoReport.findIndex((item: any) => item == new Date().getFullYear())] =
						true;
				if (this.option_selectAnnoReport.findIndex((item: any) => item == new Date().getFullYear() - 1))
					this.checkBoxes[this.option_selectAnnoReport.findIndex((item: any) => item == new Date().getFullYear() - 1)] =
						true;
			}

			this.option_tipiPeriodo = ['Month', 'Quarter', 'Half', 'Year'];
			this.option_selectMeseReport = [
				{
					Mese: 'Gennaio',
					Value: '01',
				},
				{
					Mese: 'Febbraio',
					Value: '02',
				},
				{
					Mese: 'Marzo',
					Value: '03',
				},
				{
					Mese: 'Aprile',
					Value: '04',
				},
				{
					Mese: 'Maggio',
					Value: '05',
				},
				{
					Mese: 'Giugno',
					Value: '06',
				},
				{
					Mese: 'Luglio',
					Value: '07',
				},
				{
					Mese: 'Agosto',
					Value: '08',
				},
				{
					Mese: 'Settembre',
					Value: '09',
				},
				{
					Mese: 'Ottobre',
					Value: '10',
				},
				{
					Mese: 'Novembre',
					Value: '11',
				},
				{
					Mese: 'Dicembre',
					Value: '12',
				},
			];

			this.option_selectQuarterReport = [
				{
					Quarter: '1° Quarter',
					Value: '01',
				},
				{
					Quarter: '2° Quarter',
					Value: '02',
				},
				{
					Quarter: '3° Quarter',
					Value: '03',
				},
				{
					Quarter: '4° Quarter',
					Value: '04',
				},
			];
			this.option_selectHalfReport = [
				{
					Half: '1° Half',
					Value: '01',
				},
				{
					Half: '2° Half',
					Value: '02',
				},
			];
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
		this.confirmName = '';
		this.ngSelectName.forEach((item: any) => {
			if (this.layoutName == item) {
				this.confirmName = 'nomeUguale';
			}
		});
		if (this.layoutName == '' || this.layoutName == ' ') {
			this.confirmName = 'stringaVuota';
		}

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

			this.wbsManagerService
				.getWbsFlexSave(this.layoutName, this.layoutDescr, layoutJSON, this.typeTab)
				.subscribe(() => {
					this.getWbsFlexGetlist();
					this.ngModelSelect = this.layoutName;
					this.closebutton.nativeElement.click();
				});
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
		this.wbsManagerService.getWbsFlexSave(this.ngModelSelect, this.layoutDescr, layoutJSON, this.typeTab).subscribe();
	}

	delateLayout() {
		if (this.ngModelSelect != undefined) {
			this.wbsManagerService.getWbsFlexDelete(this.ngModelSelect, this.typeTab).subscribe(response => {
				this.getWbsFlexGetlist();
				this.ngModelSelect = 'Selezione Layout';
				if (this.typeTab == 'ZewmRepGetlist') {
					this.tabPivot(this.paramPivotMarket);
				} else if (this.typeTab == 'ZewmWbsGetlist') {
					this.listWbsPivot();
				}
			});
		}
	}

	getDetailFlexMonster(layout: any) {
		this.wbsManagerService.getWbsFlexGetdetail(layout, this.typeTab).subscribe(response => {
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

			// visualizzo le colonne slice
			this.pivot.runQuery(layoutOBJECT.slice);

			this.pivot.setOptions(layoutOBJECT.options);
			this.pivot.collapseAllData();
			this.pivot.refresh();
		});
	}
	// NG SELECT LAYOUT SALVATO
	layoutSalvato(layout: any) {
		this.selectLayout = layout;
		this.getDetailFlexMonster(layout);
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

		// icone personalizzate
		// const iconSet = {
		//   "rollUp": `<svg id="icon-act_roll_up" viewBox="0 0 32 32">
		//   <path d="M8.54 21.205c-0.298 0.297-0.78 0.297-1.077
		//   0s-0.298-0.78 0-1.078l7.999-7.999c0.148-0.148 0.341-0.222
		//   0.534-0.223 0.196-0.001 0.394 0.073 0.543 0.223l7.999
		//   7.999c0.298 0.297 0.298 0.78 0 1.078s-0.78 0.297-1.078
		//   0l-7.46-7.46-7.46 7.46z"></path>
		//   </svg>`,

		//     "rollDown": `<svg id="icon-act_roll_down" viewBox="0 0 32 32">
		//   <path d="M7.462 12.128c0.298-0.298 0.78-0.298 1.078 0l7.46
		//   7.46 7.46-7.46c0.298-0.298 0.78-0.298 1.078 0s0.298 0.78 0 1.078l-7.999
		//   7.999c-0.297 0.298-0.78 0.298-1.077 0l-7.999-7.999c-0.298-0.298-0.298-0.78 0-1.078z"></path>
		//   </svg>`
		// }

		toolbar.getTabs = function () {
			// remove the Save tab using its id
			tabs = tabs.filter((tab: any) => tab.id != 'fm-tab-save');
			tabs = tabs.filter((tab: any) => tab.id != 'fm-tab-connect');
			tabs = tabs.filter((tab: any) => tab.id != 'fm-tab-open');

			// let prev: any = 'flat';
			// this.pivot.on('reportchange', () => {

			//   if (this.pivot.getOptions().grid.type !== 'flat' && prev === 'flat') {
			//     console.log('icone aggiunte');
			//     prev = this.pivot.getOptions().grid.type;
			//     this.modifyVisible();
			//       // tabs.push({
			//       //   id: "fm-tab-expandtab",
			//       //   title: "Espandi",
			//       //   handler: function() {
			//       //     console.log("expand data");
			//       //     this.pivot.expandAllData()
			//       //   },
			//       //   icon: iconSet.rollDown
			//       // })

			//       // tabs.push({
			//       //   id: "fm-tab-minustab",
			//       //   title: "Comprimi",
			//       //   handler: function() {
			//       //     console.log("callapse data");
			//       //     this.pivot.collapseAllData()
			//       //   },
			//       //   icon: iconSet.rollUp
			//       // })

			//   }
			//   else if (this.pivot.getOptions().grid.type === 'flat') {
			//     // console.log('eliminato');
			//     // prev = this.pivot.getOptions().grid.type;
			//     // tabs = tabs.filter((tab:any) => {tab.id != "fm-tab-expandtab", console.log(tab.id)});
			//     // tabs = tabs.filter((tab:any) => tab.id != "fm-tab-minustab");
			//   }
			// })

			return tabs;
		};
	}

	allData() {
		this.tabPivot(this.paramPivotMarket);
		this.pivot.runQuery({
			rows: [
				{ uniqueName: 'Marketunit' },
				{ uniqueName: 'DescrMarket' },
				{ uniqueName: 'DescrDf' },
				{ uniqueName: 'ProjectManager' },
				{ uniqueName: 'DescrWbs' },
				{ uniqueName: 'Wbs' },
				{ uniqueName: 'Customer' },
				{ uniqueName: 'DescrCustomer' },
				{ uniqueName: 'StartDate' },
				{ uniqueName: 'EndDate' },
				{ uniqueName: 'Rac' },
				{ uniqueName: 'DigitalFactory' },
				{ uniqueName: 'DeliveryCenter' },
				{ uniqueName: 'DescrDlvctr' },
				{ uniqueName: 'Currency' },
				{ uniqueName: 'DescrStatus' },
				{ uniqueName: 'SendPerio' },
				{ uniqueName: 'SendDate' },
				{ uniqueName: 'SendTime' },
				{ uniqueName: 'CtrStartDate' },
				{ uniqueName: 'CtrEndDate' },
				{ uniqueName: 'Opportunity' },
				{ uniqueName: 'DescrBusinessProj' },
				{ uniqueName: 'DescrOpp' },
				{ uniqueName: 'SfOpp' },
				{ uniqueName: 'SfQuote' },
				{ uniqueName: 'SfProd' },
				{ uniqueName: 'DescrFlagCq' },
				{ uniqueName: 'Itembudget' },
				{ uniqueName: 'DescrItembudget' },
				{ uniqueName: 'Performoblig' },
				{ uniqueName: 'DescrPerformoblig' },
				{ uniqueName: 'OfferNumber' },
				{ uniqueName: 'CtrNum' },
				{ uniqueName: 'DescrCtr' },
				/* {uniqueName:'FcRevenues'},
       {uniqueName:'FcCosts'},
       {uniqueName:'BalRevenues'},
       {uniqueName:'BalCosts'},*/
				/*{uniqueName:'Fyear'},
      {uniqueName:'Fmonth'},*/
			],
		});
	}

	private typeTab: any = '';

	tabPivot(type: string[]) {
		this.typeTab = 'ZewmRepGetlist';
		this.ngModelSelect = 'Selezione Layout';
		this.getWbsFlexGetlist();
		let nowYear = new Date().getFullYear().toString();
		let beforeYear = (parseFloat(nowYear) - 1).toString();
		let report: any;
		/*$(document).ready(function(){
      $("#spinner").hide();
    });*/
		this.showLayout = true;
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
					data: this.Report,
					mapping: {
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
              'caption' : 'Performance Obligation'
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
							caption: 'PM',
						},
						Marketunit: {
							caption: 'Account Unit',
						},
						DescrMarket: {
							caption: 'Descr. Account Unit',
						},
						DigitalFactory: {
							caption: 'DF',
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
						BalRevenues: {
							caption: 'Ricavi Consuntivo',
							type: 'number',
						},
						BalCosts: {
							caption: 'Costi Consuntivo',
							type: 'number',
						},
						Fyear: {
							type: 'string',
						},
						Fmonth: {
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
						/*'type' : {
              "type": "string"
            },*/
					},
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
					rows: [
						{ uniqueName: type[0] },
						{ uniqueName: type[1] },
						{ uniqueName: type[2] },
						{ uniqueName: type[3] },
						{ uniqueName: type[4] || '' },
						// {uniqueName: "DescrDf" },
						// {uniqueName: "ProjectManager" },
						// {uniqueName: "DescrWbs" },
						// {uniqueName: "Wbs"},
					],
					columns: [
						{
							uniqueName: '[Measures]',
						},
					],
					reportFilters: [
						{
							uniqueName: 'Fyear',
							caption: 'Year',
							filter: {
								members: [nowYear, beforeYear],
							},
						},
						{ uniqueName: 'Fmonth', caption: 'Month' },
					],
					measures: [
						{
							uniqueName: 'BalCosts',
							aggregation: 'sum',
						},
						{
							uniqueName: 'BalRevenues',
							aggregation: 'sum',
						},
						{
							uniqueName: 'FcCosts',
							aggregation: 'sum',
						},
						{
							uniqueName: 'FcRevenues',
							aggregation: 'sum',
						},
					],
				},
			},
		});
	}

	listWbsPivot() {
		this.ngModelSelect = 'Selezione Layout';
		this.typeTab = 'ZewmWbsGetlist';
		this.getWbsFlexGetlist();
		this.pivot = new Flexmonster({
			container: 'pivot-container',
			licenseKey: 'Z7F1-XF1J2E-3G0O36-1V2K2R-2F230O-2P5B32-3J712N-1S6702-1M5K14-0J',
			componentFolder: 'https://cdn.flexmonster.com/',
			toolbar: true,
			beforetoolbarcreated: this.customizeToolbar,
			customizeContextMenu: this.customizeFlexmonsterContextMenu,
			report: {
				dataSource: {
					data: this.EtWbsList,
					mapping: {
						ProfitCtr: {
							type: 'string',
							caption: 'Profit center',
						},
						Customer: {
							type: 'string',
							caption: 'Codice Cliente',
						},
						ActFyear: {
							type: 'string',
							caption: 'Anno ultima versione inviata',
						},
						ActFmonth: {
							type: 'string',
							caption: 'Mese ultima versione inviata',
						},
						Wbs: {
							caption: 'Elemento WBS',
						},
						DescrWbs: {
							caption: 'Descrizione WBS',
						},
						PmCode: {
							caption: 'Codice PM',
						},
						ProjectManager: {
							caption: 'Project Manage',
						},
						CompCode: {
							caption: 'CompCode',
						},
						StartDate: {
							caption: "Data di inizio prevista per l'elemento WBS",
						},
						EndDate: {
							caption: 'Data di fine prevista elemento WBS',
						},
						DescrCustomer: {
							caption: 'Descrizione Cliente',
						},
						Rac: {
							caption: 'Responsabile amm.vo (RAC)',
						},
						Opportunity: {
							caption: 'Codice Opportunità',
						},
						DescrBusinessProj: {
							caption: 'Dett. tipologia WBS',
						},
						DescrOpp: {
							caption: 'Descrizione Opportunità',
						},
						ActTime: {
							caption: 'Ora invio',
						},
						Account: {
							caption: 'Account',
						},
						Marketunit: {
							caption: 'Market Unit',
						},
						DigitalFact: {
							caption: 'Digital Factory',
						},
						Status: {
							caption: 'Status',
						},
						ActDate: {
							caption: 'Data invio',
						},
					},
				},
				conditions: [],
				formats: [
					{
						thousandsSeparator: '.',
						decimalSeparator: ',',
						maxDecimalPlaces: 2,
						nullValue: '-',
						textAlign: 'right',
					},
				],
				options: {
					viewType: 'grid',
					grid: {
						type: 'flat',
					},
				},
				slice: {
					rows: [
						{ uniqueName: 'Wbs' },
						{ uniqueName: 'DescrWbs' },
						{ uniqueName: 'ProjectManager' },
						{ uniqueName: 'CompCode' },
						{ uniqueName: 'ProfitCtr' },
						{ uniqueName: 'StartDate' },
						{ uniqueName: 'EndDate' },
						{ uniqueName: 'Customer' },
						{ uniqueName: 'DescrCustomer' },
						{ uniqueName: 'Rac' },
						{ uniqueName: 'Opportunity' },
						{ uniqueName: 'DescrOpp' },
						{ uniqueName: 'Account' },
						{ uniqueName: 'Marketunit' },
						{ uniqueName: 'DigitalFact' },
						{ uniqueName: 'Status' },
						{ uniqueName: 'ActFyear' },
						{ uniqueName: 'ActFmonth' },
						{ uniqueName: 'ActDate' },
						{ uniqueName: 'ActTime' },
					],
					columns: [
						{
							uniqueName: '[Measures]',
						},
					],
					reportFilters: [],
					measures: [],
				},
			},
		});
	}

	changeButtonMU(index: any) {
		let appoggiaBottone = this.reportDataMarketUnit[index]['intestazione'].Button;
		this.reportDataMarketUnit = this.reportDataMarketUnit.map(function (item: any) {
			item['intestazione'].Button = '+';
			return item;
		});
		if (appoggiaBottone == '+') {
			this.reportDataMarketUnit[index]['intestazione'].Button = '-';
		} else if (appoggiaBottone == '-') {
			this.reportDataMarketUnit[index]['intestazione'].Button = '+';
		}
		//this.reportDataMarketUnit[index]["intestazione"].Button == '-' ?   this.reportDataMarketUnit[index]["intestazione"].Button = '+' :  this.reportDataMarketUnit[index]["intestazione"].Button = '-';
	}

	changeButtonDC(index: any) {
		let appoggiaBottone = this.reportDataDC[index]['intestazione'].Button;
		this.reportDataDC = this.reportDataDC.map(function (item: any) {
			item['intestazione'].Button = '+';
			return item;
		});
		if (appoggiaBottone == '+') {
			this.reportDataDC[index]['intestazione'].Button = '-';
		} else if (appoggiaBottone == '-') {
			this.reportDataDC[index]['intestazione'].Button = '+';
		}
	}

	changeButtonDF(index: any) {
		let appoggiaBottone = this.reportDataDF[index]['intestazione'].Button;
		this.reportDataDF = this.reportDataDF.map(function (item: any) {
			item['intestazione'].Button = '+';
			return item;
		});
		if (appoggiaBottone == '+') {
			this.reportDataDF[index]['intestazione'].Button = '-';
		} else if (appoggiaBottone == '-') {
			this.reportDataDF[index]['intestazione'].Button = '+';
		}
	}

	changeButtonCli(index: any) {
		let appoggiaBottone = this.reportDataCliente[index]['intestazione'].Button;
		this.reportDataCliente = this.reportDataCliente.map(function (item: any) {
			item['intestazione'].Button = '+';
			return item;
		});
		if (appoggiaBottone == '+') {
			this.reportDataCliente[index]['intestazione'].Button = '-';
		} else if (appoggiaBottone == '-') {
			this.reportDataCliente[index]['intestazione'].Button = '+';
		}
	}

	changeButtonWBS(index: any) {
		let appoggiaBottone = this.reportDataWBSs[index]['intestazione'].Button;
		this.reportDataWBSs = this.reportDataWBSs.map(function (item: any) {
			item['intestazione'].Button = '+';
			return item;
		});
		if (appoggiaBottone == '+') {
			this.reportDataWBSs[index]['intestazione'].Button = '-';
		} else if (appoggiaBottone == '-') {
			this.reportDataWBSs[index]['intestazione'].Button = '+';
		}
	}

	cambiaPeriodo() {
		if (this.selectedType == 'Month') {
			this.showMonthSearch = true;
			this.showQuarter = false;
			this.showHalf = false;
			this.showYear = false;
		}
		if (this.selectedType == 'Quarter') {
			this.showQuarter = true;
			this.showMonthSearch = false;
			this.showHalf = false;
			this.showYear = false;
		}
		if (this.selectedType == 'Half') {
			this.showQuarter = false;
			this.showMonthSearch = false;
			this.showHalf = true;
			this.showYear = false;
		}
		if (this.selectedType == 'Year') {
			this.showQuarter = false;
			this.showMonthSearch = false;
			this.showHalf = false;
			this.showYear = true;
		}
	}

	assegnaDataSource(g: any[]) {
		switch (this.typePage) {
			case 'Marketunit':
				this.reportDataMarketUnit = g;
				break;
			case 'DeliveryCenter':
				this.reportDataDC = g;
				break;
			case 'DigitalFactory':
				this.reportDataDF = g;
				break;
			case 'DescrCustomer':
				this.reportDataCliente = g;
				break;
			case 'Wbs':
				this.reportDataWBSs = g;
				break;
			default:
				break;
		}
	}

	filterByMonth(mese: any, anno: any) {
		return function (current: any) {
			if (anno) {
				return current.Fmonth === mese && current.Fyear === anno;
			} else {
				return current.Fmonth === mese;
			}
		};
	}

	searchByMonth() {
		if (this.selectedMonth != null) {
			this.raggruppato = this.groupByKey(
				this.reportDataOrig.filter(this.filterByMonth(this.selectedMonth, this.selectedYear)),
				this.typePage
			);
			let g = Object.keys(this.raggruppato).map(item => {
				let dato = this.raggruppato[item];
				return dato;
			});
			g = g.map(function (item) {
				item['intestazione'].totCostiC = item['intestazione'].totCostiC.toFixed(2).replace('.', ',');
				item['intestazione'].totRicaviC = item['intestazione'].totRicaviC.toFixed(2).replace('.', ',');
				item['intestazione'].totCostiF = item['intestazione'].totCostiF.toFixed(2).replace('.', ',');
				item['intestazione'].totRicaviF = item['intestazione'].totRicaviF.toFixed(2).replace('.', ',');
				return item;
			});
			// this.reportDataMarketUnit = g;
			this.assegnaDataSource(g);
		} else {
			alert('Attenzione non hai selezionato il campo mese ');
		}
	}

	filterByQuarter(quarter: any, anno: any) {
		return function (current: any) {
			switch (quarter) {
				case '01':
					return (
						(current.Fmonth === '01' || current.Fmonth === '02' || current.Fmonth === '03') && current.Fyear === anno
					);

				case '02':
					return (
						(current.Fmonth === '04' || current.Fmonth === '05' || current.Fmonth === '06') && current.Fyear === anno
					);

				case '03':
					return (
						(current.Fmonth === '07' || current.Fmonth === '08' || current.Fmonth === '09') && current.Fyear === anno
					);

				case '04':
					return (
						(current.Fmonth === '10' || current.Fmonth === '11' || current.Fmonth === '12') && current.Fyear === anno
					);

				default:
					return null;
			}
		};
	}

	filterByHalf(quarter: any, anno: any) {
		return function (current: any) {
			switch (quarter) {
				case '01':
					return (
						(current.Fmonth === '01' ||
							current.Fmonth === '02' ||
							current.Fmonth === '03' ||
							current.Fmonth === '04' ||
							current.Fmonth === '05' ||
							current.Fmonth === '06') &&
						current.Fyear === anno
					);

				case '02':
					return (
						(current.Fmonth === '07' ||
							current.Fmonth === '08' ||
							current.Fmonth === '09' ||
							current.Fmonth === '10' ||
							current.Fmonth === '11' ||
							current.Fmonth === '12') &&
						current.Fyear === anno
					);

				default:
					return null;
			}
		};
	}

	filterByYear(anno: any) {
		return function (current: any) {
			return current.Fyear === anno;
		};
	}

	searchByQuarter() {
		if (this.selectedQuarter != null && this.selectedYear != null) {
			this.raggruppato = this.groupByKey(
				this.reportDataOrig.filter(this.filterByQuarter(this.selectedQuarter, this.selectedYear)),
				this.typePage
			);
			let g = Object.keys(this.raggruppato).map(item => {
				let dato = this.raggruppato[item];
				return dato;
			});
			g = g.map(function (item) {
				item['intestazione'].totCostiC = item['intestazione'].totCostiC.toFixed(2).replace('.', ',');
				item['intestazione'].totRicaviC = item['intestazione'].totRicaviC.toFixed(2).replace('.', ',');
				item['intestazione'].totCostiF = item['intestazione'].totCostiF.toFixed(2).replace('.', ',');
				item['intestazione'].totRicaviF = item['intestazione'].totRicaviF.toFixed(2).replace('.', ',');
				return item;
			});
			this.assegnaDataSource(g);
		} else {
			alert('Attenzione non hai selezionato il campo quarter o anno');
		}
	}

	searchByHalf() {
		if (this.selectedHalf != null && this.selectedYear != null) {
			this.raggruppato = this.groupByKey(
				this.reportDataOrig.filter(this.filterByHalf(this.selectedHalf, this.selectedYear)),
				this.typePage
			);
			let g = Object.keys(this.raggruppato).map(item => {
				let dato = this.raggruppato[item];
				return dato;
			});
			g = g.map(function (item) {
				item['intestazione'].totCostiC = item['intestazione'].totCostiC.toFixed(2).replace('.', ',');
				item['intestazione'].totRicaviC = item['intestazione'].totRicaviC.toFixed(2).replace('.', ',');
				item['intestazione'].totCostiF = item['intestazione'].totCostiF.toFixed(2).replace('.', ',');
				item['intestazione'].totRicaviF = item['intestazione'].totRicaviF.toFixed(2).replace('.', ',');
				return item;
			});
			this.assegnaDataSource(g);
		} else {
			alert('Attenzione non hai selezionato il campo half o anno');
		}
	}

	searchByYear() {
		if (this.selectedYear != null) {
			this.raggruppato = this.groupByKey(
				this.reportDataOrig.filter(this.filterByYear(this.selectedYear)),
				this.typePage
			);
			let g = Object.keys(this.raggruppato).map(item => {
				let dato = this.raggruppato[item];
				return dato;
			});
			g = g.map(function (item) {
				item['intestazione'].totCostiC = item['intestazione'].totCostiC.toFixed(2).replace('.', ',');
				item['intestazione'].totRicaviC = item['intestazione'].totRicaviC.toFixed(2).replace('.', ',');
				item['intestazione'].totCostiF = item['intestazione'].totCostiF.toFixed(2).replace('.', ',');
				item['intestazione'].totRicaviF = item['intestazione'].totRicaviF.toFixed(2).replace('.', ',');
				return item;
			});
			this.assegnaDataSource(g);
		} else {
			alert('Attenzione non hai selezionato il campo anno');
		}
	}
	// searchWBS() {
	//   this.reportData = this.reportDataOrig.filter((item: any) => {
	//     return item.Wbs.toLowerCase().match(this.wbsSearch.toLowerCase());
	//   })
	// }
	svuota() {
		this.raggruppato = this.groupByKey(this.reportDataOrig, this.typePage);
		let g = Object.keys(this.raggruppato).map(item => {
			let dato = this.raggruppato[item];

			return dato;
		});
		g = g.map(function (item) {
			item['intestazione'].totCostiC = item['intestazione'].totCostiC.toFixed(2).replace('.', ',');
			item['intestazione'].totRicaviC = item['intestazione'].totRicaviC.toFixed(2).replace('.', ',');
			item['intestazione'].totCostiF = item['intestazione'].totCostiF.toFixed(2).replace('.', ',');
			item['intestazione'].totRicaviF = item['intestazione'].totRicaviF.toFixed(2).replace('.', ',');
			return item;
		});

		this.assegnaDataSource(g);
		this.selectedMonth = null;
		this.selectedYear = null;
		this.selectedQuarter = null;
		this.selectedHalf = null;
	}

	loadRigheRaggruppamento(index: number) {
		this.reportDataWBS = [];
		switch (this.typePage) {
			case 'Marketunit':
				this.reportDataWBS = this.reportDataMarketUnit[index];
				break;
			case 'DeliveryCenter':
				this.reportDataWBS = this.reportDataDC[index];
				return;

			case 'DigitalFactory':
				this.reportDataWBS = this.reportDataDF[index];
				break;
			case 'DescrCustomer':
				this.reportDataWBS = this.reportDataCliente[index];
				break;
			case 'Wbs':
				this.reportDataWBS = this.reportDataWBSs[index];
				break;

			default:
				break;
		}
		// this.reportDataWBS = this.reportData[index];
	}

	groupByKey(reportDataOrig: any, key: string) {
		if (this.typePage == 'Marketunit') {
			return reportDataOrig.reduce(function (rv: any, x: any) {
				// rv[x].sumTot =0;
				(rv[x[key]] = rv[x[key]] || []).push(x);
				if (!rv[x[key]]['intestazione']) {
					rv[x[key]]['intestazione'] = {};

					rv[x[key]]['intestazione'].totCostiC = 0;
					rv[x[key]]['intestazione'].totRicaviC = 0;
					rv[x[key]]['intestazione'].totCostiF = 0;
					rv[x[key]]['intestazione'].totRicaviF = 0;
					rv[x[key]]['intestazione'].DigitalFactory = '';
					rv[x[key]]['intestazione'].DeliveryCenter = '';
					rv[x[key]]['intestazione'].Cliente = '';
					rv[x[key]]['intestazione'].WBS = '';
					rv[x[key]]['intestazione'].Marketunit = '';
					rv[x[key]]['intestazione'].DescrWbs = '';
					rv[x[key]]['intestazione'].Button = '+';
				}

				rv[x[key]]['intestazione'].totRicaviF = parseFloat(x.FcRevenues) + rv[x[key]]['intestazione'].totRicaviF;
				rv[x[key]]['intestazione'].totCostiF = parseFloat(x.FcCosts) + rv[x[key]]['intestazione'].totCostiF;
				rv[x[key]]['intestazione'].totRicaviC = parseFloat(x.BalRevenues) + rv[x[key]]['intestazione'].totRicaviC;
				rv[x[key]]['intestazione'].totCostiC = parseFloat(x.BalCosts) + rv[x[key]]['intestazione'].totCostiC;
				rv[x[key]]['intestazione'].DigitalFactory = '';
				rv[x[key]]['intestazione'].DeliveryCenter = '';
				rv[x[key]]['intestazione'].Cliente = '';
				rv[x[key]]['intestazione'].WBS = '';
				rv[x[key]]['intestazione'].Marketunit = x.Marketunit;
				rv[x[key]]['intestazione'].DescrWbs = '';
				rv[x[key]]['intestazione'].Button = '+';
				return rv;
			}, {});
		}

		if (this.typePage == 'DeliveryCenter') {
			return reportDataOrig.reduce(function (rv: any, x: any) {
				// rv[x].sumTot =0;
				(rv[x[key]] = rv[x[key]] || []).push(x);
				if (!rv[x[key]]['intestazione']) {
					rv[x[key]]['intestazione'] = {};
					rv[x[key]]['intestazione'].totCostiC = 0;
					rv[x[key]]['intestazione'].totRicaviC = 0;
					rv[x[key]]['intestazione'].totCostiF = 0;
					rv[x[key]]['intestazione'].totRicaviF = 0;
					rv[x[key]]['intestazione'].DigitalFactory = '';
					rv[x[key]]['intestazione'].DeliveryCenter = '';
					rv[x[key]]['intestazione'].Cliente = '';
					rv[x[key]]['intestazione'].WBS = '';
					rv[x[key]]['intestazione'].Marketunit = '';
					rv[x[key]]['intestazione'].DescrWbs = '';
					rv[x[key]]['intestazione'].Button = '+';
				}

				rv[x[key]]['intestazione'].totRicaviF = parseFloat(x.FcRevenues) + rv[x[key]]['intestazione'].totRicaviF;
				rv[x[key]]['intestazione'].totCostiF = parseFloat(x.FcCosts) + rv[x[key]]['intestazione'].totCostiF;
				rv[x[key]]['intestazione'].totRicaviC = parseFloat(x.BalRevenues) + rv[x[key]]['intestazione'].totRicaviC;
				rv[x[key]]['intestazione'].totCostiC = parseFloat(x.BalCosts) + rv[x[key]]['intestazione'].totCostiC;
				rv[x[key]]['intestazione'].DigitalFactory = '';
				rv[x[key]]['intestazione'].DeliveryCenter = x.DeliveryCenter + '-' + x.DescrDlvctr;
				rv[x[key]]['intestazione'].Cliente = '';
				rv[x[key]]['intestazione'].WBS = '';
				rv[x[key]]['intestazione'].Marketunit = '';
				rv[x[key]]['intestazione'].DescrWbs = '';
				rv[x[key]]['intestazione'].Button = '+';
				return rv;
			}, {});
		}
		if (this.typePage == 'DigitalFactory') {
			return reportDataOrig.reduce(function (rv: any, x: any) {
				// rv[x].sumTot =0;
				(rv[x[key]] = rv[x[key]] || []).push(x);
				if (!rv[x[key]]['intestazione']) {
					rv[x[key]]['intestazione'] = {};
					rv[x[key]]['intestazione'].totCostiC = 0;
					rv[x[key]]['intestazione'].totRicaviC = 0;
					rv[x[key]]['intestazione'].totCostiF = 0;
					rv[x[key]]['intestazione'].totRicaviF = 0;
					rv[x[key]]['intestazione'].DigitalFactory = '';
					rv[x[key]]['intestazione'].DeliveryCenter = '';
					rv[x[key]]['intestazione'].Cliente = '';
					rv[x[key]]['intestazione'].WBS = '';
					rv[x[key]]['intestazione'].Marketunit = '';
					rv[x[key]]['intestazione'].DescrWbs = '';
					rv[x[key]]['intestazione'].Button = '+';
				}

				rv[x[key]]['intestazione'].totRicaviF = parseFloat(x.FcRevenues) + rv[x[key]]['intestazione'].totRicaviF;
				rv[x[key]]['intestazione'].totCostiF = parseFloat(x.FcCosts) + rv[x[key]]['intestazione'].totCostiF;
				rv[x[key]]['intestazione'].totRicaviC = parseFloat(x.BalRevenues) + rv[x[key]]['intestazione'].totRicaviC;
				rv[x[key]]['intestazione'].totCostiC = parseFloat(x.BalCosts) + rv[x[key]]['intestazione'].totCostiC;
				rv[x[key]]['intestazione'].DigitalFactory = x.DigitalFactory;
				rv[x[key]]['intestazione'].DeliveryCenter = '';
				rv[x[key]]['intestazione'].Cliente = '';
				rv[x[key]]['intestazione'].WBS = '';
				rv[x[key]]['intestazione'].Marketunit = '';
				rv[x[key]]['intestazione'].DescrWbs = '';
				rv[x[key]]['intestazione'].Button = '+';
				return rv;
			}, {});
		}

		if (this.typePage == 'DescrCustomer') {
			return reportDataOrig.reduce(function (rv: any, x: any) {
				// rv[x].sumTot =0;
				(rv[x[key]] = rv[x[key]] || []).push(x);
				if (!rv[x[key]]['intestazione']) {
					rv[x[key]]['intestazione'] = {};
					rv[x[key]]['intestazione'].totCostiC = 0;
					rv[x[key]]['intestazione'].totRicaviC = 0;
					rv[x[key]]['intestazione'].totCostiF = 0;
					rv[x[key]]['intestazione'].totRicaviF = 0;
					rv[x[key]]['intestazione'].DigitalFactory = '';
					rv[x[key]]['intestazione'].DeliveryCenter = '';
					rv[x[key]]['intestazione'].Cliente = '';
					rv[x[key]]['intestazione'].WBS = '';
					rv[x[key]]['intestazione'].Marketunit = '';
					rv[x[key]]['intestazione'].DescrWbs = '';
					rv[x[key]]['intestazione'].Button = '+';
				}

				rv[x[key]]['intestazione'].totRicaviF = parseFloat(x.FcRevenues) + rv[x[key]]['intestazione'].totRicaviF;
				rv[x[key]]['intestazione'].totCostiF = parseFloat(x.FcCosts) + rv[x[key]]['intestazione'].totCostiF;
				rv[x[key]]['intestazione'].totRicaviC = parseFloat(x.BalRevenues) + rv[x[key]]['intestazione'].totRicaviC;
				rv[x[key]]['intestazione'].totCostiC = parseFloat(x.BalCosts) + rv[x[key]]['intestazione'].totCostiC;
				rv[x[key]]['intestazione'].DigitalFactory = '';
				rv[x[key]]['intestazione'].DeliveryCenter = '';
				rv[x[key]]['intestazione'].Cliente = x.DescrCustomer;
				rv[x[key]]['intestazione'].WBS = '';
				rv[x[key]]['intestazione'].Marketunit = '';
				rv[x[key]]['intestazione'].DescrWbs = '';
				rv[x[key]]['intestazione'].Button = '+';
				return rv;
			}, {});
		}
		if (this.typePage == 'Wbs') {
			return reportDataOrig.reduce(function (rv: any, x: any) {
				// rv[x].sumTot =0;
				(rv[x[key]] = rv[x[key]] || []).push(x);
				if (!rv[x[key]]['intestazione']) {
					rv[x[key]]['intestazione'] = {};
					rv[x[key]]['intestazione'].totCostiC = 0;
					rv[x[key]]['intestazione'].totRicaviC = 0;
					rv[x[key]]['intestazione'].totCostiF = 0;
					rv[x[key]]['intestazione'].totRicaviF = 0;
					rv[x[key]]['intestazione'].DigitalFactory = '';
					rv[x[key]]['intestazione'].DeliveryCenter = '';
					rv[x[key]]['intestazione'].Cliente = '';
					rv[x[key]]['intestazione'].WBS = '';
					rv[x[key]]['intestazione'].Marketunit = '';
					rv[x[key]]['intestazione'].DescrWbs = '';
					rv[x[key]]['intestazione'].Button = '+';
				}

				rv[x[key]]['intestazione'].totRicaviF = parseFloat(x.FcRevenues) + rv[x[key]]['intestazione'].totRicaviF;
				rv[x[key]]['intestazione'].totCostiF = parseFloat(x.FcCosts) + rv[x[key]]['intestazione'].totCostiF;
				rv[x[key]]['intestazione'].totRicaviC = parseFloat(x.BalRevenues) + rv[x[key]]['intestazione'].totRicaviC;
				rv[x[key]]['intestazione'].totCostiC = parseFloat(x.BalCosts) + rv[x[key]]['intestazione'].totCostiC;
				rv[x[key]]['intestazione'].DigitalFactory = '';
				rv[x[key]]['intestazione'].DeliveryCenter = '';
				rv[x[key]]['intestazione'].Cliente = '';
				rv[x[key]]['intestazione'].WBS = x.Wbs;
				rv[x[key]]['intestazione'].Marketunit = '';
				rv[x[key]]['intestazione'].DescrWbs = x.DescrWbs;
				rv[x[key]]['intestazione'].Button = '+';
				return rv;
			}, {});
		}
		if (this.typePage == undefined) {
			return reportDataOrig.reduce(function (rv: any, x: any) {
				// rv[x].sumTot =0;
				(rv[x[key]] = rv[x[key]] || []).push(x);
				if (!rv[x[key]]['intestazione']) {
					rv[x[key]]['intestazione'] = {};
					rv[x[key]]['intestazione'].totCostiC = 0;
					rv[x[key]]['intestazione'].totRicaviC = 0;
					rv[x[key]]['intestazione'].totCostiF = 0;
					rv[x[key]]['intestazione'].totRicaviF = 0;
					rv[x[key]]['intestazione'].DigitalFactory = '';
					rv[x[key]]['intestazione'].DeliveryCenter = '';
					rv[x[key]]['intestazione'].Cliente = '';
					rv[x[key]]['intestazione'].WBS = '';
					rv[x[key]]['intestazione'].Marketunit = '';
					rv[x[key]]['intestazione'].DescrWbs = '';
					rv[x[key]]['intestazione'].Button = '+';
				}

				rv[x[key]]['intestazione'].totRicaviF = parseFloat(x.FcRevenues) + rv[x[key]]['intestazione'].totRicaviF;
				rv[x[key]]['intestazione'].totCostiF = parseFloat(x.FcCosts) + rv[x[key]]['intestazione'].totCostiF;
				rv[x[key]]['intestazione'].totRicaviC = parseFloat(x.BalRevenues) + rv[x[key]]['intestazione'].totRicaviC;
				rv[x[key]]['intestazione'].totCostiC = parseFloat(x.BalCosts) + rv[x[key]]['intestazione'].totCostiC;
				rv[x[key]]['intestazione'].DigitalFactory = '';
				rv[x[key]]['intestazione'].DeliveryCenter = '';
				rv[x[key]]['intestazione'].Cliente = '';
				rv[x[key]]['intestazione'].WBS = x.Wbs;
				rv[x[key]]['intestazione'].Marketunit = '';
				rv[x[key]]['intestazione'].DescrWbs = x.DescrWbs;
				rv[x[key]]['intestazione'].Button = '+';
				return rv;
			}, {});
		}
	}
}
