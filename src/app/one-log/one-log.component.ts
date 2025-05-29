import { Component, OnInit, Input } from '@angular/core';
import { ILog } from '../helpers/interfaces';

@Component({
  selector: 'app-one-log',
  templateUrl: './one-log.component.html',
  styleUrls: ['./one-log.component.css'],
})
export class OneLogComponent implements OnInit {
  // example log: ({type: "success", message: "Contract was called successfully!", contract: "testcontract", data: {}})

  @Input() log: ILog;
  @Input() open: boolean;
  objectKeys = Object.keys;
  isArray: any = {}; // keep track of log data that is arrays
  pureData: any = {}; // keep track of log data that is a simple type (int, string, etc..)
  isAnObject: any = {}; // keep track of log data that is an object (int, string, etc..)
  logEntries: any = [];

  ngOnInit() {
    this.log.depth = 1; // to be passed for padding of later nested collapsible log content ("one-log-child")
    this.logEntries = Object.keys(this.log.data);

    this.logEntries.forEach((key) => {
      // dirty patch for "createdAt" not properly displaying:
      if (key == 'createdAt') this.log.data[key] = this.getTimeDate();

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
        // if it's a function..
      } else if (typeof this.log.data[key] === 'function') {
        this.pureData[key] = false;
      } else {
        this.pureData[key] = true;
      }
    });
  }

  isObject = (A) => {
    if (typeof A === 'object' && A !== null) {
      return true;
    } else {
      return false;
    }
  };

  getTimeDate = () => {
    const today = new Date();
    const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    return time + ' ' + date;
  };
}
