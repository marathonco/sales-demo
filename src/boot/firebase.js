import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

let firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };

const db = firebase.initializeApp(firebaseConfig).firestore();
const { TimeStamp, GeoPoint } = firebase.firestore

const auth = firebase.auth();

if (location.hostname === "blarg") {
  console.log('using emulator');
  db.useEmulator("localhost", 4500);
  auth.useEmulator("http://localhost:9099");
} else {
  console.log('Firebase initialized.')
  db.enablePersistence();
}
export { auth, db, TimeStamp, GeoPoint }


