import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import * as Flexmonster from 'flexmonster';
import {ForecastExcelService} from "../services/forecast-excel.service";
import {ExcelService} from "../services/excel.service";

interface FormatField {
    [key: string]: boolean | undefined,
    isPercent?: boolean,
}
interface ColProps {
    [key: string]: any,
    uniqueName: string,
    caption?: string,
    type?: string,
    isMeasure?: boolean,
    format?: FormatField,
    hidden?: {
      web: boolean,
      excel: boolean
    },
    style?: {
        bgColor?: "grey" | "blue" | "electro" | "lightblue" | "yellow",
        width?: number
    },
    total?: {
        operator: "+" | "/",
        n1?: string,
        n2?: string,
    }
}
interface PeriodProp {
    month: string,
    year: string
}

const BG_COLOR = {
    grey: {color: "c0c0c0", textColor: "000000"},
    blue: {color: "44546a", textColor: "ffffff"},
    electro: {color: "1f497d", textColor: "ffffff"},
    lightblue: {color: "00b0f0", textColor: "000000"},
    yellow: {color: "ffff00", textColor: "ff0000"},
}

const MARGINE_DIRETTO = {
    m: "MargineDiretto",
    m1: "MargineDiretto01",
    m2: "MargineDiretto02",
    m3: "MargineDiretto03",
    m4: "MargineDiretto04",
    m5: "MargineDiretto05",
    m6: "MargineDiretto06",
    m7: "MargineDiretto07",
    m8: "MargineDiretto08",
    m9: "MargineDiretto09",
    m10: "MargineDiretto10",
    m11: "MargineDiretto11",
    m12: "MargineDiretto12",
    tot: "MargineDirettoTot",
}
const RICAVI_NETTI = {
    m: "RicaviNetti",
    m1: "RicaviNetti01",
    m2: "RicaviNetti02",
    m3: "RicaviNetti03",
    m4: "RicaviNetti04",
    m5: "RicaviNetti05",
    m6: "RicaviNetti06",
    m7: "RicaviNetti07",
    m8: "RicaviNetti08",
    m9: "RicaviNetti09",
    m10: "RicaviNetti10",
    m11: "RicaviNetti11",
    m12: "RicaviNetti12",
    tot: "RicaviNettiTot",
}

