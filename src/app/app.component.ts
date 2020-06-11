import { Component } from '@angular/core';
//import { ContractControlService } from "./contract-control.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  //providers: [ContractControlService]
})
export class AppComponent {
  title = 'fire-editor';
  
  questions: any[];

  constructor(){
    

  }
}
