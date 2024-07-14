import { Injectable, OnDestroy, OnInit } from '@angular/core';
/* import { Socket } from 'phoenix-channels'; */
import { Socket } from 'phoenix';
import { environment } from 'projects/sophia-site/src/environments/environment';
import AnsiUp from "ansi_up";

// each code block will have its unique instance of the repl service !
@Injectable(/* {
  providedIn: 'root'
} */)
export class ReplServiceService implements OnDestroy{

    public server = 'REPL';
    //public serverUrl = 'wss://repl.aeternity.io/';
    public serverUrl = environment.replServerUrl;
    public session = '';
    private channel;

    public socket;
    private pending_output = "";
    public isReplFocused: boolean = false;
    public ansiUp = new AnsiUp();

  constructor() {

    // use this to get all contracts in their latest state:

    this.socket = new Socket(this.serverUrl + "/socket");
    this.socket.connect();
    console.log("REPL: socket= " + this.socket);
    this.channel = this.socket.channel("repl_session:lobby", {});
    console.log("REPL: channel " + this.channel);

    console.log("REPL: trying to join");

    this.channel.join()
      .receive("ok", resp => { console.log("REPL: channel join", resp);
                               this.handleResponse(resp);
                               })
                               
      .receive("error", resp => {
        console.log("REPL: Could not establish the connection.");
        alert("Could not establish the connection.");
      });

  }

  onCommand(command: string) {
    let input = command.trim();
    console.log("REPL: Input:" + input);

    switch (input) {

      // TODO investigate: after every :r, the onCommand method is called one time more than before, the result of the call remains just one though ?!
      // TODO: when setting a breakpoint before a contract is actually created with chain.create, breaking doesnt happen
      case ':r':
      //  this.loadAllContracts();

        break;

        default:
        this.channel.push("query", {input: input,
                                    user_session: this.session
                                   })
                                   .receive("ok", (response)=> {this.handleResponse(response)})
                                   .receive("error", (response)=> {this.handleResponse(response)});



        //this.prompt.response = '...';
        //prompt.responseComplete();
    }
  }

/*   connectToReplAsync() {
      return new Promise((resolve, reject) => {

        
        this.socket = new Socket(this.serverUrl + "/socket");
        this.socket.connect();
        console.log("REPL: socket= " + this.socket);
        this.channel = this.socket.channel("repl_session:lobby", {});
        console.log("REPL: channel " + this.channel);
        
        console.log("REPL: trying to join");
        this.channel.join()
        .receive("ok", resp => { console.log("REPL: channel join", resp);
          this.handleResponse(resp);
          if (resp.user_session) {
            resolve('connected')
          }}
        )
        
        .receive("error", resp => {
          console.log("REPL: Could not establish the connection.");
          reject("Could not establish the connection.");
        });  
      })
  } */

  loadAllContracts() {
    // let contracts_raw = this.localStorage.getAllContracts();
    let contracts_raw = ["stub"]
    let contracts = contracts_raw.map(
      function(c) {
  
          let filename = (c as any).latestACI.name + ".aes";
          let content = (c as any).code;
          return {
              filename: filename,
              content: content
          }
    }
    
    );
  
    let contractNamesOnly = contracts_raw.map(
    function(c) {
        let filename = (c as any).latestACI.name + ".aes";
        return filename
    }
    );

    
    // upload to repl
    this.channel.push("update_files", 
                            {files: contracts,
                              user_session: this.session
                            }).receive("ok", (response)=> {
                              console.log("updated files !")
                              this.handleResponse(response)
                            });
  
                            contractNamesOnly
    // make repl load the contracts
    this.channel.push("load",
            /* {files: contractNamesOnly, */
            {files: ["C.aes"],
            user_session: this.session
            }).receive("ok", (response)=> {
              this.handleResponse(response)
            })
            .receive("error", (response)=> {
              this.handleResponse(response)
            })
    }


