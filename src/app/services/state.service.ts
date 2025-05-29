import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  // used to change the sizes of editor and console log, open / close.
  consoleOpen = true;
  public console: {
    isOpen: boolean;
    logsActive: boolean;
    replActive: boolean;
  };
  // used to calculate the correct height of the monaco editor
  consoleTrigger: EventEmitter<boolean> = new EventEmitter<boolean>();
  editor = {
    viewportHeight: 0,
    tabHeight: 0,
    menuHeight: 0,
    logConsoleHeight: 0,
    finalHeight: 0,
    recalculateEditorHeight: function () {
      this.tabHeight = document.getElementById('tabMenu').offsetHeight;
      this.menuHeight = document.getElementById('logoHeader').offsetHeight;
      this.viewportHeight = window.innerHeight;
      this.logConsoleHeight = document.getElementById('logConsole').offsetHeight;

      this.finalHeight =
        this.viewportHeight - this.tabHeight - this.menuHeight - this.logConsoleHeight;
    },
  };

  constructor() {
    this.console = {
      isOpen: true,
      logsActive: false,
      replActive: true,
    };
  }
}
