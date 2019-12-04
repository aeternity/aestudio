import { Component, OnInit, Input } from '@angular/core';
import { EventlogService } from '../services/eventlog/eventlog.service'

@Component({
  selector: 'app-log-console',
  templateUrl: './log-console.component.html',
  styleUrls: ['./log-console.component.css']
})
export class LogConsoleComponent implements OnInit {  

  logs: any[] = [];

  constructor(private eventlog: EventlogService) { 

  }

  ngOnInit() {
    // setup a default first log:
    // example log: ({type: "success", message: "Contract was called successfully!", contract: "testcontract", data: {}})

    this.logs.push({type: "info", message: "Event log initialized.", data: { Info: "Here you will find all information on your activities."} });

    //setup subscription for new logs
    this.eventlog._newLog.subscribe(log => {
      console.log("Log console got:", log)
      this.logs.push(log);
      debugger
    })
  }

}
