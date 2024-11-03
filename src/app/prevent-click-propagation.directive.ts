import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[prevent-click-propagation]',
})
export class PreventClickPropagationDirective {
  @HostListener('click', ['$event'])
  public onClick(event: any): void {
    event.stopPropagation();
  }
}
