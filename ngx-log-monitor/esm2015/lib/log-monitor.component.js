/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { normalizeLogMessage } from './helpers/log-message.helper';
export class LogMonitorComponent {
    /**
     * @param {?} zone
     */
    constructor(zone) {
        this.zone = zone;
        this.history = [];
        this.theme = 'dark';
        this.icons = true;
        this.customClass = 'log-container';
        this.animated = true;
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes["history"]) {
            this.history = changes["history"].currentValue.map(normalizeLogMessage);
        }
        if (changes["logStream"] && changes["logStream"].currentValue) {
            this.zone.run(() => {
                const /** @type {?} */ normalizedMsg = normalizeLogMessage(changes["logStream"].currentValue);
                this.history.push(normalizedMsg);
                setTimeout(() => this.scrollToBottom());
            });
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this.scrollToBottom();
    }
    /**
     * @return {?}
     */
    scrollToBottom() {
        this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
    }
}
LogMonitorComponent.decorators = [
    { type: Component, args: [{
                selector: 'log-monitor',
                template: `
<div *ngIf="title" class="title-bar" [ngClass]="theme+'-theme'">&#9002; {{title}}</div>
<div
  #container
  class="container"
  [ngClass]="theme+'-theme'"
>
  <span
    class="msg-item {{'msg-'+(log.type.toLowerCase())}}"
    *ngFor="let log of history"
    [ngClass]="{'animated': animated}"
  >
    <span *ngIf="icons" [ngSwitch]="log.type">
      <ng-container *ngSwitchCase="'ERR'">&#10008;</ng-container>
      <ng-container *ngSwitchCase="'SUCCESS'">&#10004;</ng-container>
      <ng-container *ngSwitchCase="'LOG'">&#10097;</ng-container>
      <ng-container *ngSwitchCase="'WARN'">&#8252;</ng-container>
      <ng-container *ngSwitchCase="'INFO'">&#8505;</ng-container>
    </span>

    [{{log.timestamp}}]: {{log.message}}
  </span>

</div>
`,
                styles: [`.container{position:relative;width:100%;height:100%;padding-top:5px;padding-bottom:5px;overflow-y:auto;font-family:"Lucida Console",Monaco,monospace,sans-serif}.animated{-webkit-animation:260ms fadein;animation:260ms fadein}@-webkit-keyframes fadein{from{opacity:0;-webkit-transform:translateY(-10px);transform:translateY(-10px)}to{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes fadein{from{opacity:0;-webkit-transform:translateY(-10px);transform:translateY(-10px)}to{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}}.title-bar{padding:5px;font-weight:600}.dark-theme.title-bar{border-bottom:1px solid #3c3c3c;background:#1f1f1f}.light-theme.title-bar{border-bottom:1px solid #a8acad;background:#dbdfe0}.msg-item{display:block;margin-left:6px;font-size:.85em}.msg-list{margin:0;height:100%}.light-theme{color:#212121;background:#ecf0f1}.light-theme .msg-info{color:#2980b9}.light-theme .msg-err{color:#c0392b}.light-theme .msg-success{color:#27ae60}.light-theme .msg-warn{color:#f39c12}.dark-theme{color:#ecf0f1;background:#212121}.dark-theme .msg-info{color:#3498db}.dark-theme .msg-err{color:#e74c3c}.dark-theme .msg-success{color:#2ecc71}.dark-theme .msg-warn{color:#f1c40f}`],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/** @nocollapse */
LogMonitorComponent.ctorParameters = () => [
    { type: NgZone, },
];
LogMonitorComponent.propDecorators = {
    "title": [{ type: Input },],
    "logStream": [{ type: Input },],
    "history": [{ type: Input },],
    "theme": [{ type: Input },],
    "icons": [{ type: Input },],
    "customClass": [{ type: Input },],
    "animated": [{ type: Input },],
    "container": [{ type: ViewChild, args: ['container',] },],
};
function LogMonitorComponent_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    LogMonitorComponent.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    LogMonitorComponent.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    LogMonitorComponent.propDecorators;
    /** @type {?} */
    LogMonitorComponent.prototype.title;
    /** @type {?} */
    LogMonitorComponent.prototype.logStream;
    /** @type {?} */
    LogMonitorComponent.prototype.history;
    /** @type {?} */
    LogMonitorComponent.prototype.theme;
    /** @type {?} */
    LogMonitorComponent.prototype.icons;
    /** @type {?} */
    LogMonitorComponent.prototype.customClass;
    /** @type {?} */
    LogMonitorComponent.prototype.animated;
    /** @type {?} */
    LogMonitorComponent.prototype.container;
    /** @type {?} */
    LogMonitorComponent.prototype.zone;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLW1vbml0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LWxvZy1tb25pdG9yLyIsInNvdXJjZXMiOlsibGliL2xvZy1tb25pdG9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsVUFBVSxFQUNWLEtBQUssRUFBRSxNQUFNLEVBSWIsU0FBUyxFQUNWLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBZ0NqRSxNQUFNOzs7O0lBV0osWUFBb0IsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7dUJBUEMsRUFBRTtxQkFDQSxNQUFNO3FCQUN4QixJQUFJOzJCQUNFLGVBQWU7d0JBQ2xCLElBQUk7S0FHYTs7Ozs7SUFFckMsV0FBVyxDQUFDLE9BQXNCO1FBRWhDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sYUFBVSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxZQUFTLFlBQVksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUN0RTtRQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8saUJBQWMsT0FBTyxjQUFXLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFFeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO2dCQUNqQix1QkFBTSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxjQUFXLFlBQVksQ0FBQyxDQUFDO2dCQUMxRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDakMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2FBQ3pDLENBQUMsQ0FBQztTQUNKO0tBQ0Y7Ozs7SUFFRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3ZCOzs7O0lBRU8sY0FBYztRQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDOzs7O1lBaEV0RixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0JYO2dCQUNDLE1BQU0sRUFBRSxDQUFDLDRzQ0FBNHNDLENBQUM7Z0JBQ3R0QyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTthQUNoRDs7OztZQXRDUSxNQUFNOzs7c0JBeUNaLEtBQUs7MEJBQ0wsS0FBSzt3QkFDTCxLQUFLO3NCQUNMLEtBQUs7c0JBQ0wsS0FBSzs0QkFDTCxLQUFLO3lCQUNMLEtBQUs7MEJBQ0wsU0FBUyxTQUFDLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCwgTmdab25lLFxuICBPbkNoYW5nZXMsXG4gIE9uSW5pdCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0NoaWxkXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtMb2dNZXNzYWdlfSBmcm9tICcuL21vZGVscy9sb2ctbWVzc2FnZS5tb2RlbCc7XG5pbXBvcnQge25vcm1hbGl6ZUxvZ01lc3NhZ2V9IGZyb20gJy4vaGVscGVycy9sb2ctbWVzc2FnZS5oZWxwZXInO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsb2ctbW9uaXRvcicsXG4gIHRlbXBsYXRlOiBgXG48ZGl2ICpuZ0lmPVwidGl0bGVcIiBjbGFzcz1cInRpdGxlLWJhclwiIFtuZ0NsYXNzXT1cInRoZW1lKyctdGhlbWUnXCI+JiM5MDAyOyB7e3RpdGxlfX08L2Rpdj5cbjxkaXZcbiAgI2NvbnRhaW5lclxuICBjbGFzcz1cImNvbnRhaW5lclwiXG4gIFtuZ0NsYXNzXT1cInRoZW1lKyctdGhlbWUnXCJcbj5cbiAgPHNwYW5cbiAgICBjbGFzcz1cIm1zZy1pdGVtIHt7J21zZy0nKyhsb2cudHlwZS50b0xvd2VyQ2FzZSgpKX19XCJcbiAgICAqbmdGb3I9XCJsZXQgbG9nIG9mIGhpc3RvcnlcIlxuICAgIFtuZ0NsYXNzXT1cInsnYW5pbWF0ZWQnOiBhbmltYXRlZH1cIlxuICA+XG4gICAgPHNwYW4gKm5nSWY9XCJpY29uc1wiIFtuZ1N3aXRjaF09XCJsb2cudHlwZVwiPlxuICAgICAgPG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwiJ0VSUidcIj4mIzEwMDA4OzwvbmctY29udGFpbmVyPlxuICAgICAgPG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwiJ1NVQ0NFU1MnXCI+JiMxMDAwNDs8L25nLWNvbnRhaW5lcj5cbiAgICAgIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cIidMT0cnXCI+JiMxMDA5Nzs8L25nLWNvbnRhaW5lcj5cbiAgICAgIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cIidXQVJOJ1wiPiYjODI1Mjs8L25nLWNvbnRhaW5lcj5cbiAgICAgIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cIidJTkZPJ1wiPiYjODUwNTs8L25nLWNvbnRhaW5lcj5cbiAgICA8L3NwYW4+XG5cbiAgICBbe3tsb2cudGltZXN0YW1wfX1dOiB7e2xvZy5tZXNzYWdlfX1cbiAgPC9zcGFuPlxuXG48L2Rpdj5cbmAsXG4gIHN0eWxlczogW2AuY29udGFpbmVye3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7cGFkZGluZy10b3A6NXB4O3BhZGRpbmctYm90dG9tOjVweDtvdmVyZmxvdy15OmF1dG87Zm9udC1mYW1pbHk6XCJMdWNpZGEgQ29uc29sZVwiLE1vbmFjbyxtb25vc3BhY2Usc2Fucy1zZXJpZn0uYW5pbWF0ZWR7LXdlYmtpdC1hbmltYXRpb246MjYwbXMgZmFkZWluO2FuaW1hdGlvbjoyNjBtcyBmYWRlaW59QC13ZWJraXQta2V5ZnJhbWVzIGZhZGVpbntmcm9te29wYWNpdHk6MDstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGVZKC0xMHB4KTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtMTBweCl9dG97b3BhY2l0eToxOy13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZVkoMCk7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMCl9fUBrZXlmcmFtZXMgZmFkZWlue2Zyb217b3BhY2l0eTowOy13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTEwcHgpO3RyYW5zZm9ybTp0cmFuc2xhdGVZKC0xMHB4KX10b3tvcGFjaXR5OjE7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlWSgwKTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgwKX19LnRpdGxlLWJhcntwYWRkaW5nOjVweDtmb250LXdlaWdodDo2MDB9LmRhcmstdGhlbWUudGl0bGUtYmFye2JvcmRlci1ib3R0b206MXB4IHNvbGlkICMzYzNjM2M7YmFja2dyb3VuZDojMWYxZjFmfS5saWdodC10aGVtZS50aXRsZS1iYXJ7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2E4YWNhZDtiYWNrZ3JvdW5kOiNkYmRmZTB9Lm1zZy1pdGVte2Rpc3BsYXk6YmxvY2s7bWFyZ2luLWxlZnQ6NnB4O2ZvbnQtc2l6ZTouODVlbX0ubXNnLWxpc3R7bWFyZ2luOjA7aGVpZ2h0OjEwMCV9LmxpZ2h0LXRoZW1le2NvbG9yOiMyMTIxMjE7YmFja2dyb3VuZDojZWNmMGYxfS5saWdodC10aGVtZSAubXNnLWluZm97Y29sb3I6IzI5ODBiOX0ubGlnaHQtdGhlbWUgLm1zZy1lcnJ7Y29sb3I6I2MwMzkyYn0ubGlnaHQtdGhlbWUgLm1zZy1zdWNjZXNze2NvbG9yOiMyN2FlNjB9LmxpZ2h0LXRoZW1lIC5tc2ctd2Fybntjb2xvcjojZjM5YzEyfS5kYXJrLXRoZW1le2NvbG9yOiNlY2YwZjE7YmFja2dyb3VuZDojMjEyMTIxfS5kYXJrLXRoZW1lIC5tc2ctaW5mb3tjb2xvcjojMzQ5OGRifS5kYXJrLXRoZW1lIC5tc2ctZXJye2NvbG9yOiNlNzRjM2N9LmRhcmstdGhlbWUgLm1zZy1zdWNjZXNze2NvbG9yOiMyZWNjNzF9LmRhcmstdGhlbWUgLm1zZy13YXJue2NvbG9yOiNmMWM0MGZ9YF0sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIExvZ01vbml0b3JDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIEFmdGVyVmlld0luaXQge1xuXG4gIEBJbnB1dCgpIHRpdGxlO1xuICBASW5wdXQoKSBsb2dTdHJlYW06IExvZ01lc3NhZ2U7XG4gIEBJbnB1dCgpIGhpc3Rvcnk6IExvZ01lc3NhZ2VbXSA9IFtdO1xuICBASW5wdXQoKSB0aGVtZTogJ2RhcmsnIHwgJ2xpZ2h0JyA9ICdkYXJrJztcbiAgQElucHV0KCkgaWNvbnMgPSB0cnVlO1xuICBASW5wdXQoKSBjdXN0b21DbGFzcyA9ICdsb2ctY29udGFpbmVyJztcbiAgQElucHV0KCkgYW5pbWF0ZWQgPSB0cnVlO1xuICBAVmlld0NoaWxkKCdjb250YWluZXInKSBjb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB6b25lOiBOZ1pvbmUpIHsgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcblxuICAgIGlmIChjaGFuZ2VzLmhpc3RvcnkpIHtcbiAgICAgIHRoaXMuaGlzdG9yeSA9IGNoYW5nZXMuaGlzdG9yeS5jdXJyZW50VmFsdWUubWFwKG5vcm1hbGl6ZUxvZ01lc3NhZ2UpO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VzLmxvZ1N0cmVhbSAmJiBjaGFuZ2VzLmxvZ1N0cmVhbS5jdXJyZW50VmFsdWUpIHtcblxuICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRNc2cgPSBub3JtYWxpemVMb2dNZXNzYWdlKGNoYW5nZXMubG9nU3RyZWFtLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIHRoaXMuaGlzdG9yeS5wdXNoKG5vcm1hbGl6ZWRNc2cpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2Nyb2xsVG9Cb3R0b20oKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBzY3JvbGxUb0JvdHRvbSgpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHRoaXMuY29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xuICB9XG5cbn1cbiJdfQ==