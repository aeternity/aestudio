import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalComponent } from './terminal.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [CommonModule, FormsModule, FlexLayoutModule],
  declarations: [TerminalComponent],
  exports: [TerminalComponent],
  providers: [],
})
export class TerminalModule {}
