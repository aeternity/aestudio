import  {
  AeSdk, AeSdkAepp, MemoryAccount
} from '@aeternity/aepp-sdk'
import ContractWithMethods, { ContractMethodsBase } from '@aeternity/aepp-sdk/es/contract/Contract'
import { ContractBase } from '../question/contract-base'

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

interface additionalContractProperties {
  deployInfo?: {[key: string]: any},
  IDEindex?: number,
}

export type MemoryAccountExtended = MemoryAccount & additionalMemoryAccountProperties
export type AeSdkExtended = AeSdk & additionalAestudioProperties 
export type AeSdkAeppExtended = AeSdkAepp & additionalAestudioProperties 
export type ContractWithMethodsExtended = ContractWithMethods<ContractMethodsBase> & additionalContractProperties