import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subject } from 'rxjs/internal/Subject';


@Injectable({
  providedIn: 'root'
})
export class EventlogService {


  // New best practice for implementing events
   // Notify on existance of new, formatted/extended api
   public _newLog = new Subject<any>();
   _newLogEvent = this._newLog.asObservable();

  constructor() { 

  }

  public logs: any[] = [];
  public logSubscription: Subscription;

  public log(log: {type?: string, message: string, contract?: string, data?: {}}) {
    console.log ("one log: ", log);
    let hours = new Date().getHours().toString();
    let minutes = new Date().getMinutes().toString();
    let time = hours + ':' + minutes;
    log['time'] = time;
    this.logs.push(log);

    // tell log console about new event
    this._newLog.next(log);
  }

  public clear(){
    this.logs = [];
  }
}
