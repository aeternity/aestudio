import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from '../../tech/markdown/markdown.component';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent {

}
