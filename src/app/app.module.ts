import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ModalComponent} from './components/modal/modal.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxSpinnerModule} from "ngx-spinner";
import {InterceptorService} from './services/interceptor.service';
import {NgSelectModule} from '@ng-select/ng-select';
import {LoginComponent} from './components/login/login.component';
import {ToastrModule} from 'ngx-toastr';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from "@angular/material/card";

import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {FlexmonsterPivotModule} from 'ng-flexmonster';

import localeIt from '@angular/common/locales/it';
import {registerLocaleData} from "@angular/common";

registerLocaleData(localeIt);

@NgModule({
    declarations: [
        AppComponent,
        ModalComponent,
        LoginComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NgxSpinnerModule,
        NgSelectModule,
        ToastrModule.forRoot({
            closeButton: true,
            extendedTimeOut: 0,
            timeOut: 0,
            tapToDismiss: false
        }),
        MatButtonToggleModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FlexmonsterPivotModule
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true},
        {provide: LOCALE_ID, useValue: 'it'},
    ],
    exports: [
        AppComponent,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
