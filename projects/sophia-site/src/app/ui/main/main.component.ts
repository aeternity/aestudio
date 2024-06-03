import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
menuPaddingLeft: number = 0;

setSidebarPadding(padding: number) {
  this.menuPaddingLeft = padding;
}

}