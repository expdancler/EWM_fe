import {Injectable} from '@angular/core';
import * as FileSaver from 'file-saver';

import {Border, Cell, Row, Workbook, Worksheet} from 'exceljs';
// import {WorkSheet} from "xlsx";

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

/*
--- INFO SU EXCELJS ---
https://www.npmjs.com/package/exceljs/v/4.3.0
-----------------------
*/

interface CellStyle {
    bgColor?: string,
    color?: string,
    width?: number,
}

interface Header {
    id: any,
    caption: string,
    type?: string,
    style?: CellStyle,
    total?: {
        operation: string,
        n1?: string,
        n2?: string,
    },
}

interface CellProps {
    [key: string]: any,

    id: any,
    value?: string | number
    formula?: string
    style?: CellStyle
}

interface TextStyle {
    [key: string]: any,

    color?: string,
    size?: number,
    bold?: boolean,
    alignCenter?: boolean
}

const BG_COLOR = {
    grey: {color: "c0c0c0", textColor: "000000"},
    blue: {color: "44546a", textColor: "ffffff"},
    electro: {color: "1f497d", textColor: "ffffff"},
    lightblue: {color: "00b0f0", textColor: "ffffff"},
    yellow: {color: "ffff00", textColor: "ff0000"},
}

@Injectable({
    providedIn: 'root'
})
export class ExcelService {
    private CELL_WIDTH: number = 16;

    constructor() {
    }

    setCellAsNumber(cell: Cell, percent?: boolean) {
        if (percent) {
            cell.value = cell?.value
                ? typeof cell.value == "string"
                    ? parseFloat(cell.value)
                    : cell.value
                : 0
            cell.numFmt = '#,##0.00%';
        } else {
            cell.value = cell?.value
                ? typeof cell.value == "string"
                    ? parseFloat(cell.value)
                    : cell.value
                : 0
            cell.numFmt = '#,##0.00';
        }
    }

