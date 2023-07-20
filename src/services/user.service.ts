import { Timestamp } from "firebase-admin/firestore";
import { Status } from "../constants/Status";
import { db } from "./db.service";
import { Activity } from "../constants/Activity";

interface UserDataUpdate {
  activity?: Activity;
  status?: Status;
  time?: string;
}

export const updateUser = async (
  userUid: string,
  data: UserDataUpdate,
  brigadesIds?: string[]
) => {
  const { activity, status, time } = data;
  const updateObj: any = {};

  if (brigadesIds) {
    brigadesIds.forEach((brigadeId) => {
      if (status) {
        updateObj[`brigades.${brigadeId}.status`] = status;
      }

      if (time) {
        updateObj[`brigades.${brigadeId}.time`] = time;
      }
    });
  }

  let activityToUpdate = activity || Activity.OFFLINE;
  if (status && [Status.NEAR, Status.FAR, Status.OUT].includes(status)) {
    activityToUpdate = Activity.ONLINE;
  }
  updateObj.activity = activityToUpdate;

  const updated = Timestamp.fromDate(new Date());
  updateObj.updated = updated;

  await db.collection("users").doc(userUid).update(updateObj);
};
