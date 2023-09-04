import { Component, OnInit } from '@angular/core';
import { CompilerService } from '../compiler.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-global-options',
  templateUrl: './global-options.component.html',
  styleUrls: ['./global-options.component.css']
})
export class GlobalOptionsComponent implements OnInit {

  constructor(private compiler : CompilerService) { }

  public debugMode = false

  ngOnInit(): void {
    // if not in production mode, turn console logging on
    if (!environment.production){
      this.debugMode = true;
      this.compiler.setGlobalEditorSetting("debugMode", this.debugMode)
    }
  }

  public triggerDebugMode(){
    this.compiler.setGlobalEditorSetting("debugMode", this.debugMode)
  }
}
