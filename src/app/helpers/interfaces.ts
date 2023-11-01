export interface ILog {
    depth? : number,
    expanded? : boolean,
    message : string,
    type : "info" | "success" | "log" | "error" | "warn",
    data : any,
    time? : string 
  }

  export interface IActiveContract {
    contractUID: string | number,
    latestACI: Object,
    code: string,
    sharingHighlighters?: number[],
    nameInTab: string,
    errorHighlights?: any[],
  }