  connectDeployAndCall = async (contract: string, command: string, mainContract: string)  : Promise<string> =>  {
return new Promise(async (resolve, reject) => {


    // make sure the connection is established
    try{
      await this.isSocketConnected();
      console.log("REPL: is connected")
    } catch(e) {
      return "Could not connect to REPL, please open a ticket on github";
    }
    
    // upload the contract and load it
    let contractName: string = "Counter.aes";
    let contractCode: string = contract;

    let uploadedContract = {
        filename: contractName,
        content: contractCode
    }

      // upload to repl
      this.channel.push("update_files", 
        {
          files: [uploadedContract],
          user_session: this.session
        }).receive("ok", (response)=> {
          console.log("REPL: uploaded contract")
          this.handleResponse(response)
        }).receive("error", (response)=> {
          console.log("REPL: error uploading contract")
          this.handleResponse(response)
        });
// await this.waitSeconds(1);

      // make repl load the contracts
      this.channel.push("load",
        {files: [contractName],
        user_session: this.session
      }).receive("ok", (response)=> {
        this.handleResponse(response)
      })
      .receive("error", (response)=> {
        this.handleResponse(response)
      })

      // await this.waitSeconds(1);

      // instantiate the contract
      this.channel.push("query", {input: `let c = Chain.create() : ${mainContract}`,
                                  render: false,
                                  user_session: this.session
                                }).receive("ok", (response)=> {                                  
                                  console.log("REPL: contract instantiated", response)
                                })
                                .receive("error", (response)=> {
                                  console.log("REPL: failed contract instantiation", response)
                                  reject("Could not instantiate contract");
                                  
                                });

                                // call the contract
                                this.channel.push("query", {input: `c.${command}`,
                                  render: false,
                                  user_session: this.session
                                }).receive("ok", (response)=> {                                  
                                  console.log("REPL: contract called:", response)
                                  let result = this.handleCallResponse(response)
                                  resolve(result)
                                })
                                .receive("error", (response)=> {
                                  console.log("REPL: failed calling contract:", response)
                                  reject("Could not call contract");

                                });
  
                              });
  }

  waitSeconds = (seconds) => {
    return new Promise(resolve => {
      setTimeout(resolve, seconds * 1000);
    }
    );
  }

  handleCallResponse(payload) {
    var msg = payload.msg;
    console.log("REPL responded: " + msg);
    // let cleanedResponse = payload.msg.replace(/^\n|\n$/g, '');
    
    this.session = payload.user_session ? payload.user_session : this.session;

    if(payload.msg) {
      console.log("REPL: Handling response")
     
    let json = JSON.parse(msg)
    let resultValue = json[1].value
    console.log("REPL: cleaned response: ", resultValue);
    
    return resultValue;

    } else if (msg == "") {
      console.log("REPL: Handling empty response")
      return "";
    } 
      else {
      console.log("REPL: no message in response:", msg)
      return "no response";
    }

    


  }
  handleResponse(payload) {
    var msg = payload.msg;
    console.log("REPL responded: " + msg);
    this.session = payload.user_session ? payload.user_session : this.session;

    if(payload.msg) {
      console.log("REPL: Handling response")
      /* let cleanedResponse = payload.msg.replace(/^\n|\n$/g, '');
      return cleanedResponse; */
      return payload.msg;
    } else if (msg == "") {
      console.log("REPL: Handling empty response")
      return "";
    } 
      else {
      console.log("REPL: no message in response:", msg)
      return "no response";
    }

    


  }

  isSocketConnected() {
    const maxRetries = 100;
    return new Promise((resolve, reject) => {
      let retries = 0;
      const interval = setInterval(() => {
        if (this.socket.isConnected()) {
          clearInterval(interval);
          resolve(true);
        } else if (retries >= maxRetries) {
          clearInterval(interval);
          reject(false);
        }
        retries++;
      }, 50);
    });
  }

  ngOnDestroy() {
    if (this.socket){
      console.log("REPL: disconnecting")
      this.socket.disconnect();
    }
  }

}
