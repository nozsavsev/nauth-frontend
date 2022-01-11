import { initializeApp, getApps, getApp } from "firebase/app";
import 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyDyEx3bDdv2ufMImlHMETqWy-8PibeOpmM",
  authDomain: "nozsa-com.firebaseapp.com",
  projectId: "nozsa-com",
  storageBucket: "nozsa-com.appspot.com",
  messagingSenderId: "27550983296",
  appId: "1:27550983296:web:10a3775e558f4845723265"
};

export default function initFirebase() {

  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

}