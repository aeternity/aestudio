import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MarkdownComponent } from "../../tech/markdown/markdown.component";

@Component({
    selector: 'app-main',
    standalone: true,
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    imports: [CommonModule, SidebarComponent, MarkdownComponent]
})
export class MainComponent {
menuPaddingLeft: number = 0;

markdownContent = `
# Sample Markdown
Here is some text.

\`\`\`javascript
console.log('Hello, World!');
\`\`\`
`;

setSidebarPadding(padding: number) {
  this.menuPaddingLeft = padding;
}

}