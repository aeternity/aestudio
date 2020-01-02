import { Injectable } from '@angular/core';
//import { Router } from '@angular/router';
import { User } from './user.model'; 
import { HttpClient } from '@angular/common/http';
//import { from } from 'rxjs';
import { from as observableFrom } from 'rxjs';
import { concatMap, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Aeternity
import { Crypto } from '@aeternity/aepp-sdk/es'
import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'


// Firebase
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

// Fire Editor
import { CompilerService } from '../../compiler.service'

@Injectable({
    providedIn: 'root'
  })
export class AuthService {

    user$: Observable<User>;

    theUser: any;

    fillingUpAccounts = {
      active: false,
      percentage: 0
    }


    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,  // TODO: rename to afStore
        private http: HttpClient,
        private compiler: CompilerService
        
    ) { 
          // Get the auth state, then fetch the Firestore user document or return null
          this.user$ = this.afAuth.authState.pipe(
            switchMap(user => {
                // Logged in
              if (user) {
                  console.log("Login: Als user kam:", user);
                  this.theUser = user;
                  this.checkForKeys(user);
                return this.afs.doc<User>("users/" + user.uid).valueChanges();
              } else {
                  console.log("Login: Ausgeloggt")
                // Logged out
                this.theUser = null;
                return of(null);
              }
            })
          )
        }


    async googleSignin() {
        const provider = new auth.GithubAuthProvider();
        const credential = await this.afAuth.auth.signInWithPopup(provider);
        return this.updateUserData(credential.user);
    }

    async checkForKeys(user) {
      var userRef = this.afs.collection('users').doc(user.uid);
      
        let getUser = await userRef.get().subscribe(doc => {
          if (!doc.exists) {
            console.log('Login: No such document!');
          } else {
            console.log('Login: Document data:', doc.data());

          // if it's the user's first time, generate him accounts, fill them up and do other things.
          let theData = doc.data();


          if ((theData as any).accounts == undefined) {
            // if he doesn't have accounts yet, create and fill some, and restart SDK with ne account (taken care for by the generateAndFill function)
             this.generateAndFillAccounts();

            } else {
              // else, restart the SDK with the accounts fetched from backend
              let theAccounts;
              (theData as any).accounts.forEach(account => {
                theAccounts.push(MemoryAccount({keypair: account}))
              });
              this.compiler.setupClient({accounts: theAccounts});
            }
          /* const keypair = Crypto.generateKeyPair()
          //console.log(`Secret key: ${keypair.secretKey}`)
          console.log(`Public key: ${keypair.publicKey}`) */
          }
        })
    }

    private updateUserData(user) {
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
    }

    async signOut() {
        await this.afAuth.auth.signOut();
        this.theUser = null;
        this.fillingUpAccounts.active = false;
        // put eventual router command here.. this,router.navigate(['/'])
    }

    // helpers


    private async generateAndFillAccounts() {
      console.log("Login: fillup triggered")
      this.fillingUpAccounts.active = true;
     var accs: any[] = [];
     for(let i=0; i<4; i++){
       accs.push(Crypto.generateKeyPair());
     }
     
     var memoryAccs: MemoryAccount[] = [];
     accs.forEach(acc => {
       let oneAccount = new MemoryAccount({keypair: acc})
       // add custom property to memory account to later know it belongs to a logged-in user
       oneAccount.property = "personal"
       memoryAccs.push(oneAccount)
      })

     observableFrom(accs).pipe(
        concatMap(acc => this.http.post(`https://testnet.faucet.aepps.com/account/${acc.publicKey}`, {}, {headers: {'content-type': 'application/x-www-form-urlencoded'}}))
    ).subscribe(
        response => {
          this.fillingUpAccounts.percentage = this.fillingUpAccounts.percentage + 25;
          console.log("Login: fillup transaction response:", response)}, //do something with responses
        error => console.error("Login: fillup transaction error error" ,error), // so something on error
        () => {
          console.info("All requests done") // do something when all requests are done 
          console.log(accs);
          // MAKE MEMORY ACCOUNTS !
          this.compiler.setupClient({accounts: memoryAccs}); 
          

        }
    );

    }

}

// TODO: accs in backend speichern
// TODO: accs in accounts verfügbar machen
// TODO: auto re-fill accounts when empty
// https://fireship.io/lessons/angularfire-google-oauth/
// https://www.techiediaries.com/angular-firestore-tutorial/

// chrome-extension://klbibkeccnjlkjkiokjodocebajanakg/suspended.html#ttl=Get%20data%20with%20Cloud%20Firestore%20%C2%A0%7C%C2%A0%20Firebase&pos=0&uri=https://firebase.google.com/docs/firestore/query-data/get-data