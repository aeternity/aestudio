import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { EventlogService } from '../services/eventlog/eventlog.service'
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-log-console',
  templateUrl: './log-console.component.html',
  styleUrls: ['./log-console.component.css']
})

export class LogConsoleComponent implements OnInit {  

  logs: any[] = [];
  
  constructor(private eventlog: EventlogService, public state: StateService, private detector: ChangeDetectorRef) { 

  }


  ngOnInit() {
    // setup a default first log:
    // example log: ({type: "success", message: "Contract was called successfully!", contract: "testcontract", data: {}})

    this.logs.push({type: "info", message: "Event log initialized.", data: { Info: "Here you will find all information on your activities."} });

    //setup subscription for new logs
    this.eventlog._newLog.subscribe(log => {
      this.logs.push(log);
      //debugger
    })
  }

  toggle() {
    console.log("Resize: click initiated")
    this.state.consoleOpen = !this.state.consoleOpen
    this.detector.detectChanges()
    //setTimeout(() => {
      this.state.consoleTrigger.emit()
    //}, 1000);
    
    console.log("state console open: ", this.state.consoleOpen)
  }	

}
