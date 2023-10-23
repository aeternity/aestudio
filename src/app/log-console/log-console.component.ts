import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, Inject } from '@angular/core';
import { EventlogService } from '../services/eventlog/eventlog.service'
import { StateService } from '../services/state.service';
import { TerminalPrompt } from '../repl-terminal/TerminalPrompt';
import { StorageService } from 'ngx-webstorage-service';
import { LocalStorageService } from '../local-storage.service';
import { Socket } from 'phoenix-channels';
import { ILog } from '../helpers/interfaces';

@Component({
  selector: 'app-log-console',
  templateUrl: './log-console.component.html',
  styleUrls: ['./log-console.component.css']
})

export class LogConsoleComponent implements OnInit {


  logs: ILog[] = [];
  activeTab : string = 'logs'

  public login = 'you';
    public server = 'REPL';
    public serverUrl = 'wss://repl.aeternity.io/';
    public session = '';

    private channel;
    private prompt;

    private pending_output = "";

  constructor(private eventlog: EventlogService, public state: StateService, private detector: ChangeDetectorRef,  private localStorage: LocalStorageService) {
    // use this to get all contracts in their latest state:

    let socket = new Socket(this.serverUrl + "/socket");
    socket.connect();
    console.log("REPL: socket= " + socket);
    this.channel = socket.channel("repl_session:lobby", {});
    console.log("REPL: channel= " + this.channel);

    this.channel.on("response", payload => {
      var msg = payload.msg;
      console.log("REPL: " + msg);
      this.session = payload.user_session ? payload.user_session : this.session;
      msg = payload.msg.replace(/^\n|\n$/g, '');
      if(msg !== "" && this.prompt) {
        console.log("REPL: Handling response")
        this.prompt.setAnsiResponse(this.pending_output + msg);
        this.pending_output = "";
        this.prompt.responseComplete();
      } else {
        console.log("REPL: Pending msg...")
        this.pending_output += msg + "\n\n";
      }
    });

    console.log("REPL: trying to join");
    this.channel.join()
      .receive("ok", resp => { console.log("REPL: Joined aerepl lobby."); })
      .receive("error", resp => {
        console.log("REPL: Could not establish the connection.");
        alert("Could not establish the connection.");
      });

  }

  onCommand(prompt: TerminalPrompt) {
    this.prompt = prompt;

    let input = prompt.text;

    console.log("REPL: Input:" + input);

    switch (input.trim()) {
      case ':r':
        let contracts_raw = this.localStorage.getAllContracts();
        let contracts = contracts_raw.map(
            function(c) {

                let filename = (c as any).nameInTab + ".aes";
                let content = (c as any).code;
                return {
                    filename: filename,
                    content: content
                }
          }
        );

        this.channel.push("load", {files: contracts,
                                   user_session: this.session
                                  });

        break;

        default:
        this.channel.push("query", {input: input,
                                    user_session: this.session
                                   });


        this.prompt.response = '...';
        prompt.responseComplete();
    }
  }

  logActiovated($event){
    console.log("damn")
  }

  ngOnInit() {
    // setup a default first log:
    // example log: ({type: "success", message: "Contract was called successfully!", contract: "testcontract", data: {}})

    this.logs.push({type: "info", message: "Event log initialized.", data: { Info: "Here you will find all information on your activities."}, expanded: true });

    //setup subscription for new logs
    this.eventlog._newLog.subscribe((log : ILog) => {
      //empty default log message when first true log comes in
      this.logs[this.logs.length - 1].message == "Event log initialized." ? this.logs = [] : ""; 
      // check if the new log is expanded, if not, explicitly set it to true
      log.expanded == undefined ? log.expanded = true : "";
      // set the last log to not expanded
      this.logs.length >= 1 ? this.logs[this.logs.length - 1].expanded = false : "";
      this.logs.push(log);
    })
  }

  stopClickPropagation($event) {
    $event.stopPropagation()
  }

  showTabContent(tab: "logs" | "repl"){
    this.activeTab = tab
  }


  toggle($event) {
    console.log("Resize: click initiated")
    this.state.consoleOpen = !this.state.consoleOpen
    this.detector.detectChanges()
    //setTimeout(() => {
      this.state.consoleTrigger.emit()
    //}, 1000);

    console.log("state console open: ", this.state.consoleOpen)
  }

}
