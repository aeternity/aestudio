import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './user.model'; 

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApplicationRef } from '@angular/core';

import { Crypto } from '@aeternity/aepp-sdk/es'


@Injectable({
    providedIn: 'root'
  })
export class AuthService {

    user$: Observable<User>;

    theUser: any;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,  // TODO: rename to afStore
        private router: Router,
        private ref: ApplicationRef
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
        const provider = new auth.GoogleAuthProvider();
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

  const keypair = Crypto.generateKeyPair()
  console.log(`Secret key: ${keypair.secretKey}`)
  console.log(`Public key: ${keypair.publicKey}`)
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
        // put eventual router command here.. this,router.navigate(['/'])
    }

}


// https://fireship.io/lessons/angularfire-google-oauth/
// https://www.techiediaries.com/angular-firestore-tutorial/