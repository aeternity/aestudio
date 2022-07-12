// this enhances the type of aeSdk with a few properties that aeStudio needs, doing this for maintaining backwards support for
// existing codebase and for better implementation of future features.

import { AeSdk } from '@aeternity/aepp-sdk';

type Enhancements = {
    currentWalletProvider? :  'web' | 'extension'
}

export type AeSdkEnhanced = AeSdk & Enhancements