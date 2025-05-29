import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-one-log-child',
  templateUrl: './one-log-child.component.html',
  styleUrls: ['./one-log-child.component.css'],
})
export class OneLogChildComponent implements OnInit {
  // example log: ({type: "success", message: "Contract was called successfully!", contract: "testcontract", data: {}})

  @Input() log: Log;
  @Input() open: boolean;
  objectKeys = Object.keys;
  isArray: any = {}; // keep track of log data that is arrays
  pureData: any = {}; // keep track of log data that is a simple type (int, string, etc..)
  isAnObject: any = {}; // keep track of log data that is an object (int, string, etc..)
  logEntries: any = [];

  ngOnInit() {
    //if (this.isObject(this.log.data)){
    this.logEntries = Object.keys(this.log.data);
    //}
    this.logEntries.forEach((key) => {
      /* if a child entry in the log data is an array or object or just pure data, set a flag for that entry in the respective object.
      this is to prevent having to run type-checking functions in ngIf and ngFor in the template, which is resource-costly!
      */
      // if it's an array...
      if (Array.isArray(this.log.data[key])) {
        // treat as pure data if the array has 0 elements.
        if (this.log.data[key].length < 1) {
          this.log.data[key] = '[]';
          this.pureData[key] = true;
        } else {
          this.isArray[key] = true;
        }

        // if it's an object..
      } else if (this.isObject(this.log.data[key])) {
        // treat as pure data if object check passes but there are les than 1 object keys.
        if (Object.keys(this.log.data[key]).length < 1) {
          this.log.data[key] = '{}';
          this.pureData[key] = true;
        } else {
          this.isAnObject[key] = true;
        }
      } else {
        this.pureData[key] = true;
      }
    });
  }

  isObject = (A) => {
    if (typeof A === 'object' && typeof A !== 'function' && A !== null) {
      return true;
    } else {
      return false;
    }
  };
}

export interface Log {
  depth: number;
  topic: string;
  type: 'success' | 'log' | 'error' | 'warn';
  data: any;
}
