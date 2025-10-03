import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForecastExcelRoutingModule } from './forecast-excel-routing.module';
import {ForecastExcelComponent} from "./components/forecast-excel.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";


@NgModule({
  declarations: [
    ForecastExcelComponent
  ],
    imports: [
        CommonModule,
        ForecastExcelRoutingModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule
    ]
})
export class ForecastExcelModule { }
