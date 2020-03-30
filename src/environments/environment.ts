// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    contractSharingBackend: 'https://xfs2awe868.execute-api.eu-central-1.amazonaws.com/dev/candidates/',
    appUrl: 'http://localhost:4200/',
    testnetFaucetUrl: 'https://testnet.faucet.aepps.com/account/',
    compilerURL:'https://latest.compiler.aepps.com',
    debugCompilerURL : 'https://latest.compiler.aepps.com',
    publicTestnetURL : 'https://sdk-testnet.aepps.com',
    compilerRequestDelay : 400,
    firebase: {
      apiKey: "AIzaSyD2uvXdg_TBcXlvj_AxXUtwsSqfgk3sT7k",
      authDomain: "fire-editor-f1e92.firebaseapp.com",
      databaseURL: "https://fire-editor-f1e92.firebaseio.com",
      projectId: "fire-editor-f1e92",
      messagingSenderId: "522100874686",
      appId: "1:522100874686:web:9f854fa36991f016066def"
    }
};


// development
/*
export const environment = {
  production: false,
  contractSharingBackend: 'https://xfs2awe868.execute-api.eu-central-1.amazonaws.com/dev/candidates/',
  appUrl: 'http://localhost:4200/'
}; /*

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
