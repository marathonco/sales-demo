import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const db = firebase.initializeApp(firebaseConfig).firestore();
db.enablePersistence();
const { TimeStamp, GeoPoint } = firebase.firestore
export { db, TimeStamp, GeoPoint }

console.log('Firebase initialized.')
