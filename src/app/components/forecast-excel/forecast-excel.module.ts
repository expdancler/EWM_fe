import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForecastExcelRoutingModule } from './forecast-excel-routing.module';
import {ForecastExcelComponent} from "./components/forecast-excel.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatCardModule} from "@angular/material/card";
import {FormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    ForecastExcelComponent
  ],
    imports: [
        CommonModule,
        ForecastExcelRoutingModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatCardModule,
        FormsModule
    ]
})
export class ForecastExcelModule { }
