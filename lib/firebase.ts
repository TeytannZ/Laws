import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDNwsLw8TbKuJDEeDXtpG2s2CiLyUL7Kyc",
  authDomain: "house-rules-app.firebaseapp.com",
  projectId: "house-rules-app",
  storageBucket: "house-rules-app.firebasestorage.app",
  messagingSenderId: "953025284449",
  appId: "1:953025284449:web:61c70d65df5805f12bdd20",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const db = getFirestore(app)
export const auth = getAuth(app)

console.log("[v0] Firebase initialized successfully")