const tableStructure = {
    IdRiga: {uniqueName: "IdRiga", caption: "IdRiga", hidden: {web: true, excel: true}} as ColProps,
    Fonte: {uniqueName: "Fonte", caption: "FONTE", style: {bgColor: "grey", width: 14.71}} as ColProps,
    DescrMarket: {uniqueName: "DescrMarket", caption: "MIU", style: {bgColor: "grey", width: 20.43}} as ColProps,
    AccountUnit: {uniqueName: "AccountUnit", caption: "ACCOUNT UNIT", style: {bgColor: "grey", width: 13}} as ColProps,
    Country: {uniqueName: "Country", caption: "COUNTRY", style: {bgColor: "grey", width: 12.29}} as ColProps,
    Soc: {uniqueName: "Soc", caption: "SOCIETA' CHE FATTURA AL CLIENTE", style: {bgColor: "grey", width: 25.71}} as ColProps,
    DescrCli: {uniqueName: "DescrCli", caption: "CLIENTE", style: {bgColor: "grey", width: 30.86}} as ColProps,
    NuovoCli: {uniqueName: "NuovoCli", caption: "NUOVO CLIENTE", style: {bgColor: "grey", width: 9.71}} as ColProps,
    CustomerAggr: {uniqueName: "CustomerAggr", caption: "AGGREGATO CUSTOMER", style: {bgColor: "grey", width: 17.57}} as ColProps,
    DescrCliFat: {uniqueName: "DescrCliFat", caption: "CLIENTE FATTURAZIONE", style: {bgColor: "electro", width: 21.14}} as ColProps,
    DescrAccount: {uniqueName: "DescrAccount", caption: "ACCOUNT MANAGER", style: {width: 15.43}} as ColProps,
    TipoFcs: {uniqueName: "TipoFcs", caption: "TIPOLOGIA", style: {bgColor: "grey", width: 16.14}} as ColProps,
    DescrChiaveAdr: {uniqueName: "DescrChiaveAdr", caption: "CHIAVE DI RISULTATO", style: {bgColor: "grey", with: 16.14}} as ColProps,
    DigitalFact: {uniqueName: "DigitalFact", caption: "DIGITAL FACTORY", style: {bgColor: "grey", width: 10.57}} as ColProps,
    DescrOfferLine: {uniqueName: "DescrOfferLine", caption: "OFFERLINE", style: {bgColor: "grey", width: 35.43}} as ColProps,
    DescrSolution: {uniqueName: "DescrSolution", caption: "SOLUTION LINE", style: {bgColor: "grey", width: 19}} as ColProps,
    DescrItembudget: {uniqueName: "DescrItembudget", caption: "BUDGET ITEM", style: {bgColor: "grey", width: 16.57}} as ColProps,
    Codopp: {uniqueName: "Codopp", caption: "COD OPPORTUNITA'", style: {bgColor: "grey", width: 19.71}} as ColProps,
    DescrStatoOpp: {uniqueName: "DescrStatoOpp", caption: "STATO OPPORTUNITA'", style: {bgColor: "grey", width: 19.71}} as ColProps,
    ImportoOpp: {uniqueName: "ImportoOpp", caption: "IMPORTO OPPORTUNITA'", type: "number", isMeasure: true, style: {bgColor: "grey", width: 15.86}, total: {operator: "+"}} as ColProps,
    StartOpp: {uniqueName: "StartOpp", caption: "START DATE OPPORTUNITA'", type: "date string", style: {bgColor: "grey", width: 15.43}} as ColProps,
    EndOpp: {uniqueName: "EndOpp", caption: "END DATE OPPORTUNITA'", type: "date string", style: {bgColor: "grey", width: 15.43}} as ColProps,
    ProbabOpp: {uniqueName: "ProbabOpp", caption: "PROBABILITA' SUCCESSO OPPORTUNITA'", type: "number", format: {isPercent: true}, isMeasure: true, style: {bgColor: "grey", width: 16.29}} as ColProps,
    RicaviProbabOpp: {uniqueName: "RicaviProbabOpp", caption: "RICAVI PESATI OPPORTUNITA'/ACR", type: "number", isMeasure: true, style: {bgColor: "blue", width: 21.14}, total: {operator: "+"}} as ColProps,
    RicaviPesati: {uniqueName: "RicaviPesati", caption: "RICAVI PESATI", type: "number", isMeasure: true, style: {bgColor: "blue", width: 18.00}, total: {operator: "+"}} as ColProps,
    Wbs: {uniqueName: "Wbs", caption: "CODICE COMMESSA", style: {width: 16.43}} as ColProps,
    DescrWbs: {uniqueName: "DescrWbs", caption: "DESCRIZIONE", style: {width: 16.57}} as ColProps,
    RicaviFcsPre: {uniqueName: "RicaviFcsPre", caption: "QUOTA RICAVI FCST (ESERCIZI PRECEDENTI)", type: "number", isMeasure: true, style: {bgColor: "blue", width: 16.57}, total: {operator: "+"}} as ColProps,
    QuotaFcsAnno: {uniqueName: "QuotaFcsAnno", caption: "QUOTA RICAVI FCST(%)", type: "number", format: {isPercent: true}, isMeasure: true, style: {width: 17.14}} as ColProps,
    RicaviFcsAnno: {uniqueName: "RicaviFcsAnno", caption: "QUOTA RICAVI FCST", type: "number", isMeasure: true, style: {bgColor: "blue", width: 15}, total: {operator: "+"}} as ColProps,
    RicaviFcsSucc: {uniqueName: "RicaviFcsSucc", caption: "QUOTA RICAVI FCST (ESERCIZI SUCCESSIVI)", type: "number", isMeasure: true, style: {bgColor: "blue", width: 16.57}, total: {operator: "+"}} as ColProps,
    Backlog: {uniqueName: "Backlog", caption: "BACKLOG", type: "number", isMeasure: true, style: {bgColor: "blue", width: 16.14}, total: {operator: "+"}} as ColProps,
    OrdinatoDaAcq: {uniqueName: "OrdinatoDaAcq", caption: "ORDINATO DA ACQUISIRE", type: "number", isMeasure: true, style: {bgColor: "blue", width: 18}, total: {operator: "+"}} as ColProps,

    RicaviLordi01: {uniqueName: "RicaviLordi01", caption: "RL gen", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi02: {uniqueName: "RicaviLordi02", caption: "RL feb", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi03: {uniqueName: "RicaviLordi03", caption: "RL mar", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi04: {uniqueName: "RicaviLordi04", caption: "RL apr", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi05: {uniqueName: "RicaviLordi05", caption: "RL mag", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi06: {uniqueName: "RicaviLordi06", caption: "RL giu", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi07: {uniqueName: "RicaviLordi07", caption: "RL lug", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi08: {uniqueName: "RicaviLordi08", caption: "RL ago", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi09: {uniqueName: "RicaviLordi09", caption: "RL set", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi10: {uniqueName: "RicaviLordi10", caption: "RL ott", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi11: {uniqueName: "RicaviLordi11", caption: "RL nov", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordi12: {uniqueName: "RicaviLordi12", caption: "RL dic", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    RicaviLordiTot: {uniqueName: "RicaviLordiTot", caption: "RL TOTALE", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,

    CostiRivendita01: {uniqueName: "CostiRivendita01", caption: "CR gen", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita02: {uniqueName: "CostiRivendita02", caption: "CR feb", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita03: {uniqueName: "CostiRivendita03", caption: "CR mar", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita04: {uniqueName: "CostiRivendita04", caption: "CR apr", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita05: {uniqueName: "CostiRivendita05", caption: "CR mag", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita06: {uniqueName: "CostiRivendita06", caption: "CR giu", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita07: {uniqueName: "CostiRivendita07", caption: "CR lug", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita08: {uniqueName: "CostiRivendita08", caption: "CR ago", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita09: {uniqueName: "CostiRivendita09", caption: "CR set", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita10: {uniqueName: "CostiRivendita10", caption: "CR ott", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita11: {uniqueName: "CostiRivendita11", caption: "CR nov", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivendita12: {uniqueName: "CostiRivendita12", caption: "CR dic", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    CostiRivenditaTot: {uniqueName: "CostiRivenditaTot", caption: "CR TOTALE", type: "number", isMeasure: true, style: {bgColor: "blue", width: 16}, total: {operator: "+"}} as ColProps,

    RicaviNetti01: {uniqueName: RICAVI_NETTI.m1, caption: "RN gen", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti02: {uniqueName: RICAVI_NETTI.m2, caption: "RN feb", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti03: {uniqueName: RICAVI_NETTI.m3, caption: "RN mar", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti04: {uniqueName: RICAVI_NETTI.m4, caption: "RN apr", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti05: {uniqueName: RICAVI_NETTI.m5, caption: "RN mag", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti06: {uniqueName: RICAVI_NETTI.m6, caption: "RN giu", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti07: {uniqueName: RICAVI_NETTI.m7, caption: "RN lug", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti08: {uniqueName: RICAVI_NETTI.m8, caption: "RN ago", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti09: {uniqueName: RICAVI_NETTI.m9, caption: "RN set", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti10: {uniqueName: RICAVI_NETTI.m10, caption: "RN ott", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti11: {uniqueName: RICAVI_NETTI.m11, caption: "RN nov", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNetti12: {uniqueName: RICAVI_NETTI.m12, caption: "RN dic", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    RicaviNettiTot: {uniqueName: RICAVI_NETTI.tot, caption: "RN TOTALE", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,

    MarginePerc01: {uniqueName: "MarginePerc01", caption: "MP gen", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m1, n2: RICAVI_NETTI.m1}} as ColProps,
    MarginePerc02: {uniqueName: "MarginePerc02", caption: "MP feb", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m2, n2: RICAVI_NETTI.m2}} as ColProps,
    MarginePerc03: {uniqueName: "MarginePerc03", caption: "MP mar", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m3, n2: RICAVI_NETTI.m3}} as ColProps,
    MarginePerc04: {uniqueName: "MarginePerc04", caption: "MP apr", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m4, n2: RICAVI_NETTI.m4}} as ColProps,
    MarginePerc05: {uniqueName: "MarginePerc05", caption: "MP mag", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m5, n2: RICAVI_NETTI.m5}} as ColProps,
    MarginePerc06: {uniqueName: "MarginePerc06", caption: "MP giu", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m6, n2: RICAVI_NETTI.m6}} as ColProps,
    MarginePerc07: {uniqueName: "MarginePerc07", caption: "MP lug", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m7, n2: RICAVI_NETTI.m7}} as ColProps,
    MarginePerc08: {uniqueName: "MarginePerc08", caption: "MP ago", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m8, n2: RICAVI_NETTI.m8}} as ColProps,
    MarginePerc09: {uniqueName: "MarginePerc09", caption: "MP set", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m9, n2: RICAVI_NETTI.m9}} as ColProps,
    MarginePerc10: {uniqueName: "MarginePerc10", caption: "MP ott", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m10, n2: RICAVI_NETTI.m10}} as ColProps,
    MarginePerc11: {uniqueName: "MarginePerc11", caption: "MP nov", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m11, n2: RICAVI_NETTI.m11}} as ColProps,
    MarginePerc12: {uniqueName: "MarginePerc12", caption: "MP dic", type: "number", format: {isPercent: true}, isMeasure: true, total: {operator: "/", n1: MARGINE_DIRETTO.m12, n2: RICAVI_NETTI.m12}} as ColProps,
    MarginePercTot: {uniqueName: "MarginePercTot", caption: "MP TOTALE", type: "number", format: {isPercent: true}, isMeasure: true, style: {bgColor: "blue", width: 26.43}, total: {operator: "/", n1: MARGINE_DIRETTO.tot, n2: RICAVI_NETTI.tot}} as ColProps,

    MargineDiretto01: {uniqueName: MARGINE_DIRETTO.m1, caption: "MD gen", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto02: {uniqueName: MARGINE_DIRETTO.m2, caption: "MD feb", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto03: {uniqueName: MARGINE_DIRETTO.m3, caption: "MD mar", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto04: {uniqueName: MARGINE_DIRETTO.m4, caption: "MD apr", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto05: {uniqueName: MARGINE_DIRETTO.m5, caption: "MD mag", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto06: {uniqueName: MARGINE_DIRETTO.m6, caption: "MD giu", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto07: {uniqueName: MARGINE_DIRETTO.m7, caption: "MD lug", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto08: {uniqueName: MARGINE_DIRETTO.m8, caption: "MD ago", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto09: {uniqueName: MARGINE_DIRETTO.m9, caption: "MD set", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto10: {uniqueName: MARGINE_DIRETTO.m10, caption: "MD ott", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto11: {uniqueName: MARGINE_DIRETTO.m11, caption: "MD nov", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDiretto12: {uniqueName: MARGINE_DIRETTO.m12, caption: "MD dic", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    MargineDirettoTot: {uniqueName: MARGINE_DIRETTO.tot, caption: "MD TOTALE", type: "number", isMeasure: true, style: {bgColor: "blue", width: 34.71}, total: {operator: "+"}} as ColProps,

    Costi01: {uniqueName: "Costi01", caption: "CO gen", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi02: {uniqueName: "Costi02", caption: "CO feb", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi03: {uniqueName: "Costi03", caption: "CO mar", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi04: {uniqueName: "Costi04", caption: "CO apr", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi05: {uniqueName: "Costi05", caption: "CO mag", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi06: {uniqueName: "Costi06", caption: "CO giu", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi07: {uniqueName: "Costi07", caption: "CO lug", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi08: {uniqueName: "Costi08", caption: "CO ago", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi09: {uniqueName: "Costi09", caption: "CO set", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi10: {uniqueName: "Costi10", caption: "CO ott", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi11: {uniqueName: "Costi11", caption: "CO nov", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    Costi12: {uniqueName: "Costi12", caption: "CO dic", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,
    CostiTot: {uniqueName: "CostiTot", caption: "CO TOTALE", type: "number", isMeasure: true, style: {bgColor: "blue"}, total: {operator: "+"}} as ColProps,

    Check: {uniqueName: "Check", caption: "CHECK", type: "string", style: {bgColor: "blue", width: 8.23}} as ColProps,

    Blank: {uniqueName: "Blank", caption: "-", type: "string", hidden: {web: true, excel: false}} as ColProps,

    Q1: {uniqueName: "Q1", caption: "Q1", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    Q2: {uniqueName: "Q2", caption: "Q2", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    Q3: {uniqueName: "Q3", caption: "Q3", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    Q4: {uniqueName: "Q4", caption: "Q4", type: "number", isMeasure: true, total: {operator: "+"}} as ColProps,
    FY: {uniqueName: "FY", caption: "FY", type: "number", isMeasure: true, style: {width: 16.57}, total: {operator: "+"}} as ColProps,
}

@Component({
    selector: 'app-forecast-excel',
    templateUrl: './forecast-excel.component.html',
    styleUrls: ['./forecast-excel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForecastExcelComponent implements OnInit {
    private report: any = {};
    private data: any = [];

    private rowUn: any = [];
    private captions: any = {};
    private measures: any[] = [];
    private fieldsFormat: any[] = [];

    private firstYearBdg = 2026;
    private nYearBdg: number = Math.max(1, (new Date().getFullYear() + 1) - this.firstYearBdg + 1)

    private reportFormats = {
        name: "", // vale come default
        thousandsSeparator: ".",
        decimalSeparator: ",",
        decimalPlaces: 2,
        maxDecimalPlaces: 2,
        // maxSymbols: 20,
        // currencySymbol: "",
        // negativeCurrencyFormat: "-$1",
        // positiveCurrencyFormat: "$1",
        nullValue: "",
        textAlign: "right",
        beautifyFloatingPoint: true
    }
    private reportOptions = {
        viewType: 'grid',
        grid: {
            type: 'flat',
            showTotals: 'off',
            showGrandTotals: 'on',
        },
        showEmptyValues: false,
        // distinguishNullUndefinedEmpty: true,
    }
    private reportSlice = {
        rows: this.rowUn,
        columns: [ { uniqueName: '[Measures]' } ],
        measures: this.measures,
    }

    yearRange: string[] = ["", ...Array.from(
        { length: new Date().getFullYear() - 2000 + 1 }, // Lunghezza dell'array
        (_, index) => (new Date().getFullYear() - index).toString() // Funzione di mappatura per generare gli anni
    )];
    yearRangeBdg: string[] = Array.from(
        { length: this.nYearBdg },
        (_, index) => (this.firstYearBdg + index).toString() // Funzione di mappatura per generare gli anni
    ).reverse();
    monthRange: {value: string, label: string}[] = [
        {value: "", label: ""},
        {value: "1", label: "Gennaio"},
        {value: "2", label: "Febbraio"},
        {value: "3", label: "Marzo"},
        {value: "4", label: "Aprile"},
        {value: "5", label: "Maggio"},
        {value: "6", label: "Giugno"},
        {value: "7", label: "Luglio"},
        {value: "8", label: "Agosto"},
        {value: "9", label: "Settembre"},
        {value: "10", label: "Ottobre"},
        {value: "11", label: "Novembre"},
        {value: "12", label: "Dicembre"},
    ];
    selectePeriod: {crm: PeriodProp, ewm: PeriodProp, bdg: {year: string}} | null = null;
    reportMode: "fcst" | "bdg" = "fcst";

    constructor(private forecastExcelService: ForecastExcelService, private excelService: ExcelService) {
    }

    ngOnInit(): void {
        this.reportMode = "fcst";

        let currYear = new Date().getFullYear().toString();
        let currMonth = (new Date().getMonth()+1).toString();
        this.selectePeriod = {
            crm: {month: currMonth, year: currYear},
            ewm: {month: currMonth, year: currYear},
            bdg: {year: (new Date().getFullYear() + 1).toString()}
        }

        this.captions = this.getCaptions();
        this.measures = this.getMeasures();
        this.rowUn = this.getPropsRow();
        this.fieldsFormat = this.getSpecialFormat();

        this.prepareTab();
        this.getDataForecast();
    }

    onChangePeriodCrm(section: string, event: any) {
        if (this.selectePeriod?.crm) {
            // @ts-ignore
            this.selectePeriod.crm[section] = event.value;
        }
    }
    onChangePeriodEwm(section: string, event: any) {
        if (this.selectePeriod?.ewm) {
            // @ts-ignore
            this.selectePeriod.ewm[section] = event.value;
        }
    }

    onChangePeriodBdg(event: any) {
        if (this.selectePeriod?.bdg) {
            // @ts-ignore
            this.selectePeriod.bdg.year = event.value;
        }
    }

    isSelectedPeriodEmpty(){
        if (!this.selectePeriod)
            return true;

        const crm = this.selectePeriod?.crm ?? {month: "", year: ""}
        const ewm = this.selectePeriod?.ewm ?? {month: "", year: ""}
        const bdg = this.selectePeriod?.bdg ?? {year: ""}

        if (this.reportMode == "fcst") {
            return (crm.month == "" || crm.year == "") && (ewm.month == "" || ewm.year == "");
        } else {
            return bdg.year == ""
        }
    }

    processResult(res: { data: { data: any; }; }){
        this.data = this.adjustData(res?.data?.data ?? []);

        this.reportSlice = {
            ...this.reportSlice,
            rows: this.rowUn,
            measures: this.measures,
        }
        this.refreshDataTable();
    }

    getDataForecast(){
        const crm = this.selectePeriod?.crm ?? {month: "", year: ""}
        const ewm = this.selectePeriod?.ewm ?? {month: "", year: ""}
        const bdg = this.selectePeriod?.bdg ?? {year: ""}

        if (this.reportMode == "fcst") {
            if ((crm.month == "" && crm.year != "") || (crm.month != "" && crm.year == "")){
                alert("Attenzione! il periodo selezionato per CRM è incompleto. La ricerca non verrà eseguita per CRM")
            }
            if ((ewm.month == "" && ewm.year != "") || (ewm.month != "" && ewm.year == "")){
                alert("Attenzione! il periodo selezionato per EWM è incompleto. La ricerca non verrà eseguita per EWM")
            }

            this.forecastExcelService
                .getForecastData({crm, ewm})
                .subscribe(res => this.processResult(res));
        } else {
            if (bdg.year == ""){
                alert("Attenzione! l'anno selezionato per BUDGET non è valido. La ricerca non verrà eseguita per BUDGET")
            }

            this.forecastExcelService
                .getForecastData({bdg})
                .subscribe(res => this.processResult(res));
        }
    }

    getCaptions(): {} {
        let caps: any = {};
        Object.values(tableStructure).forEach((prop: any) => {
            caps[prop.uniqueName] = {caption: prop.caption, type: prop.type} as ColProps;
        })

        return caps;
    }
    getMeasures(): {uniqueName: string}[]{
        return Object.values(tableStructure)
            .filter((prop: ColProps) => prop.isMeasure)
            .map((prop: any) => { return {uniqueName: prop.uniqueName} })
    }
    getPropsRow():{uniqueName: string}[] {
        return Object.values(tableStructure)
            .filter((prop: ColProps) => !prop.hidden?.web)
            /* Se togli dalla prop "rows" le misure (andando a finire quindi solo in "columns")
             tutte le misure andranno alla fine della tabella */
            // .filter((prop: ColProps) => !prop.isMeasure)
            .map((prop: any) => { return{uniqueName: prop.uniqueName} })
    }
    getSpecialFormat(): any[]{
        return Object.values(tableStructure)
            .filter((prop: any) => prop.format)
            .map((prop: any) => {
                return {name: prop.uniqueName, ...prop.format}
            })
    }

    adjustData(response: any[]): any[] {
        function toPercent(value: number | string): number {
            let p: number;
            if (typeof value == "string")
                p = parseFloat(value)/100
            else
                p = value/100

            return p;
        }
        function monthSum(row: any, propName: string): number{
            let sum: number = 0;
            for(let i = 1; i <= 12; i++){
                let prop = propName + (i<10 ? "0"+i : ""+i);
                sum += parseFloat(row[prop] ?? 0);
            }

            return sum;
        }
        function quarterSum(row: any, propName: string, quarter: number): number{
            let sum: number = 0;
            for(let i = (3*(quarter-1))+1; i <= 3*quarter; i++){
                let prop = propName + (i<10 ? "0"+i : ""+i);
                sum += parseFloat(row[prop] ?? 0);
            }

            return sum;
        }
        function marginePerc(row: any){
            let month: any = {};
            for(let i = 1; i <= 12; i++){
                let prop = "MarginePerc" + (i<10 ? "0"+i : ""+i);
                month[prop] = toPercent(row[prop] ?? 0);
            }

            return month;
        }
        function controlledDivison(numerator: number | string, denominator: number | string): number{
            try{
                let num = typeof numerator == "string" ? parseFloat(numerator) : numerator;
                let denom = typeof denominator == "string" ? parseFloat(denominator) : denominator;

                if (!denominator || denominator == 0) return 0;

                return (num/denom) * 100;
            }catch (e){
                return 0;
            }
        }

        const header = Object.keys(tableStructure);

        let arr = response?.map((row) => {
            let ricaviLordiTot = 0;
            let margineDirettoTot = 0;
            let ricaviNettiTot = 0;
            let marginePercTot = 0;

            let q1 = 0, q2 = 0, q3 = 0, q4 = 0;

            // Questo è per levare eventuali campi non mappati
            let obj: any = {}
            // @ts-ignore
            header.forEach((prop: string) => obj[prop] = row[prop]) // row[prop] == "" ? .. : ..

            let quotaFcsAnno = controlledDivison(obj.RicaviFcsAnno, obj.RicaviProbabOpp);

            for(let i = 1; i <= 12; i++){
                let prop = (i<10 ? "0"+i : ""+i)
                obj[RICAVI_NETTI.m+prop] = (parseFloat(obj["RicaviLordi"+prop] ?? 0) - parseFloat(obj["CostiRivendita"+prop] ?? 0)) //.toFixed(2)
                obj[MARGINE_DIRETTO.m+prop] = (parseFloat(obj[RICAVI_NETTI.m+prop] ?? 0) - parseFloat(obj["Costi"+prop] ?? 0)) //.toFixed(2)
            }

            ricaviLordiTot = monthSum(obj, "RicaviLordi");
            margineDirettoTot = monthSum(obj, MARGINE_DIRETTO.m);
            ricaviNettiTot = monthSum(obj, RICAVI_NETTI.m);
            marginePercTot = controlledDivison(margineDirettoTot, ricaviNettiTot)

            q1 = quarterSum(obj, "RicaviLordi", 1);
            q2 = quarterSum(obj, "RicaviLordi", 2);
            q3 = quarterSum(obj, "RicaviLordi", 3);
            q4 = quarterSum(obj, "RicaviLordi", 4);

            return {
                ...obj,
                NuovoCli: obj.NuovoCli?.toLowerCase() == "true" ? "SI" : "NO",
                ProbabOpp: toPercent(obj.ProbabOpp),
                QuotaFcsAnno: toPercent(quotaFcsAnno),
                Backlog: obj.Wbs ? parseFloat(obj.RicaviFcsAnno) : 0,
                OrdinatoDaAcq: obj.Wbs ? 0: parseFloat(obj.RicaviFcsAnno),

                ...marginePerc(obj),

                // Parte dei TOTALI
                RicaviLordiTot: ricaviLordiTot,
                CostiRivenditaTot: monthSum(obj, "CostiRivendita"),
                RicaviNettiTot: ricaviNettiTot,
                MarginePercTot: toPercent(marginePercTot),
                MargineDirettoTot: margineDirettoTot,
                CostiTot: monthSum(obj, "Costi"),

                Check: parseFloat(obj.RicaviFcsAnno).toFixed(2) == ricaviLordiTot.toFixed(2) ? "OK" : "KO",
                Q1: q1,
                Q2: q2,
                Q3: q3,
                Q4: q4,
                FY: (q1+q2+q3+q4),
            }
        })
        return arr;
    }

    refreshDataTable(){
        // this.report.removeAllConditions();

        this.report.updateData({ data: this.data, mapping: this.captions });
        // visualizzo le colonne slice
        this.report.runQuery(this.reportSlice);
        this.report.setOptions(this.reportOptions);
        this.fieldsFormat?.forEach((field: any) => {
            this.report.setFormat(field, field.name)
        })

        this.report.collapseAllData();
        this.report.refresh();
    }

    customizeToolbar(toolbar: any) {
        const showedTabs: string[] = ['format', 'options', 'fields', 'fullscreen'];
        let tabs = toolbar.getTabs();

        let btnExport: Flexmonster.ToolbarTab;

        toolbar.getTabs = function () {
            // remove the Save tab using its id
            // tabs = tabs.filter((tab: any) => tab.id != 'fm-tab-save');

            btnExport = tabs.filter((tab: Flexmonster.ToolbarTab) => tab?.title?.toLowerCase() === "export")?.[0];
            btnExport = btnExport?.menu?.filter((item: Flexmonster.ToolbarTab) => item.id.includes('excel'))?.[0] ?? btnExport;
            btnExport = {
                ...btnExport,
                title: "Esporta xslx",
                // handler: () => {}
            }

            tabs = tabs.filter((tab: Flexmonster.ToolbarTab) => showedTabs.includes(tab?.title?.toLowerCase() ?? ""));

            // return [btnExport, ...tabs];
            return [...tabs];
        };
    }

    customizeCellFunction(cell: any, data: any) {
        const header = data?.hierarchy?.uniqueName ?? "";

        if (data.rowIndex == 0){
            if (header == tableStructure.Q1.uniqueName ||
                header == tableStructure.Q2.uniqueName ||
                header == tableStructure.Q3.uniqueName ||
                header == tableStructure.Q4.uniqueName ||
                header == tableStructure.FY.uniqueName )
                cell.addClass("cell_header_yellow");
            else
                cell.addClass("cell_blue");
        } else if (data.rowIndex == 1){
            // Riga totali
            return;
        } else {
            // @ts-ignore
            const bg = tableStructure[header]?.style?.bgColor;
            if (bg)
                cell.addClass("cell_"+bg);
            else
                return;
        }
    }

    // custom menu, quando clicco con il taso destro nella tabella, aggiunte due nuove voci
    customizeFlexmonsterContextMenu = (items: any, data: any, viewType: any) => {
        if (viewType !== 'flat') {
            items.push({
                label: 'Expand all',
                handler: () => {
                    console.log('expand data');
                    this.report.expandAllData();
                },
            });

            items.push({
                label: 'Collapse all',
                handler: () => {
                    console.log('callapse data');
                    this.report.collapseAllData();
                },
            });
        }
        return items;
    };

    prepareTab(): void {
        /*
        Se un campo è tra i dati ma non nella sezione 'row' non sarà
        mostrato a video ma sarà selezionabile dalla finestra 'fields'
        */
        this.report = new Flexmonster({
            container: 'report-container',
            licenseKey: 'Z7F1-XF1J2E-3G0O36-1V2K2R-2F230O-2P5B32-3J712N-1S6702-1M5K14-0J',
            componentFolder: 'https://cdn.flexmonster.com/',
            toolbar: true,
            beforetoolbarcreated: this.customizeToolbar,
            customizeCell: this.customizeCellFunction,
            // customizeContextMenu: this.customizeFlexmonsterContextMenu,
            // altezza tabella
            height: 690,
            global: {
                localization: {
                    "grid": {
                        "blankMember": ""
                    }
                }
            },
            report: {
                dataSource: {
                    data: this.data,
                    mapping: this.captions,
                },
                conditions: [],
                formats: [this.reportFormats, ...this.fieldsFormat],
                options: this.reportOptions,
                slice: this.reportSlice,
            },
        });
    }

    exportAllDataAsXLSX(){
        const COL_WIDTH: number = 14.71;

        const header = Object.values(tableStructure)
            .filter((prop: ColProps) => !prop.hidden?.excel)
            .map((col: any) => {
                const isQuarter = col.uniqueName == tableStructure.Q1.uniqueName ||
                    col.uniqueName == tableStructure.Q2.uniqueName || col.uniqueName == tableStructure.Q3.uniqueName ||
                    col.uniqueName == tableStructure.Q4.uniqueName || col.uniqueName == tableStructure.FY.uniqueName
                const isBlank = col.uniqueName == tableStructure.Blank.uniqueName;
                return {
                    id: col.uniqueName,
                    caption: col.caption,
                    type: col?.format?.isPercent ? "percent" : col.type ?? "string",
                    total: col.total ?? null,
                    style: {
                        bgColor: isBlank ? "" : isQuarter ? "yellow" : "blue",
                        width: col.style?.width ?? COL_WIDTH
                    }
                }
            });
        const rows = this.data?.map((row: any) => {
            let obj: any = {};

            Object.values(tableStructure).forEach((s: any) => {
                // @ts-ignore
                const bgColor = BG_COLOR[s?.style?.bgColor]?.color ?? "FFFFFF";
                // @ts-ignore
                const textColor = BG_COLOR[s?.style?.bgColor]?.textColor ?? "000000";

                obj[s.uniqueName] = {
                    value: row[s.uniqueName], //s.type == "number" ? formatNumber(row[s.uniqueName], "it", "1.2-2") : row[s.uniqueName],
                    type: s?.format?.isPercent ? "percent" : s.type ?? "string",
                    style: {
                        bgColor: bgColor,
                        textColor: textColor,
                    }
                }
            })

            return obj;
        })
        this.excelService.exportExcelFcstClienti(
            this.reportMode === "fcst" ? "FCST_COMMERCIALE" : "BDG_COMMERCIALE",
            this.reportMode === "fcst" ? "FCST CLIENTI" : "BDG CLIENTI",
            header,
            rows
        );
    }
}
