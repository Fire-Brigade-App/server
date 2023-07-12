import * as firebase from "firebase-admin/app";
import { applicationDefault } from "firebase-admin/app";

firebase.initializeApp({
  credential: applicationDefault(),
});
