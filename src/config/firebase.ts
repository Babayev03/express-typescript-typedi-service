import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import config from "./index";

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId,
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
