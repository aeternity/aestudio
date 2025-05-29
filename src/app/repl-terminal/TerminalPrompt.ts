import * as AU from 'ansi_up';
import { EventEmitter } from '@angular/core';

const AnsiUp = new AU.default();
AnsiUp.use_classes = true;

/**
 * Terminal prompt
 */
export class TerminalPrompt {
  private REGEX_ARGS = /[^\s"]+|"([^"]*)"/gi;

  private _id: string;

  public get id(): string {
    return this._id;
  }

  private _text;

  public set text(text: string) {
    this._text = text;
  }

  public get text(): string {
    return this._text;
  }

  private _locked = false;

  public get locked(): boolean {
    return this._locked;
  }

  private _responseComplete = new EventEmitter<void>();

  private _responseChanged = new EventEmitter<void>();

  private _cancel = new EventEmitter<void>();

  private _response = '';

  public get response(): string {
    return this._response;
  }

  public set response(response: string) {
    this._response = response;
    this._responseChanged.next();
  }

  private _login: string;

  public get login(): string {
    return this._login;
  }

  public set login(login: string) {
    this._login = login;
  }

  private _server: string;

  public get server(): string {
    return this._server;
  }

  public set server(server: string) {
    this._server = server;
  }

  /**
   * Is prompt empty
   */
  public isEmpty(): boolean {
    return this._text === undefined;
  }

  /**
   * Mark response as complete
   */
  public responseComplete() {
    this._responseComplete.next();
  }

  /**
   * Cancel
   */
  public cancel() {
    this._cancel.next();
  }

  public lock() {
    this._locked = true;
  }

  /**
   * On complete event
   */
  public onResponseComplete(): EventEmitter<void> {
    return this._responseComplete;
  }

  /**
   * On response changed event
   */
  public onResponseChanged(): EventEmitter<void> {
    return this._responseChanged;
  }

  public onCancel(): EventEmitter<void> {
    return this._cancel;
  }

  /**
   * Set response as an ansi text
   */
  public setAnsiResponse(part: string) {
    this.response = AnsiUp.ansi_to_html(part);
  }

  public appendAnsiResponse(part: string) {
    this.response = this.response + AnsiUp.ansi_to_html(part) + '\n';
  }

  public appendResponse(part: string) {
    this.response = this.response + part + '\n';
  }

  /**
   * Get command and args
   */
  public getCommandAndArgs(): { command: string; args: string[] } {
    let match = this.REGEX_ARGS.exec(this._text);
    let command: string;
    const args = [];

    while (match !== null) {
      const value = match[1] ? match[1] : match[0];
      if (!command) {
        command = value;
      } else {
        args.push(value);
      }
      match = this.REGEX_ARGS.exec(this._text);
    }

    return { command, args };
  }

  /**
   * Get command
   */
  public getCommand(): string {
    return this.getCommandAndArgs().command;
  }

  /**
   * Get args
   */
  public getArgs(): string[] {
    return this.getCommandAndArgs().args;
  }

  /**
   * Constructor
   */
  constructor(options: { text?: string; response?: string; server?: string; login?: string }) {
    this._text = options.text;
    this._response = options.response;
    this._server = options.server;
    this._login = options.login;
    this._id = Math.random().toString(36).substring(7);
  }
}
