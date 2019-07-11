import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QuestionBase } from 'src/app/question/question-base';
import { DropdownQuestion } from "src/app/question/question-dropdown";
import { TextboxQuestion } from "src/app/question/question-textbox";

@Injectable({
  providedIn: 'root'
})
export class QuestionControlService {

  constructor() {}

  getQuestions() {
    let questions: QuestionBase<any>[] = [

      new DropdownQuestion({
        key: 'brave',
        label: 'Bravery Rating',
        options: [
          {key: 'solid',  value: 'Solid'},
          {key: 'great',  value: 'Great'},
          {key: 'good',   value: 'Good'},
          {key: 'unproven', value: 'Unproven'}
        ],
        order: 3
      }),

      new TextboxQuestion({
        key: 'firstName',
        label: 'First name',
        value: 'Bombasto',
        required: true,
        order: 1
      }),
      new TextboxQuestion({
        key: 'specialQuestion',
        label: 'Special Question',
        value: 'Answer',
        required: true,
        order: 4
      }),

      new TextboxQuestion({
        key: 'emailAddress',
        label: 'Email',
        type: 'email',
        order: 2
      })

    ];

    return questions.sort((a,b) => a.order - b.order);

  }

  toFormGroup(questions: QuestionBase<any>[]) {
    let group: any = {};

    questions.forEach(question => {
      group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
                                              : new FormControl(question.value || '' );
    });

    return new FormGroup(group);
  }
}
