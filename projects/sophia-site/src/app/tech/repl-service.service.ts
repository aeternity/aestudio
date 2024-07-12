import { Injectable } from '@angular/core';
import { Socket } from 'phoenix-channels';
import { environment } from 'projects/sophia-site/src/environments/environment';

// each code block will have its unique instance of the repl service !
@Injectable(/* {
  providedIn: 'root'
} */)
export class ReplServiceService {

    public serverUrl = environment.replServerUrl;
    public session = '';
    private channel;
    private prompt;

    private pending_output = "";
    public isReplFocused: boolean = false;

  constructor() {
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

  sendRawCommand(command: string) {

    let input = command.trim();

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



    }
  }


  ngOnInit() {
    // setup a default first log:

  }



}
