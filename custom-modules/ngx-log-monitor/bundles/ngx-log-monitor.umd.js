(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('ngx-log-monitor', ['exports', '@angular/core', '@angular/common'], factory) :
    (factory((global['ngx-log-monitor'] = {}),global.ng.core,global.ng.common));
}(this, (function (exports,core,common) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    var __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var /** @type {?} */ normalizeLogMessage = function (msg) {
        return (__assign({}, msg, { type: (msg.type ? msg.type : 'LOG'), timestamp: (msg.timestamp ? msg.timestamp : new Date().toLocaleString()) }));
    };

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var LogMonitorComponent = (function () {
        function LogMonitorComponent(zone) {
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
        LogMonitorComponent.prototype.ngOnChanges = /**
         * @param {?} changes
         * @return {?}
         */
            function (changes) {
                var _this = this;
                if (changes["history"]) {
                    this.history = changes["history"].currentValue.map(normalizeLogMessage);
                }
                if (changes["logStream"] && changes["logStream"].currentValue) {
                    this.zone.run(function () {
                        var /** @type {?} */ normalizedMsg = normalizeLogMessage(changes["logStream"].currentValue);
                        _this.history.push(normalizedMsg);
                        setTimeout(function () { return _this.scrollToBottom(); });
                    });
                }
            };
        /**
         * @return {?}
         */
        LogMonitorComponent.prototype.ngAfterViewInit = /**
         * @return {?}
         */
            function () {
                this.scrollToBottom();
            };
        /**
         * @return {?}
         */
        LogMonitorComponent.prototype.scrollToBottom = /**
         * @return {?}
         */
            function () {
                this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
            };
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
                *ngFor="let log of history"
               class="msg-item {{'msg-'+(log.type) | lowercase }}" 
               
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
                            
                        },] },
            ];
        /** @nocollapse */
        LogMonitorComponent.ctorParameters = function () {
            return [
                { type: core.NgZone, },
            ];
        };
        LogMonitorComponent.propDecorators = {
            "title": [{ type: core.Input },],
            "logStream": [{ type: core.Input },],
            "history": [{ type: core.Input },],
            "theme": [{ type: core.Input },],
            "icons": [{ type: core.Input },],
            "customClass": [{ type: core.Input },],
            "animated": [{ type: core.Input },],
            "container": [{ type: core.ViewChild, args: ['container',] },],
        };
        return LogMonitorComponent;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var LogMonitorModule = (function () {
        function LogMonitorModule() {
        }
        LogMonitorModule.decorators = [
            { type: core.NgModule, args: [{
                        imports: [common.CommonModule],
                        declarations: [LogMonitorComponent],
                        exports: [LogMonitorComponent]
                    },] },
        ];
        return LogMonitorModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */

    exports.LogMonitorComponent = LogMonitorComponent;
    exports.LogMonitorModule = LogMonitorModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWxvZy1tb25pdG9yLnVtZC5qcy5tYXAiLCJzb3VyY2VzIjpbbnVsbCwibmc6Ly9uZ3gtbG9nLW1vbml0b3IvbGliL2hlbHBlcnMvbG9nLW1lc3NhZ2UuaGVscGVyLnRzIiwibmc6Ly9uZ3gtbG9nLW1vbml0b3IvbGliL2xvZy1tb25pdG9yLmNvbXBvbmVudC50cyIsIm5nOi8vbmd4LWxvZy1tb25pdG9yL2xpYi9sb2ctbW9uaXRvci5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2VcclxudGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGVcclxuTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuXHJcblRISVMgQ09ERSBJUyBQUk9WSURFRCBPTiBBTiAqQVMgSVMqIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTllcclxuS0lORCwgRUlUSEVSIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIFdJVEhPVVQgTElNSVRBVElPTiBBTlkgSU1QTElFRFxyXG5XQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgVElUTEUsIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLFxyXG5NRVJDSEFOVEFCTElUWSBPUiBOT04tSU5GUklOR0VNRU5ULlxyXG5cclxuU2VlIHRoZSBBcGFjaGUgVmVyc2lvbiAyLjAgTGljZW5zZSBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zXHJcbmFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDApXHJcbiAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUocmVzdWx0LnZhbHVlKTsgfSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSB5W29wWzBdICYgMiA/IFwicmV0dXJuXCIgOiBvcFswXSA/IFwidGhyb3dcIiA6IFwibmV4dFwiXSkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbMCwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIGV4cG9ydHMpIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgcmVzdWx0W2tdID0gbW9kW2tdO1xyXG4gICAgcmVzdWx0LmRlZmF1bHQgPSBtb2Q7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG4iLCJpbXBvcnQge0xvZ01lc3NhZ2V9IGZyb20gJy4uL21vZGVscy9sb2ctbWVzc2FnZS5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBub3JtYWxpemVMb2dNZXNzYWdlID0gKG1zZzogTG9nTWVzc2FnZSk6IExvZ01lc3NhZ2UgPT4gKHtcbiAgLi4ubXNnLFxuICB0eXBlOiAobXNnLnR5cGUgPyBtc2cudHlwZSA6ICdMT0cnKSxcbiAgdGltZXN0YW1wOiAobXNnLnRpbWVzdGFtcCA/IG1zZy50aW1lc3RhbXAgOiBuZXcgRGF0ZSgpLnRvTG9jYWxlU3RyaW5nKCkgKVxufSk7XG4iLCJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCwgTmdab25lLFxuICBPbkNoYW5nZXMsXG4gIE9uSW5pdCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0NoaWxkXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtMb2dNZXNzYWdlfSBmcm9tICcuL21vZGVscy9sb2ctbWVzc2FnZS5tb2RlbCc7XG5pbXBvcnQge25vcm1hbGl6ZUxvZ01lc3NhZ2V9IGZyb20gJy4vaGVscGVycy9sb2ctbWVzc2FnZS5oZWxwZXInO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsb2ctbW9uaXRvcicsXG4gIHRlbXBsYXRlOiBgXG48ZGl2ICpuZ0lmPVwidGl0bGVcIiBjbGFzcz1cInRpdGxlLWJhclwiIFtuZ0NsYXNzXT1cInRoZW1lKyctdGhlbWUnXCI+JiM5MDAyOyB7e3RpdGxlfX08L2Rpdj5cbjxkaXZcbiAgI2NvbnRhaW5lclxuICBjbGFzcz1cImNvbnRhaW5lclwiXG4gIFtuZ0NsYXNzXT1cInRoZW1lKyctdGhlbWUnXCJcbj5cbiAgPHNwYW5cbiAgICBjbGFzcz1cIm1zZy1pdGVtIHt7J21zZy0nKyhsb2cudHlwZS50b0xvd2VyQ2FzZSgpKX19XCJcbiAgICAqbmdGb3I9XCJsZXQgbG9nIG9mIGhpc3RvcnlcIlxuICAgIFtuZ0NsYXNzXT1cInsnYW5pbWF0ZWQnOiBhbmltYXRlZH1cIlxuICA+XG4gICAgPHNwYW4gKm5nSWY9XCJpY29uc1wiIFtuZ1N3aXRjaF09XCJsb2cudHlwZVwiPlxuICAgICAgPG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwiJ0VSUidcIj4mIzEwMDA4OzwvbmctY29udGFpbmVyPlxuICAgICAgPG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwiJ1NVQ0NFU1MnXCI+JiMxMDAwNDs8L25nLWNvbnRhaW5lcj5cbiAgICAgIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cIidMT0cnXCI+JiMxMDA5Nzs8L25nLWNvbnRhaW5lcj5cbiAgICAgIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cIidXQVJOJ1wiPiYjODI1Mjs8L25nLWNvbnRhaW5lcj5cbiAgICAgIDxuZy1jb250YWluZXIgKm5nU3dpdGNoQ2FzZT1cIidJTkZPJ1wiPiYjODUwNTs8L25nLWNvbnRhaW5lcj5cbiAgICA8L3NwYW4+XG5cbiAgICBbe3tsb2cudGltZXN0YW1wfX1dOiB7e2xvZy5tZXNzYWdlfX1cbiAgPC9zcGFuPlxuXG48L2Rpdj5cbmAsXG4gIHN0eWxlczogW2AuY29udGFpbmVye3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7cGFkZGluZy10b3A6NXB4O3BhZGRpbmctYm90dG9tOjVweDtvdmVyZmxvdy15OmF1dG87Zm9udC1mYW1pbHk6XCJMdWNpZGEgQ29uc29sZVwiLE1vbmFjbyxtb25vc3BhY2Usc2Fucy1zZXJpZn0uYW5pbWF0ZWR7LXdlYmtpdC1hbmltYXRpb246MjYwbXMgZmFkZWluO2FuaW1hdGlvbjoyNjBtcyBmYWRlaW59QC13ZWJraXQta2V5ZnJhbWVzIGZhZGVpbntmcm9te29wYWNpdHk6MDstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGVZKC0xMHB4KTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtMTBweCl9dG97b3BhY2l0eToxOy13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZVkoMCk7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMCl9fUBrZXlmcmFtZXMgZmFkZWlue2Zyb217b3BhY2l0eTowOy13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTEwcHgpO3RyYW5zZm9ybTp0cmFuc2xhdGVZKC0xMHB4KX10b3tvcGFjaXR5OjE7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlWSgwKTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgwKX19LnRpdGxlLWJhcntwYWRkaW5nOjVweDtmb250LXdlaWdodDo2MDB9LmRhcmstdGhlbWUudGl0bGUtYmFye2JvcmRlci1ib3R0b206MXB4IHNvbGlkICMzYzNjM2M7YmFja2dyb3VuZDojMWYxZjFmfS5saWdodC10aGVtZS50aXRsZS1iYXJ7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2E4YWNhZDtiYWNrZ3JvdW5kOiNkYmRmZTB9Lm1zZy1pdGVte2Rpc3BsYXk6YmxvY2s7bWFyZ2luLWxlZnQ6NnB4O2ZvbnQtc2l6ZTouODVlbX0ubXNnLWxpc3R7bWFyZ2luOjA7aGVpZ2h0OjEwMCV9LmxpZ2h0LXRoZW1le2NvbG9yOiMyMTIxMjE7YmFja2dyb3VuZDojZWNmMGYxfS5saWdodC10aGVtZSAubXNnLWluZm97Y29sb3I6IzI5ODBiOX0ubGlnaHQtdGhlbWUgLm1zZy1lcnJ7Y29sb3I6I2MwMzkyYn0ubGlnaHQtdGhlbWUgLm1zZy1zdWNjZXNze2NvbG9yOiMyN2FlNjB9LmxpZ2h0LXRoZW1lIC5tc2ctd2Fybntjb2xvcjojZjM5YzEyfS5kYXJrLXRoZW1le2NvbG9yOiNlY2YwZjE7YmFja2dyb3VuZDojMjEyMTIxfS5kYXJrLXRoZW1lIC5tc2ctaW5mb3tjb2xvcjojMzQ5OGRifS5kYXJrLXRoZW1lIC5tc2ctZXJye2NvbG9yOiNlNzRjM2N9LmRhcmstdGhlbWUgLm1zZy1zdWNjZXNze2NvbG9yOiMyZWNjNzF9LmRhcmstdGhlbWUgLm1zZy13YXJue2NvbG9yOiNmMWM0MGZ9YF0sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIExvZ01vbml0b3JDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIEFmdGVyVmlld0luaXQge1xuXG4gIEBJbnB1dCgpIHRpdGxlO1xuICBASW5wdXQoKSBsb2dTdHJlYW06IExvZ01lc3NhZ2U7XG4gIEBJbnB1dCgpIGhpc3Rvcnk6IExvZ01lc3NhZ2VbXSA9IFtdO1xuICBASW5wdXQoKSB0aGVtZTogJ2RhcmsnIHwgJ2xpZ2h0JyA9ICdkYXJrJztcbiAgQElucHV0KCkgaWNvbnMgPSB0cnVlO1xuICBASW5wdXQoKSBjdXN0b21DbGFzcyA9ICdsb2ctY29udGFpbmVyJztcbiAgQElucHV0KCkgYW5pbWF0ZWQgPSB0cnVlO1xuICBAVmlld0NoaWxkKCdjb250YWluZXInKSBjb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB6b25lOiBOZ1pvbmUpIHsgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcblxuICAgIGlmIChjaGFuZ2VzLmhpc3RvcnkpIHtcbiAgICAgIHRoaXMuaGlzdG9yeSA9IGNoYW5nZXMuaGlzdG9yeS5jdXJyZW50VmFsdWUubWFwKG5vcm1hbGl6ZUxvZ01lc3NhZ2UpO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VzLmxvZ1N0cmVhbSAmJiBjaGFuZ2VzLmxvZ1N0cmVhbS5jdXJyZW50VmFsdWUpIHtcblxuICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRNc2cgPSBub3JtYWxpemVMb2dNZXNzYWdlKGNoYW5nZXMubG9nU3RyZWFtLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIHRoaXMuaGlzdG9yeS5wdXNoKG5vcm1hbGl6ZWRNc2cpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2Nyb2xsVG9Cb3R0b20oKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBzY3JvbGxUb0JvdHRvbSgpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHRoaXMuY29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xuICB9XG5cbn1cbiIsImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBMb2dNb25pdG9yQ29tcG9uZW50IH0gZnJvbSAnLi9sb2ctbW9uaXRvci5jb21wb25lbnQnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtMb2dNb25pdG9yQ29tcG9uZW50XSxcbiAgZXhwb3J0czogW0xvZ01vbml0b3JDb21wb25lbnRdXG59KVxuZXhwb3J0IGNsYXNzIExvZ01vbml0b3JNb2R1bGUgeyB9XG4iXSwibmFtZXMiOlsiQ29tcG9uZW50IiwiQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kiLCJOZ1pvbmUiLCJJbnB1dCIsIlZpZXdDaGlsZCIsIk5nTW9kdWxlIiwiQ29tbW9uTW9kdWxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBQTs7Ozs7Ozs7Ozs7Ozs7QUFjQSxJQVlPLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksa0JBQWtCLENBQUM7UUFDdEQsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakQsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixLQUFLLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQUUsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDLENBQUE7Ozs7OztJQzlCTSxxQkFBTSxtQkFBbUIsR0FBRyxVQUFDLEdBQWU7UUFBaUIscUJBQy9ELEdBQUcsSUFDTixJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUNuQyxTQUFTLEdBQUcsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUU7SUFIUCxDQUlsRSxDQUFDOzs7Ozs7QUNOSDtRQXVERSw2QkFBb0IsSUFBWTtZQUFaLFNBQUksR0FBSixJQUFJLENBQVE7MkJBUEMsRUFBRTt5QkFDQSxNQUFNO3lCQUN4QixJQUFJOytCQUNFLGVBQWU7NEJBQ2xCLElBQUk7U0FHYTs7Ozs7UUFFckMseUNBQVc7Ozs7WUFBWCxVQUFZLE9BQXNCO2dCQUFsQyxpQkFjQztnQkFaQyxJQUFJLE9BQU8sYUFBVTtvQkFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLFlBQVMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2lCQUN0RTtnQkFFRCxJQUFJLE9BQU8saUJBQWMsT0FBTyxjQUFXLFlBQVksRUFBRTtvQkFFdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7d0JBQ1oscUJBQU0sYUFBYSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sY0FBVyxZQUFZLENBQUMsQ0FBQzt3QkFDMUUsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBQ2pDLFVBQVUsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLGNBQWMsRUFBRSxHQUFBLENBQUMsQ0FBQztxQkFDekMsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Y7Ozs7UUFFRCw2Q0FBZTs7O1lBQWY7Z0JBQ0UsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQ3ZCOzs7O1FBRU8sNENBQWM7Ozs7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUM7OztvQkFoRXRGQSxjQUFTLFNBQUM7d0JBQ1QsUUFBUSxFQUFFLGFBQWE7d0JBQ3ZCLFFBQVEsRUFBRSx1eUJBd0JYO3dCQUNDLE1BQU0sRUFBRSxDQUFDLDhzQ0FBNHNDLENBQUM7d0JBQ3R0QyxlQUFlLEVBQUVDLDRCQUF1QixDQUFDLE1BQU07cUJBQ2hEOzs7Ozt3QkF0Q1FDLFdBQU07Ozs7OEJBeUNaQyxVQUFLO2tDQUNMQSxVQUFLO2dDQUNMQSxVQUFLOzhCQUNMQSxVQUFLOzhCQUNMQSxVQUFLO29DQUNMQSxVQUFLO2lDQUNMQSxVQUFLO2tDQUNMQyxjQUFTLFNBQUMsV0FBVzs7a0NBckR4Qjs7Ozs7OztBQ0FBOzs7O29CQUlDQyxhQUFRLFNBQUM7d0JBQ1IsT0FBTyxFQUFFLENBQUNDLG1CQUFZLENBQUM7d0JBQ3ZCLFlBQVksRUFBRSxDQUFDLG1CQUFtQixDQUFDO3dCQUNuQyxPQUFPLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztxQkFDL0I7OytCQVJEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=