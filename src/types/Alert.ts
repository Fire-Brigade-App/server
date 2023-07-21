import { Timestamp, GeoPoint } from "firebase-admin/firestore";
import { AlertType } from "../constants/AlertType";

export interface Alert {
  added: Timestamp;
  address: string;
  type: AlertType;
  description: string;
  vehicles: string[];
  completed: Timestamp | null;
  confirmedBy: string[];
  rejectedBy: string[];
  onTheWay: string[];
  location: GeoPoint;
  source: string;
}
