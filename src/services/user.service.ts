import { Timestamp } from "firebase-admin/firestore";
import { Status } from "../constants/Status";
import { db } from "./db.service";

interface UserDataUpdate {
  status?: Status;
  time?: string;
}

export const updateUser = async (
  userUid: string,
  brigadesIds: string[],
  data: UserDataUpdate
) => {
  const { status, time } = data;
  const updateObj: any = {};

  brigadesIds.forEach((brigadeId) => {
    if (status) {
      updateObj[`brigades.${brigadeId}.status`] = status;
    }

    if (time) {
      updateObj[`brigades.${brigadeId}.time`] = time;
    }
  });

  const updated = Timestamp.fromDate(new Date());
  updateObj.updated = updated;

  await db.collection("users").doc(userUid).update(updateObj);
};
