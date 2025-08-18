import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0Fs5bzVwhURY03d3xgmi369S36HAmMZY",
  authDomain: "mail-46824.firebaseapp.com",
  projectId: "mail-46824",
  storageBucket: "mail-46824.firebasestorage.app",
  messagingSenderId: "251132661594",
  appId: "1:251132661594:web:03fb0fe0b56c5bb06b6d63",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export default app
