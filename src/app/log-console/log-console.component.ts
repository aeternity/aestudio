import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EventlogService } from '../services/eventlog/eventlog.service'

@Component({
  selector: 'app-log-console',
  templateUrl: './log-console.component.html',
  styleUrls: ['./log-console.component.css']
})

export class LogConsoleComponent implements OnInit {  

  @Output() open: EventEmitter<boolean> = new EventEmitter();

  logs: any[] = [];
  isOpen: boolean = true;
  
  constructor(private eventlog: EventlogService) { 

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
    this.isOpen = !this.isOpen;
    console.log("emitting console open: ", this.isOpen)
  	this.open.emit(this.isOpen);
  }	

}
