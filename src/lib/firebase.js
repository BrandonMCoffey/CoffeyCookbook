import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAaEWhvVgIl4Kfey5XgkjZqkZn60A3LLxo",
  authDomain: "experimental-games-190e1.firebaseapp.com",
  databaseURL: "https://experimental-games-190e1-default-rtdb.firebaseio.com",
  projectId: "experimental-games-190e1",
  storageBucket: "experimental-games-190e1.firebasestorage.app",
  messagingSenderId: "153880259137",
  appId: "1:153880259137:web:541dde079470309138f4c0",
  measurementId: "G-7MV7X41XPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);