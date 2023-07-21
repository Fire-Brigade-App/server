import { Activity } from "../constants/Activity";
import { db } from "./db.service";
import { Timestamp } from "firebase-admin/firestore";

const getUsersWithOutdatedActivities = async (
  minutesWithoutUpdate: number = 60,
  includeActivities: Activity[] = [
    Activity.ONLINE,
    Activity.BUSY,
    Activity.OFFLINE,
  ]
) => {
  const timestampToComparison = Timestamp.fromMillis(
    Date.now() - 1000 * 60 * minutesWithoutUpdate
  );
  const users = await db
    .collection("users")
    .where("activity", "in", includeActivities)
    .where("updated", "<", timestampToComparison)
    .get();

  const usersRefs =
    users?.docs.map((user) => ({ ref: user.ref, data: user.data() })) || [];

  return usersRefs;
};

const updateActivity = async (
  minutesWithoutUpdate: number,
  activity: Activity,
  excludeActivities?: Activity[]
) => {
  const batch = db.batch();
  const users = await getUsersWithOutdatedActivities(
    minutesWithoutUpdate,
    excludeActivities
  );

  users.forEach((user) => {
    const brigadesIds = user.data?.brigades
      ? Object.keys(user.data?.brigades)
      : [];

    brigadesIds.forEach((brigadeId) => {
      batch.update(user.ref, {
        activity,
        [`brigades.${brigadeId}.status`]: "empty",
        [`brigades.${brigadeId}.time`]: "0:0:0",
      });
    });
  });

  console.log(`${users.length} users has updated activity to ${activity}`);

  await batch.commit();
};

const updateActivityToInactive = async () => {
  // After 24 hours without activity set status to "inactive"
  await updateActivity(60 * 24, Activity.INACTIVE, [
    Activity.ONLINE,
    Activity.OFFLINE,
  ]);
};

const updateActivityToOffline = async () => {
  // After 60 minutes without activity set status to "offline"
  await updateActivity(60, Activity.OFFLINE, [Activity.ONLINE]);
};

let UPDATE_STATUSES_TIMER: NodeJS.Timer;

export const updateActivityInIntervals = async (
  intervalInMinutes: number = 1
) => {
  if (UPDATE_STATUSES_TIMER) clearInterval(UPDATE_STATUSES_TIMER);

  const intervalInMiliseconds = intervalInMinutes * 60 * 1000;

  UPDATE_STATUSES_TIMER = setInterval(async () => {
    console.log("Updating statuses...");
    await updateActivityToInactive();
    await updateActivityToOffline();
  }, intervalInMiliseconds);
};
