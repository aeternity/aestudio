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

/* 
switch (_type) {
  case "log" :
    log = {timestamp: time , message: _contract + ':'  + _message , type: 'LOG'}
    this.logs.push(log);
    break;
  case "warn" :
    log = {timestamp: time , message: _contract + ':'  + _message , type: 'WARN'}
    this.logs.push(log);  
    break;
  case "success" :
    log = {timestamp: time , message: _contract + ':'  + _message , type: 'SUCCESS'}
    this.logs.push(log); 
    break;
  case "error" :
    log = {timestamp: time , message: _contract + ':'  + _message , type: 'ERR'}
    this.logs.push(log); 
    break;
  case "info" :
    log = {timestamp: time , message: _contract + ':'  + _message , type: 'INFO'}
    this.logs.push(log); 
    break;
  default:
    break; 
} */