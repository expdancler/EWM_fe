import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { WbsManagerService } from '../../services/wbs-manager.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Utils from '../../../../utils/utils';
import {StorageService} from '../../../../utils/secureStorage';

@Component({
	selector: 'app-comunicazioni',
	templateUrl: './comunicazioni.component.html',
	styleUrls: ['./comunicazioni.component.scss'],
})
export class ComunicazioniComponent implements OnInit /* , OnChanges */ {
	@Input() dataWBsDetail: any = [{}];
	wbs: string = '';
	isObject: Object = {};
	// @Input() wbs: any;
	selectedDestinatario: any = null;
	option_Destinatari: any = [];
	oggetto: string = '';
	messaggio: string = '';
	Chat: any = [];
	risposta: any = [];
	name_loggedUser: any;
	surname_loggedUser: any;
	sender: any = [];
	senderCheck: any = [];
	messaggi: any = [];
	inviaMessaggioAlert: boolean = false;
	haRisposto: any = false;
	@Output() messLetti = new EventEmitter<any>();

	constructor(private wbsManagerService: WbsManagerService, private spinner: NgxSpinnerService,private storageService: StorageService) {}

	ngOnInit(): void {
		// resetta lo scroll della pagina
		window.scrollTo(0, 0);

		// this.surname_loggedUser = this.storageService.secureStorage.getItem('surname_loggedUser');
		// this.name_loggedUser = this.storageService.secureStorage.getItem('name_loggedUser');

		this.wbs = this.storageService.secureStorage.getItem('wbs') ?? '';

		this.isObject = { Communications: 'X' }; // carica solamente i msh

		// Ottengo le comunicazioni effettuati con una chiamata
		this.wbsManagerService.getSenderComunicazioni(this.wbs).subscribe(
			(response: any) => {
				this.option_Destinatari = response.data.EtRecipient;
				this.sender = response.data.EsSender;
			},
			err => console.log('request error', err)
		);
		// this.Chat = creaChat(this.dataWBsDetail.data.EtComm)

		this.wbsManagerService.getWBSDetail(this.wbs, this.isObject).subscribe(
			(response: any) => {
				this.Chat = this.creaChat(response.data.EtComm);
				this.storageService.secureStorage.setItem('CommToRead', '0');
				this.messLetti.emit(0);
			},
			err => console.log('request error', err)
		);
	}

	// ngOnChanges(): void {
	//   if (this.dataWBsDetail.data) {
	//     this.Chat = creaChat(this.dataWBsDetail.data.EtComm);
	//     this.storageService.secureStorage.setItem('CommToRead', '0');
	//     this.messLetti.emit(0);
	//   }
	// }

	trackByIndex(index: number, _obj: any): any {
		return index;
	}

	invia() {
		if (this.oggetto && this.messaggio && this.senderCheck.length != 0) {
			this.inviaMessaggioAlert = false;
			const dateObj = new Date();
			let mail: any = [];
			let values: any = $("#btnGroup input[type='checkbox']:checked").toArray();
			let Destinatari: any = [];
			values.forEach((element: any) => {
				Destinatari.unshift(this.option_Destinatari[element.value]);
			});
			mail = {
				oggetto: this.oggetto,
				body: this.messaggio,
				destinatari: Destinatari,
				mittente: this.sender,
			};
			this.wbsManagerService.createComunicazione(this.wbs, mail).subscribe((_response: any) => {
				this.wbsManagerService.getWBSDetail(this.wbs, this.isObject).subscribe((response: any) => {
					this.Chat = this.creaChat(response.data.EtComm);
					this.selectedDestinatario = null;
					this.oggetto = '';
					this.messaggio = '';
					this.senderCheck = [];
				});
			});
		} else {
			this.inviaMessaggioAlert = true;
		}
	}

	mostra() {
		console.log(this.Chat);
	}

