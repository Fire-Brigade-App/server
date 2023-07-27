import { Timestamp, GeoPoint } from "firebase-admin/firestore";
import { AlertType } from "../constants/AlertType";
import { UserStatusInAlert } from "../constants/UserStatusInAlarm";

export interface Alert {
  added?: Timestamp;
  address?: string;
  type?: AlertType;
  description: string;
  vehicles?: string[];
  completed?: Timestamp | null;
  users?: {
    [userUid: string]: UserStatusInAlert;
  };
  location?: GeoPoint;
  source: string;
  author: string;
}
