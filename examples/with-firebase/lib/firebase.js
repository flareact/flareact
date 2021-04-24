import firebase from 'firebase/app'
import 'firebase/firestore'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.FLAREACT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.FLAREACT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FLAREACT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.FLAREACT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.FLAREACT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FLAREACT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FLAREACT_PUBLIC_FIREBASE_APP_ID,
  })
}

export default firebase