    formatCell(cell: Cell, bgColor: string,
               textSyle: TextStyle = {color: "000000", size: 11, bold: false, alignCenter: false},
               border: string[] = ["0", "0", "0", "0"]) {
        function addBorder(i: number) {
            let l = border[i] == "0" ? bs : {...bs, color: {argb: border[i]}}
            if (i == 0)
                cell.border = {
                    ...cell.border,
                    left: l as Partial<Border>
                }
            else if (i == 1)
                cell.border = {
                    ...cell.border,
                    top: l as Partial<Border>
                }
            else if (i == 2)
                cell.border = {
                    ...cell.border,
                    right: l as Partial<Border>
                }
            else if (i == 3)
                cell.border = {
                    ...cell.border,
                    bottom: l as Partial<Border>
                }
        }

        let bs = {style: 'thin'} // Border Style
        cell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: bgColor}};
        cell.font = {name: 'Calibri', color: {argb: textSyle.color}, size: textSyle.size, bold: textSyle.bold};

        if (border[0] != "") addBorder(0) // left
        if (border[1] != "") addBorder(1) // top
        if (border[2] != "") addBorder(2) // right
        if (border[3] != "") addBorder(3) // bottom

        if (textSyle.alignCenter)
            cell.alignment = {vertical: 'middle', horizontal: 'center', wrapText: true};
    }

    getRangeToMerge(row: Row, headerRow: Header[], start: string, end: string) {
        // let si = headerRow.findIndex((col: Header) => col.id?.includes(start))
        // let ei = headerRow.findIndex((col: Header) => col.id?.includes(end))

        return {
            colStart: row.getCell(start)?.$col$row?.split("$")[1],
            colEnd: row.getCell(end)?.$col$row?.split("$")[1]
        };
    }

    formatMergedCells(row: Row, headerRow: Header[], worksheet: Worksheet, start: string, end: string, label: string, sameLine: boolean = false, top: boolean = true) {
        let cIndex = top ? 2 : 3; // col index

        let range = this.getRangeToMerge(row, headerRow, start, end);
        let rStart = range.colStart + cIndex;
        let rEnd = range.colEnd + (sameLine ? cIndex : (cIndex + 1))

        worksheet.mergeCells(rStart + ":" + rEnd);
        const cell = worksheet.getCell(rEnd);
        cell.value = label
        this.formatCell(cell, BG_COLOR.lightblue.color,
            {color: top ? BG_COLOR.lightblue.textColor : "000000", size: 13, bold: true, alignCenter: true},
            ["0", top ? "" : "0", "0", ""]
        )
    }

    exportExcelFcstClienti(fileName: string, sheetName: string, headerProps: Header[], dataRow: CellProps[]) {
        const workBook = new Workbook();
        const workSheet = workBook.addWorksheet(sheetName, {views: [{showGridLines: false}]});
        workSheet.columns = headerProps.map((col: Header) => {
            return {header: "", key: col.id, width: col.style?.width ?? this.CELL_WIDTH}
        })

        // Riga dei totali sulle colonne
        const headerTotal = workSheet.getRow(1)
        headerTotal.height = 15.75
        headerTotal.border = {bottom: {style: "thin", color: {argb: "9b9b9b"}}}
        // Prima calcolo tutte le somme
        headerProps
            .filter((col: Header) => col.total && !col.total.n1 && !col.total.n2)
            .forEach((col: Header) => {
                const cell = headerTotal.getCell(col.id);

                cell.value = dataRow
                    .map((rd: CellProps) => parseFloat(rd[col.id]?.value ?? 0))
                    .reduce((sum, current) => sum + current, 0);

                this.formatCell(cell, BG_COLOR.blue.color, {
                    color: BG_COLOR.blue.textColor,
                    size: 11,
                    bold: true,
                    alignCenter: true
                })
                this.setCellAsNumber(cell, col.type == "percent");
            })
        // Poi le uso per altri valori sempre sopra
        headerProps
            .filter((col: Header) => col.total && col.total.n1 && col.total.n2)
            .forEach((col: Header) => {
                const cell = headerTotal.getCell(col.id);

                const cellNumer = headerTotal.getCell(col?.total?.n1 ?? "A1")
                const cellDenom = headerTotal.getCell(col?.total?.n2 ?? "A1")

                let s = 0;
                // if (col.total?.operation == "/") {
                // @ts-ignore
                if (cellDenom.value && parseFloat(cellDenom.value) != 0) {
                    // @ts-ignore
                    s = parseFloat(cellNumer.value) / parseFloat(cellDenom.value);
                } else {
                    s = 0;
                }
                // }
                cell.value = s;

                this.formatCell(cell, BG_COLOR.blue.color, {
                    color: BG_COLOR.blue.textColor,
                    size: 11,
                    bold: true,
                    alignCenter: true
                })
                this.setCellAsNumber(cell, col.type == "percent");
            })

        // Riga per i costi di rivendita
        const row1 = workSheet.addRow([]);
        row1.height = 17.25
        // Riga per la tipologia dei mensili (Ricavi lordi, margine ecc...)
        const row2 = workSheet.addRow([]);
        row2.height = 36.75

        this.formatMergedCells(row1, headerProps, workSheet, "RicaviLordi01", "RicaviLordiTot", "RICAVI LORDI");
        this.formatMergedCells(row1, headerProps, workSheet, "CostiRivendita01", "CostiRivenditaTot", "COSTI DI RIVENDITA", true, true);
        this.formatMergedCells(row1, headerProps, workSheet, "CostiRivendita01", "CostiRivenditaTot", "COSTI DI RIVENDITA ESTERNO", true, false);
        this.formatMergedCells(row1, headerProps, workSheet, "RicaviNetti01", "RicaviNettiTot", "RICAVI NETTI");
        this.formatMergedCells(row1, headerProps, workSheet, "MarginePerc01", "MarginePercTot", "MARGINE PERCENTUALE");
        this.formatMergedCells(row1, headerProps, workSheet, "MargineDiretto01", "MargineDirettoTot", "MARGINE DIRETTO");
        this.formatMergedCells(row1, headerProps, workSheet, "Costi01", "CostiTot", "COSTI");

        const header = workSheet.addRow(headerProps?.map((col: Header) => {
            let cap = col.caption

            if (col.id.toLowerCase().includes("blank")) cap = "";

            else if (col.id.includes("01")) cap = "gen";
            else if (col.id.includes("02")) cap = "feb";
            else if (col.id.includes("03")) cap = "mar";
            else if (col.id.includes("04")) cap = "apr";
            else if (col.id.includes("05")) cap = "mag";
            else if (col.id.includes("06")) cap = "giu";
            else if (col.id.includes("07")) cap = "lug";
            else if (col.id.includes("08")) cap = "ago";
            else if (col.id.includes("09")) cap = "set";
            else if (col.id.includes("10")) cap = "ott";
            else if (col.id.includes("11")) cap = "nov";
            else if (col.id.includes("12")) cap = "dic";

            return cap;
        }));
        headerProps
            .filter((col: Header) => col.id != "Blank")
            .forEach((col: Header, i: number) => {
                const cell = header.getCell(col.id);

                // @ts-ignore
                const bg = BG_COLOR[col?.style?.bgColor]?.color ?? "ffffff";
                // @ts-ignore
                const text = BG_COLOR[col?.style?.bgColor]?.textColor ?? "000000";

                this.formatCell(cell, bg, {color: text, size: 12, bold: true, alignCenter: true})
            })
        header.height = 47.25

        dataRow.forEach((rd: CellProps) => { // rd -> rowData
            let adjRow: string[] = [];
            headerProps.forEach((col: Header) => adjRow.push(rd[col.id]?.value ?? ""))

            const row = workSheet.addRow(adjRow);

            headerProps
                .filter((col: Header) => col.id != "Blank")
                .forEach((col: Header) => {
                    const cell = row.getCell(col.id);

                    const bg = rd[col.id]?.style?.bgColor ?? "ffffff";
                    const text = rd[col.id]?.style?.textColor ?? "000000";

                    if (!cell.value || cell.value == "")
                        cell.value = null;

                    this.formatCell(cell, bg, {color: text, size: 11})

                    if (rd[col.id]?.type != "string" && rd[col.id]?.type != "data string")
                        this.setCellAsNumber(cell, rd[col.id]?.type == "percent")
                })
            row.height = 14.25
        })

        workBook.xlsx.writeBuffer().then(data => {
            let blob = new Blob([data], {
                type: EXCEL_TYPE, //'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            FileSaver.saveAs(blob, fileName + EXCEL_EXTENSION);
        })
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
        FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    }
}
