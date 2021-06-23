import { Component, OnInit } from '@angular/core';
import { CompilerService } from '../compiler.service';

@Component({
  selector: 'app-global-options',
  templateUrl: './global-options.component.html',
  styleUrls: ['./global-options.component.css']
})
export class GlobalOptionsComponent implements OnInit {

  constructor(private compiler : CompilerService) { }

  public debugMode = false

  ngOnInit(): void {
  }

  public triggerDebugMode(){
    this.compiler.setGlobalEditorSetting("debugMode", this.debugMode)
  }
}
