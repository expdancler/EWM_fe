import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ReportsComponent } from './components/reports.component';

const routes: Routes = [
    {
        path: '',
        component: ReportsComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule {
}