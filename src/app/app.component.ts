import { Component } from '@angular/core';
import { QuestionControlService } from "./question-control.service";

import { ContractControlService } from "./contract-control.service";
import { Contract } from './contracts/hamster';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [QuestionControlService, ContractControlService]
})
export class AppComponent {
  title = 'demo-form-sku';
  
  questions: any[];

  constructor(service: QuestionControlService, contractService: ContractControlService){
    this.questions = service.getQuestions();
  }
}
