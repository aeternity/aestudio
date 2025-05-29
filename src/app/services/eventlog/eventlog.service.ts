import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subject } from 'rxjs/internal/Subject';
import { ILog } from 'src/app/helpers/interfaces';

@Injectable({
  providedIn: 'root',
})
export class EventlogService {
  // New best practice for implementing events
  // Notify on existance of new, formatted/extended api
  public _newLog = new Subject<ILog>();
  _newLogEvent = this._newLog.asObservable();

  public logs: any[] = [];
  public logSubscription: Subscription;

  public log(log: ILog) {
    console.log('Log Service: : ', log);
    const hours = new Date().getHours().toString();
    const minutes = new Date().getMinutes().toString();
    const time = hours + ':' + minutes;
    log.time = time;
    this.logs.push(log);

    // tell log console about new event
    this._newLog.next(log);
  }

  public clear() {
    this.logs = [];
  }
}
