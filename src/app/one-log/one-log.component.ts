import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-one-log',
  templateUrl: './one-log.component.html',
  styleUrls: ['./one-log.component.css']
})
export class OneLogComponent implements OnInit {
  
  // example log: ({type: "success", message: "Contract was called successfully!", contract: "testcontract", data: {}})

  @Input() log: any;
  objectKeys = Object.keys;
  
  constructor() { }

  ngOnInit() {
    console.log("One log component got log: ", this.log);
  }

}
