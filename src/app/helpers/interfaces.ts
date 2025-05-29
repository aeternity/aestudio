import { AeSdk, AeSdkAepp, MemoryAccount } from '@aeternity/aepp-sdk';
import ContractWithMethods, { ContractMethodsBase } from '@aeternity/aepp-sdk/es/contract/Contract';
import { ContractBase } from '../question/contract-base';

export interface ILog {
  depth?: number;
  expanded?: boolean;
  message: string;
  type: 'info' | 'success' | 'log' | 'error' | 'warn';
  data: any;
  time?: string;
}

export interface IActiveContract {
  contractUID: string | number;
  latestACI: object;
  code: string;
  sharingHighlighters?: number[];
  nameInTab: string;
  errorHighlights?: any[];
}

interface additionalAestudioProperties {
  currentWalletProvider?: 'web' | 'extension';
}

interface additionalMemoryAccountProperties {
  property?: string;
}

interface additionalContractProperties {
  deployInfo?: Record<string, any>;
  IDEindex?: number;
  addressPreview?: string;
  $aci?: ContractBase;
}

export type MemoryAccountExtended = MemoryAccount & additionalMemoryAccountProperties;
export type AeSdkExtended = AeSdk & additionalAestudioProperties;
export type AeSdkAeppExtended = AeSdkAepp & additionalAestudioProperties;
export type ContractWithMethodsExtended = ContractWithMethods<ContractMethodsBase> &
  additionalContractProperties;
