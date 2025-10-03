import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  private eventSubject = new BehaviorSubject<any>(undefined);
  private nameUserEventSubject = new BehaviorSubject<any>(undefined);
  private userSurnameEventSubject = new BehaviorSubject<any>(undefined);

  triggerSomeEvent(param: any) {
    this.eventSubject.next(param);
  }

  getEventSubject(): BehaviorSubject<any> {
    return this.eventSubject;
  }

  triggerNameUserEvent(paramName: any) {
    this.nameUserEventSubject.next(paramName);
  }

  getUserNameEventSubject(): BehaviorSubject<any> {
    return this.nameUserEventSubject;
  }

  triggerSurnameUserEvent(paramSurname: any) {
    this.userSurnameEventSubject.next(paramSurname);
  }

  getSurnameNameUserEventSubject(): BehaviorSubject<any> {
    return this.userSurnameEventSubject;
  }
}
