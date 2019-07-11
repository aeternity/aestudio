import { Component } from '@angular/core';
import { QuestionControlService } from "./question-control.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [QuestionControlService]
})
export class AppComponent {
  title = 'demo-form-sku';
  
  questions: any[];

  constructor(service: QuestionControlService){
    this.questions = service.getQuestions();
  }
}
