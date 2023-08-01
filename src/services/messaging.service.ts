import { getMessaging } from "firebase-admin/messaging";
import { AlertType } from "../constants/AlertType";
import { Status } from "../constants/Status";
import { UserData } from "../constants/UserData";
import { Alert } from "../types/Alert";
import { db } from "./db.service";

export const sendNotificationsAboutAlert = async (
  brigadeId: string,
  newAlert: Alert
) => {
  const usersRefs = await db
    .collection("users")
    .where(`brigades.${brigadeId}.status`, "in", [
      Status.NEAR,
      Status.FAR,
      Status.OUT,
      Status.EMPTY,
    ])
    .get();

  if (usersRefs.empty) {
    return;
  }

  const users = usersRefs.docs.map((userDoc) => userDoc.data() as UserData);
  const tokens = users.map((user) => user.fcmToken);
  const title = `${(newAlert.type || AlertType.ALERT).toUpperCase()}! ${
    newAlert.address || "No address"
  }`;
  const body = `${newAlert.description || "No description"}`;
  const message = { notification: { title, body }, tokens };

  try {
    const result = await getMessaging().sendEachForMulticast(message);
    console.log("Notifications result", result);
  } catch (error) {
    console.error(error);
  }
};
