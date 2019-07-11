import { Component, OnInit } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Contract } from '../contracts/hamster';



@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  providers: [ CompilerService ]
})
export class EditorComponent implements OnInit {

  code: Contract<string> = new Contract();
  constructor(private compiler: CompilerService) { }

  ngOnInit() {
  }

}
