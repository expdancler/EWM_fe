import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {StorageService} from "../utils/secureStorage";
import {ForecastExcelService} from "../components/forecast-excel/services/forecast-excel.service";


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    private protectedPaths = ["/forecast"];

    constructor(private authService: AuthService, private router: Router, private storageService: StorageService, private forecastExcelService: ForecastExcelService) {
    }

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {

        if (!this.authService.isLoggedIn()) {
            this.storageService.secureLocalStorage.setItem('precPath', window.location.pathname);
            this.router.navigate(['/login']);
            return false;
        } else {
            const url = state.url.split('#')?.[0];                     // ignora eventuale fragment
            const isRestricted = this.protectedPaths.some(rx => rx === url);
            if (!isRestricted) return true;

            const res = await this.forecastExcelService.checkServiceAccess().toPromise();
            return res.data.forecast;
        }
    }
}