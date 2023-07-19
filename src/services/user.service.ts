import { Timestamp } from "firebase-admin/firestore";
import { Status } from "../constants/Status";
import { db } from "./db.service";
import { Activity } from "../constants/Activity";

interface UserDataUpdate {
  activity?: Activity;
  status?: Status;
  time?: string;
}

interface UpdateUserBody {
  brigadesIds: string[];
  data: UserDataUpdate;
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

const handleUpdate = async (userUid: string, userData: UpdateUserBody) => {
  const { brigadesIds, data } = userData;
  try {
    await updateUser(userUid, data, brigadesIds);
  } catch (error) {
    console.error(error);
  }
};

export async function update(userUid: string, userData: UpdateUserBody) {
  // This async function is intended to be synchronous here because we don't
  // want to wait for the update. Calculations and update db should be done
  // in the background
  if (userUid && userData) {
    handleUpdate(userUid, userData);
  } else {
    console.error("Missing user data:", {
      userUid,
      userData,
    });
  }

  const message = `User (${userUid}) data update`;

  return { message };
}
