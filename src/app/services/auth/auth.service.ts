import { Injectable } from '@angular/core';
//import { Router } from '@angular/router';
import { User } from './user.model';
import { HttpClient } from '@angular/common/http';
//import { from } from 'rxjs';
import { Observable } from 'rxjs';
import { generateKeyPair, MemoryAccount } from '@aeternity/aepp-sdk';

// Aeternity
//import { Crypto } from '@aeternity/aepp-sdk/es'
//import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'

// Firebase
/* import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
 */
// Fire Editor
import { CompilerService } from '../../compiler.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null | undefined>;

  theUser: any;

  // workaround for stupid swatchMap rxJS thingy triggering twice after response
  loginRetrieved = false;

  fillingUpAccounts = {
    active: 'false',
    percentage: 0,
  };

  constructor(
    /* private afAuth: AngularFireAuth,
        private afs: AngularFirestore,  */ // TODO: rename to afStore
    private http: HttpClient,
    private compiler: CompilerService,
  ) {
    // Get the auth state, then fetch the Firestore user document or return null
    /* this.user$ = this.afAuth.authState.pipe(
            switchMap(user => {
                // Logged in

              if (user) {
                  console.log("Login: Als user kam:", user);
                  this.theUser = user;
                  if (this.loginRetrieved == false) {
                    this.loginRetrieved = true
                    this.checkForKeys(user);
                  }

                return this.afs.doc<User>("users/" + user.uid).valueChanges();
              } else {
                  console.log("Login: Ausgeloggt")
                // Logged out
                this.loginRetrieved = false // remove the lock for next login
                this.theUser = null;
                return of(null);
              }
            })
          ) */
  }

  /*    async googleSignin() {
        const provider = new auth.GithubAuthProvider();
        const credential = await this.afAuth.auth.signInWithPopup(provider);
        return this.updateUserData(credential.user);
    } */

  // get the user's testnet keys
  /*  async checkForKeys(user) {

      var userRef = this.afs.collection('users').doc(user.uid);

        let getUser = await userRef.get().subscribe(async doc => {
          if (!doc.exists) {
            console.log('Login: No such document!');
          } else {
            console.log('Login: Document data:', doc.data());

          // if it's the user's first time, generate him accounts, fill them up and do other things.
          let theData = doc.data();


          if ((theData as any).accounts == undefined) {
            // if he doesn't have accounts yet, create and fill some, and restart SDK with new accounts

             let keypairs = await this.generateAndFillAccounts();

             console.log("Login: Have these accounts to write:", keypairs)
             let writeDB =  await this.afs.collection('users').doc(user.uid).set({accounts: keypairs}, {merge: true});

             console.log("Login: writing to db was like:", writeDB)

             let memoryaccounts : MemoryAccount[] = [];

             keypairs.forEach(account => {
              memoryaccounts.push(MemoryAccount({keypair: account}))
            });

            this.compiler.Chain.currentWalletProvider == "web" ? this.compiler.setupWebClient({accounts: memoryaccounts}) : true

            } else {
              // else, restart the SDK with the accounts fetched from backend
              var theAccounts: any[] = []
              console.log("Login: Retrieved user's accounts:", theData);

              (theData as any).accounts.forEach(account => {
                theAccounts.push(MemoryAccount({keypair: account}))
              });
              // make sure a chainprovider is initialized alreay..
              // using dirty workaround to provide the resolving function the right this-context
              await this.compiler.awaitInitializedChainProvider();
              this.compiler.Chain.currentWalletProvider == "web" ? this.compiler.setupWebClient({accounts: theAccounts, personalAccounts: true}) : true
            }
          }
        })
    } */

  /*    private updateUserData(user) {
        // query for user information by user ID and create a reference to this data entry.
        const userRef: AngularFirestoreDocument<User> = this.afs.doc("users/" + user.uid);

        const data = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            // ...photo URL....
        }

        // update the data entry with fresh user information - not sure yet how necessary this is.
        return userRef.set(data, {merge: true})
    } */

  /*     async signOut() {
        await this.afAuth.auth.signOut();
        this.theUser = null;
        this.fillingUpAccounts.active = "false";
        // put eventual router command here.. this,router.navigate(['/'])

        // make SDK restart with public testnet accounts
        this.compiler.Chain.currentWalletProvider == "web" ? this.compiler.setupWebClient({command: "reset"}) : true
    } */

  // helpers

  private async generateAndFillAccounts(): Promise<(typeof MemoryAccount)[]> {
    return new Promise((resolve) => {
      console.log('Login: fillup triggered');
      this.fillingUpAccounts.active = 'true';

      let maxFourBusy = 0;
      const keypairs: any[] = [];
      // enough of RxJS bullshit - just looping over the fillup request as long as is needed to fill up 4 accounts.
      setInterval(async () => {
        if (keypairs.length >= 4) {
          this.fillingUpAccounts.active = 'done';
          resolve(keypairs);
        } else {
          if (maxFourBusy < 4) {
            maxFourBusy++;
            const keypair = generateKeyPair();

            //console.log("Login: Keypair:", keypair)

            // add custom property to memory account to later know it belongs to a logged-in user
            //oneAccount.property = "personal"
            //console.log("Login: oneAccount:", oneAccount)

            //debugger

            this.http
              .post(
                `https://testnet.faucet.aepps.com/account/${keypair.publicKey}`,
                {},
                { headers: { 'content-type': 'application/x-www-form-urlencoded' } },
              )
              .subscribe({
                next: (data) => {
                  keypairs.push(keypair);
                  maxFourBusy--;
                  this.fillingUpAccounts.percentage = this.fillingUpAccounts.percentage + 25;
                  console.log('Login: Finished account', data);
                },
                error: () => {
                  /* console.log('Faucet request errored, waiting for next run.', error); */ maxFourBusy--;
                },
              });
          }
        }
      }, 1000);
    });
  }

  // for sharing contracts
  /*  async storeContractShare(contractCode) : Promise<string | boolean>{
      let data = {code: contractCode}

      try {
        let writeDB =  await this.afs.collection('shared-contracts').add(data)
        console.log("AUTH write ergab:", writeDB)
        let dbID = writeDB["_key"].path.segments[1]
        return dbID
      } catch (error) {
        console.log("Auth: Write to DB failed!")
        return false
      }
    } */

  /*  async getSharedContract(shareID : string) {
      return new Promise((resolve, reject) =>
        {
          try {
            let contract =  this.afs.collection('shared-contracts').doc(shareID).get().subscribe(something => {
              //console.log("AUTH: Retrieved", something)
              console.log("AUTH: Retrieved", something.data().code)
              resolve(something.data().code)
            })
          } catch (error) {
            console.log("AUTH: Couldn't query for contract,", error)
            resolve(undefined)
          }
        }
      )



    } */
}

// TODO: auto re-fill accounts when empty
// https://fireship.io/lessons/angularfire-google-oauth/
// https://www.techiediaries.com/angular-firestore-tutorial/

//https://firebase.google.com/docs/firestore/query-data/get-data
