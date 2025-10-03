import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { WbsManagerComponent } from './components/wbs-manager/wbs-manager.component';

const routes: Routes = [
    {
        path: '',
        component: WbsManagerComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WbsManagerRoutingModule {
}