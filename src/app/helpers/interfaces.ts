export interface ILog {
    depth? : number,
    expanded? : boolean,
    message : string,
    type : "info" | "success" | "log" | "error" | "warn",
    data : any,
    time? : string 
  }