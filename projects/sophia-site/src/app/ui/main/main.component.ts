import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MarkdownComponent } from "../../tech/markdown/markdown.component";
import { WelcomeComponent } from '../welcome/welcome.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-main',
    standalone: true,
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    imports: [CommonModule, SidebarComponent, MarkdownComponent, WelcomeComponent, RouterOutlet, RouterLinkActive, RouterLink]
})
export class MainComponent {
menuPaddingLeft: number = 0;


setSidebarPadding(padding: number) {
  this.menuPaddingLeft = padding;
}

}