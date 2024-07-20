/* eslint-disable quotes */
/* eslint-disable prettier/prettier */

import {initializeApp} from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBiv14b0KD0SyjrEmUaVzQhNtnuU14zPgE',
  authDomain: 'aistear-unica.firebaseapp.com',
  projectId: 'aistear-unica',
  storageBucket: 'aistear-unica.appspot.com',
  messagingSenderId: '780782493776',
  appId: '1:780782493776:web:7abc6f7afe3c63b752b155',
  measurementId: 'G-5C3NHVSEGV',
};

export const app = initializeApp(firebaseConfig, {
  persistence: ['asyncStorage'],
});
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
// AIzaSyCYDYbrhpUNYw-GmBeHGOxMQQ6E4lA6Zyk
