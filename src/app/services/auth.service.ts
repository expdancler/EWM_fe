import { Injectable } from '@angular/core';
import {StorageService} from '../utils/secureStorage';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private storageService: StorageService) { }

  isLoggedIn() {
    const userLogged = this.storageService.secureStorage.getItem('loggedUser');
    let load;
    if (userLogged === "OK") {
      load = true;
    }
    else {
      load = false;
    }
    return load;

  }
}
