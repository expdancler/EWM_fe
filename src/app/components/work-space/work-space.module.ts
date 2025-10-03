import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from 'src/app/app.component';
import { InterceptorService } from 'src/app/services/interceptor.service';
import { CommonModule } from "@angular/common";
import { WorkSpaceComponent } from './components/work-space/work-space.component';
import { WorkSpaceRoutingModule } from './work-space-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalsComponent } from './utils/modals/modals.component';
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
    declarations: [
        WorkSpaceComponent,
        ModalsComponent
    ],
    imports: [
        WorkSpaceRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgSelectModule,
        MatTooltipModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class WorkSpaceModule { }
