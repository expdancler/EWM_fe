import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { WorkSpaceComponent } from './components/work-space/work-space.component';


const routes: Routes = [
    {
        path: '',
        component: WorkSpaceComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WorkSpaceRoutingModule {
}