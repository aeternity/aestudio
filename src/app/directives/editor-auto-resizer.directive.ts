import { AfterViewInit, Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { StateService } from '../services/state.service';

@Directive({
  selector: '[appEditorAutoResizer]',
})
export class EditorAutoResizerDirective implements OnInit, AfterViewInit {
  @Input() minHeight: number;
  @Input('fluidHeight') topOffset: number;

  private domElement: HTMLElement;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private state: StateService,
  ) {
    this.domElement = this.elementRef.nativeElement as HTMLElement;

    this.state.consoleTrigger.subscribe(() => {
      console.log('Resize: click received!');
      this.setHeight();
    });
    // register on window resize event
    fromEvent(window, 'resize')
      .pipe(throttleTime(500), debounceTime(500))
      .subscribe(() => this.setHeight());
  }

  ngOnInit() {
    this.setHeight();
  }
  ngAfterViewInit() {
    this.setHeight();
  }

  private setHeight() {
    const tabHeight = document.getElementById('tabMenu').offsetHeight;
    const menuHeight = document.getElementById('logoHeader').offsetHeight;
    const viewportHeight = window.innerHeight;
    const logConsoleHeight = document.getElementById('logConsole').offsetHeight;

    let height = viewportHeight - tabHeight - menuHeight - logConsoleHeight;

    // set min height instead of the calculated
    if (this.minHeight && height < this.minHeight) {
      height = this.minHeight;
    }
    this.renderer.setStyle(this.domElement, 'height', `${height}px`);
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
