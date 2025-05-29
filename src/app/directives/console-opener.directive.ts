import { AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { StateService } from '../services/state.service';

@Directive({
  selector: '[appConsoleOpener]',
})
export class ConsoleOpenerDirective implements AfterViewInit {
  @Input() minHeight: number;
  @Input('fluidHeight') topOffset: number;
  private domElement: HTMLElement;
  private height: number;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private state: StateService,
  ) {
    if (this.state.consoleOpen) {
      this.height = 25;
    } else {
      this.height = 0;
    }

    this.domElement = this.elementRef.nativeElement as HTMLElement;

    this.state.consoleTrigger.subscribe((enable) => {
      if (enable) {
        this.height = 25;
        this.setHeight();
      } else {
        this.height = 0;
        this.setHeight();
      }
    });

    // register on window resize event
    fromEvent(window, 'resize')
      .pipe(throttleTime(500), debounceTime(500))
      .subscribe(() => this.setHeight());
  }

  ngAfterViewInit() {
    this.setHeight();
  }

  private setHeight() {
    this.renderer.setStyle(this.domElement, 'height', `${this.height}%`);
  }

  private calcTopOffset(): number {
    try {
      const rect = this.domElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      return rect.top + scrollTop;
    } catch {
      return 0;
    }
  }
}
