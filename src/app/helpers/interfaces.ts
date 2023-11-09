import  {
  AeSdk, MemoryAccount
} from '@aeternity/aepp-sdk'

export interface ILog {
    depth? : number,
    expanded? : boolean,
    message : string,
    type : "info" | "success" | "log" | "error" | "warn",
    data : any,
    time? : string 
  }
  
interface additionalAestudioProperties {
  currentWalletProvider? : 'web' | "extension" 
}

interface additionalMemoryAccountProperties {
  property?: string,
}

export type MemoryAccountExtended = MemoryAccount & additionalMemoryAccountProperties
export type AeSdkExtended = AeSdk & additionalAestudioProperties