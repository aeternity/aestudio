import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-one-log',
  templateUrl: './one-log.component.html',
  styleUrls: ['./one-log.component.css']
})
export class OneLogComponent implements OnInit {
  
  // example log: ({type: "success", message: "Contract was called successfully!", contract: "testcontract", data: {}})

  @Input() log: Log;
  @Input() open: boolean;
  objectKeys = Object.keys;
  isArray : any = {}; // keep track of log data that is arrays
  pureData : any = {} // keep track of log data that is a simple type (int, string, etc..)
  isAnObject : any = {} // keep track of log data that is an object (int, string, etc..)
  logEntries: any = [];

  constructor() {}
  
  ngOnInit() {
    //if (this.isObject(this.log.data)){
    this.logEntries = Object.keys(this.log.data)
    console.log("Log: Entries are: "+ this.logEntries)
    //}
    this.logEntries.forEach(key => {
      /* if a child entry in the log data is an array or object, set a flag for that entry to true, else to false, respectively for being an array or an object.
      (or if it's some simple type)
      this is to prevent having to run type-checking functions in ngIf and ngFor in the template, which is resource-costly!
      */
      if (Array.isArray(this.log.data[key])){
        this.isArray[key] = true
      } else if(this.isObject(this.log.data[key])) {
        this.isAnObject[key] = true
      } else {
        this.pureData[key] = true
      }
    });
  }
  
  isObject = A => {
    if( (typeof A === "object") && (A !== null) )
    {
      console.log("Log: Isobject true for: " + A)
        return true
    } else {return false}
  }

}

export interface Log {
  message : string,
  type : "success" | "log" | "error" | "warn",
  data : any 
}