	rispondi(messaggio: any, index: any) {
		let Destinatari = [];
		Destinatari.unshift(messaggio.mittenteCompleto);
		const mail = {
			oggetto: messaggio.oggetto,
			body: this.risposta[index],
			destinatari: Destinatari,
			mittente: this.sender,
			parentIdRow: messaggio.IdRow,
		};
		this.wbsManagerService.createComunicazione(this.wbs, mail).subscribe(() => {
			this.wbsManagerService.getWBSDetail(this.wbs, this.isObject).subscribe(() => {
				const date = new Date();
				const dateInMs = Date.now(); // Data in millisecondi;
				// const dateObj = new Date(dateInMs).toLocaleDateString(); // Ottengo la data in formato DD/MM/YYYY
				const dateTimeObj = new Date(dateInMs).toLocaleTimeString();
				// const dateObj = [ String(date.getDate()).padStart(2, '0'), String(date.getMonth()+1).padStart(2, '0'), date.getFullYear()].join('/');
				const dateObj = Utils.formatDataIt(date);

				const risposta = {
					// mittente: this.surname_loggedUser + this.name_loggedUser,
					mittente: messaggio?.mittente ?? 'Anonimo', // Se è presente inserisco il mittente altrimenti inserisco 'Anonimo'
					messaggio: this.risposta[index],
					data: dateObj + ' - ' + dateTimeObj,
				};
				this.Chat[index].Risposte.unshift(risposta); // controllare ora
				this.risposta[index] = '';
			});
		});
	}

	parseDate(str: any) {
		var mdy = str.split('/');
		return new Date(mdy[2], mdy[0] - 1, mdy[1]);
	}

	datediff(first: any, second: any) {
		return Math.round((second - first) / (1000 * 60 * 60 * 24));
	}

	creaChat(EtComm: any): any {
		let Chat: any = [];
		EtComm.forEach((element: any) => {
			// const date = new Date(element.SendDate);
			// const dateObj = [ String(date.getDate()).padStart(2, '0'), String(date.getMonth()+1).padStart(2, '0'), date.getFullYear()].join('/');
			const dateObj = Utils.formatDataIt(element.SendDate);
			if (element?.ParentIdRow === '000') {
				const messaggio = {
					destinatari: element.ToRecipient.map((e: { Name: any }) => e.Name).join(', '),
					mittente: element.Sender.Name,
					oggetto: element.Subject,
					body: element.Body,
					data: dateObj + '-' + element.SendTime,
					IdRow: element.IdRow,
					ParentIdRow: element.ParentIdRow,
					Risposte: [],
					mittenteCompleto: element.Sender,
				};

				Chat.unshift(messaggio);
			} else {
				const nodoPadre = Chat.filter((item: any) => item.IdRow == element.ParentIdRow);

				const risposta = {
					mittente: element.Sender.Name,
					messaggio: element.Body,
					data: dateObj + '-' + element.SendTime,
				};

				nodoPadre[0].Risposte.unshift(risposta);
			}
		});

		return Chat;
	}
}

// function creaChat(EtComm: any): any {
//   let Chat: any = [];
//   EtComm.forEach((element: any) => {
//     if (element?.ParentIdRow === '000') {
//       const date = new Date(element.SendDate);
//       const dateObj = [ String(date.getDate()).padStart(2, '0'), String(date.getMonth()+1).padStart(2, '0'), date.getFullYear()].join('/');
//       let messaggio = {
//         destinatari: element.ToRecipient.map((e: { Name: any }) => e.Name).join(', '),
//         mittente: element.Sender.Name,
//         oggetto: element.Subject,
//         body: element.Body,
//         data: dateObj + ' - ' + element.SendTime,
//         IdRow: element.IdRow,
//         ParentIdRow: element.ParentIdRow,
//         Risposte: [],
//         mittenteCompleto: element.Sender,
//       };
//       Chat.unshift(messaggio);
//     }
//   });
//   EtComm.forEach((element: any) => {
//     if (element?.ParentIdRow != '000') {
//       const date = new Date(element.SendDate);
//       const dateObj = [ String(date.getDate()).padStart(2, '0'), String(date.getMonth()+1).padStart(2, '0'), date.getFullYear()].join('/');
//       let nodoPadre = Chat.filter(function (item: any) {
//         return item.IdRow == element.ParentIdRow;
//       });
//       let risposta = {
//         mittente: element.Sender.Name,
//         messaggio: element.Body,
//         data: dateObj + ' - ' + element.SendTime,
//       };
//       nodoPadre[0].Risposte.unshift(risposta);
//     }
//   });

//   return Chat;
// }
