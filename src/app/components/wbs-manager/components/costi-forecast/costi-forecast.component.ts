import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-costi-forecast',
  templateUrl: './costi-forecast.component.html',
  styleUrls: ['./costi-forecast.component.scss']
})
export class CostiForecastComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    //--------------------------------
    //INIZIALIZZAZIONI DI PROVA
    //-------------------------------
    // inizializzazione voci di costo
    this.push_array_vociCosto();
    // inizializzazione totale voci costo
    this.push_array_totaliVociCosto();
    // inizializzazione totali costi di costo acr
    this.push_totaliVociCostoAcr();
    // inizializzazione costo del personale con la prima riga vuota
    this.array_costoPersonale.push({checkBox:false,profiloCosto:'',costo:'',gennaio:'',importoGennaio:'',febbario:'',importoFebbraio:''});
    // inizializzazione consulenza con la prima riga vuota
    this.array_costoConsulenza.push({checkBox:false,fornitore:'',dettaglio:'',gennaio:'',febbario:'',marzo:'',aprile:''});
  }
  //-------------------------------------------------
  //-------------------------------------------------
  //-------------------------------------------------
  // FUNZIONI DI PROVA
  //-------------------------------------------------
  //-------------------------------------------------
  //-------------------------------------------------
  // CARD COSTO DEL PERSONALE
  // Funzione che prende il check del costo del personale per la successiva cancellazione
  public check_costoPersonale (i:any,e:any){
    console.log(i);
    console.log(e.target.checked);
    if(e.target.checked == true){
      this.array_costoPersonale[i].checkBox = true;
    }
    else{
      this.array_costoPersonale[i].checkBox = false;
    }
  }
  // ng select costo personale
  public option_selectProfiloCosto =['Profilo 1','Profilo 2','Profilo 3','Profilo 4'];
  // Funzione inserimento costo personale
  public array_costoPersonale:any[]=[];
  public push_array_costoPersonale(){

    this.array_costoPersonale.push({checkBox:false,profiloCosto:'',costo:'',gennaio:'',importoGennaio:'',febbario:'',importoFebbraio:''});
  }
  // Funzione cancellazione costo personale
  // array contenteti indici che delle righe che bisogna eliminare

  public delete_array_costoPersonale() {
    let newArray:any = [];
    newArray = this.array_costoPersonale;
    this.array_costoPersonale = [];
    newArray.forEach((item: any) => {
      if(item.checkBox === false){
        this.array_costoPersonale.push(item);
      }
    });
    if(this.array_costoPersonale.length == 0){
      this.array_costoPersonale.push({checkBox:false,profiloCosto:'',costo:'',gennaio:'',importoGennaio:'',febbario:'',importoFebbraio:''});
    }
  }


  // CARD COSTO DI CONSULENZA
  // Funzione che prende il check del costo di consulenza per la successiva cancellazione
  public check_costoConsulenza (i:any,e:any){
    if(e.target.checked == true){
      this.array_costoConsulenza[i].checkBox = true;
    }
    else{
      this.array_costoConsulenza[i].checkBox = false;
    }
  }
  // ng select fornitore
  public option_selectFornitore = ['FOrnitore 1','Fornitore 2','FOrnitore 3','FOrnitore 4'];
  // Funzione inserimento costo personale
  public array_costoConsulenza:any[]=[];
  public push_array_costoConsulenza(){
    this.array_costoConsulenza.push({checkBox:false,fornitore:'',dettaglio:'',gennaio:'',febbario:'',marzo:'',aprile:''});
  }
  // Funzione cancellazione costo consulenza
  public delete_array_costoConsulenza(){
    let newArray:any = [];
    newArray = this.array_costoConsulenza;
    this.array_costoConsulenza = [];
    newArray.forEach((item: any) => {
      if(item.checkBox === false){
        this.array_costoConsulenza.push(item);
      }
    });
    if(this.array_costoConsulenza.length==0){
      this.array_costoConsulenza.push({checkBox:false,fornitore:'',dettaglio:'',gennaio:'',febbario:'',marzo:'',aprile:''});
    }
  }
  // CARD VOCI DI COSTO
  // Funzione inserimento voci costo
  public array_vociCosto:any[]=[];
  public push_array_vociCosto(){
    for(let i=0;i<this.array_dettaglio_vociCosto.length;i++){
    this.array_vociCosto.push({dettaglio:this.array_dettaglio_vociCosto[i],gennaio:'',febbario:'',marzo:'',aprile:''});
    }
  }
  // array dettaglio
  public array_dettaglio_vociCosto = [
    'HW,SW E SERVIZI C/VENDITA',
    'COSTI E SERVIZI INFRAGRUPPO',
    'SPESE DI VIAGGIO',
    'IDENNITA DI TRASFERTA',
    'SOSPENSIONE COSTI ADEMPIMENTO',
    'ALTRI COSTI',
    'DIRITTI DI LICANZA E PARTERSHIP',
    'CONSULENZA LEGALI E SPESE LEGALI',
    'FORMAZIONE E CERTIFICAZIONE',
    'MANUTENZIONI E ASSISTENZA',
    'LEASING E NOLEGGI',
    'TELEFONIA E RETE DATI',
    'ONERI DIVERSI DI GESTIONE',
    'INFRAGRUPPO NO GESTIONALE',
    'PARTITE STRAORDINARI',
    'AMMORTAMENTI',
    'PROVENTI E ONERI FINANZIARI'
  ]
  // CARD TOTALI VOCI DI COSTO FORECAST
  public array_totaliVociCosto:any[]=[];
  public totale_totaliVociCosto:any;
  public push_array_totaliVociCosto(){
    let totale = 0;
    for(let i=0;i<this.array_totaliVociCosto_dettaglio_value.length;i++) {
      let value = parseInt(this.array_totaliVociCosto_dettaglio_value[i].value);
      totale = totale + value;
      this.array_totaliVociCosto.push({
        descrizione: this.array_totaliVociCosto_dettaglio_value[i].descrizione,
        value: this.array_totaliVociCosto_dettaglio_value[i].value
      });
    }
    this.totale_totaliVociCosto = totale
  }
  public array_totaliVociCosto_dettaglio_value = [
    {descrizione:'COSTO DEL PERSONALE',value:'160232.64'},
    {descrizione:'COSTO DI CONSULENZA',value:'13747.22'},
    {descrizione:'HW,SW W SERVIZI C/VENDITA',value:'18122.10'},
    {descrizione:'COSTI E SERVIZI INFRAGRUPPO',value:'18122.10'},
    {descrizione:'SPESE DI VIAGGIO',value:'13747.22'},
    {descrizione:'INDENNITA DI TRASFERTA',value:'18122.10'},
    {descrizione:'SOSPENSIONE COSTI ADEMPIMENTO',value:'18122.10'},
    {descrizione:'ALTRI COSTI',value:'160232.64'},
    {descrizione:'DIRITTI DI LICENZA E PARTNERSHIP',value:'13747.22'},
    {descrizione:'CONSULENZE LEGALI E SPESE LEGALI',value:'18122.10'},
    {descrizione:'FORMAZIONE E CERTIFICAZIONE',value:'18122.10'},
    {descrizione:'MANUTENZIONE E ASSISTENZA',value:'1347.22'},
    {descrizione:'LEASING E NOLEGGI',value:'18122.10'},
    {descrizione:'TELEFONIA E RETE DATI',value:'18122.10'},
    {descrizione:'ONERI DIVERSI DI GESTIONE',value:'18122.10'},
    {descrizione:'INFRAGRUPPO NO GESTIONALE',value:'18122.10'},
    {descrizione:'PARTITE STRAORDINARI',value:'13747.22'},
    {descrizione:'AMMORTAMENTI',value:'18122.10'},
    {descrizione:'PROVENTI E ONERI FINANZIARI',value:'18122.10'},
  ]
  // CARD TOTALI VOCI DI COSTO ACR
  public array_totaliVociCostoAcr:any[]=[];
  public totale_totaliVociCostoAcr:any;
  public push_totaliVociCostoAcr(){
    let totale = 0;
    for(let i=0;i<this.array_totaliVociCostoAcr_dettaglio_value.length;i++){
      let value = parseInt(this.array_totaliVociCostoAcr_dettaglio_value[i].value);
      totale = totale + value;
    this.array_totaliVociCostoAcr.push({
      descrizione:this.array_totaliVociCostoAcr_dettaglio_value[i].descrizione,
      value:this.array_totaliVociCostoAcr_dettaglio_value[i].value,
    });
    }
    this.totale_totaliVociCostoAcr = totale;
  }
  public array_totaliVociCostoAcr_dettaglio_value = [
    {descrizione:'COSTI DIGITAL FACTORY',value:'160232.64'},
    {descrizione:'CONSULENZE TECNICHE',value:'13747.22'},
    {descrizione:'ALTRI COSTI',value:'18122.10'},
  ]
}
