export const isValidContractAddress = (address : string) => {
    if ( address.startsWith("ct_") || address.endsWith(".chain")) {
      return true
    } else {
      return false
    }
  }
  
  
import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appdynamichost]',
  standalone: true
})
export class DynamicHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}