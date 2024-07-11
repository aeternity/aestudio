import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from "../code-block/code-block.component";

@Component({
  selector: 'app-code-block-wrapper',
  standalone: true,
  imports: [CommonModule, CodeBlockComponent, CodeBlockComponent],
  templateUrl: './code-block-wrapper.component.html',
  styleUrls: ['./code-block-wrapper.component.scss']
})
export class CodeBlockWrapperComponent {

  @Input() exampleCode: string;
  @Input() exampleID: string;
  @Input() tryItYourselfCode: string; // fetch from the examples json file

  active : boolean = true;

  constructor(private cd: ChangeDetectorRef) { 

  }

  resetCodeblock(){
      this.active = false;
      this.cd.detectChanges();
      this.active = true;
}

}