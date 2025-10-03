import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ForecastExcelComponent} from "./components/forecast-excel.component";

const routes: Routes = [
  {
    path: '',
    component: ForecastExcelComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForecastExcelRoutingModule { }
