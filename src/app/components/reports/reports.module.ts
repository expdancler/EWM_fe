import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from 'src/app/app.component';
import { InterceptorService } from 'src/app/services/interceptor.service';
import { ReportsComponent } from './components/reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { Ng2OrderModule } from 'ng2-order-pipe';
import { FlexmonsterPivotModule } from 'ng-flexmonster';
import { WbsManagerModule } from '../wbs-manager/wbs-manager.module';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
	declarations: [ReportsComponent],
	imports: [
		ReportsRoutingModule,
		CommonModule,
		NgSelectModule,
		FormsModule,
		ReactiveFormsModule,
		Ng2SearchPipeModule,
		Ng2OrderModule,
		NgxPaginationModule,
		FlexmonsterPivotModule,
		WbsManagerModule,
    MatSelectModule
	],
	providers: [{ provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }],
	bootstrap: [AppComponent],
})
export class ReportsModule {}
