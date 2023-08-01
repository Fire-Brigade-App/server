import { GeoPoint, Timestamp } from "firebase-admin/firestore";
import { Activity } from "./Activity";
import { Role } from "./Role";
import { Status } from "./Status";

export interface UserData {
  activity: Activity;
  brigades: {
    [brigadeId: string]: {
      status: Status;
      time: string;
      roles: Role[];
    };
  };
  fcmToken: string;
  firstName: string;
  lastName: string;
  location: GeoPoint;
  updated: Timestamp;
}

export interface UserDataWithUid extends UserData {
  uid: string;
}
