import { AfterViewInit, ElementRef, NgZone, OnChanges, SimpleChanges } from '@angular/core';
import { LogMessage } from './models/log-message.model';
export declare class LogMonitorComponent implements OnChanges, AfterViewInit {
    private zone;
    title: any;
    logStream: LogMessage;
    history: LogMessage[];
    theme: 'dark' | 'light';
    icons: boolean;
    customClass: string;
    animated: boolean;
    container: ElementRef;
    constructor(zone: NgZone);
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    private scrollToBottom();
}
