import { Component, EventEmitter, HostBinding, Input, Output, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  @Output() paddingOnSidebarToggle : EventEmitter<number> = new EventEmitter<number>()
  @Input() initiallyOpen : boolean = true

  open : boolean = this.initiallyOpen ? true : false

  widthOpen : number = 250
  widthClosed : number = 90

  @HostBinding('style.width.px') hostMarginLeft : number = 200;
  currentSidebarWidth: WritableSignal<number> = signal(this.open? this.widthOpen : this.widthClosed);
  
constructor() { 
 
}

  toggleSidebar() {
    this.open = !this.open
    this.currentSidebarWidth.set(this.open? this.widthOpen : this.widthClosed);
    this.hostMarginLeft = this.currentSidebarWidth()
    this.paddingOnSidebarToggle.emit(this.currentSidebarWidth())
  }

  ngOnInit() {
    this.paddingOnSidebarToggle.emit(this.currentSidebarWidth())
  }


}
