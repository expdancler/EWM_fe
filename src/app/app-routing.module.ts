import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './auth-guard/auth.guard';
import {LoginComponent} from './components/login/login.component';
import {environment} from '../environments/environment';


const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {
        path: 'work-space',
        loadChildren: () => import('./components/work-space/work-space.module').then(m => m.WorkSpaceModule),
        canActivate: [AuthGuard],
    },
    {
        path: 'wbs-manager',
        loadChildren: () => import('./components/wbs-manager/wbs-manager.module').then(m => m.WbsManagerModule),
        canActivate: [AuthGuard],
    },
    {
        path: 'reports',
        loadChildren: () => import('./components/reports/reports.module').then(m => m.ReportsModule),
        canActivate: [AuthGuard],
    },
    {
        path: 'reportsOld',
        loadChildren: () => import('./components/reportsOld/reports.module').then(m => m.ReportsModule),
        canActivate: [AuthGuard],

    },
    {
        path: 'forecast',
        loadChildren: () => import('./components/forecast-excel/forecast-excel.module').then(m => m.ForecastExcelModule),
        canActivate: [AuthGuard],
    },
];

const onlyProdRoutes: Routes = environment.production ? [
    // {
    //     path: 'forecast',
    //     loadChildren: () => import('./components/forecast-excel/forecast-excel.module').then(m => m.ForecastExcelModule),
    //     canActivate: [AuthGuard],
    // },
] : []

@NgModule({
    imports: [RouterModule.forRoot([...routes, ...onlyProdRoutes])],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
