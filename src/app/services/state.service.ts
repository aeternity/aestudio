import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  // used to change the sizes of editor and console log, open / close.
  consoleOpen : boolean;

  constructor() { }
}
