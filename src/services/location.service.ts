import { Activity } from "../constants/Activity";
import { LocationObject } from "../types/LocationObject";
import { calculateStatus } from "../utils/status";
import { formatTime } from "../utils/time";
import { getRoute } from "./route.service";
import { updateUser } from "./user.service";

const handleUpdate = async (userUid: string, location: LocationObject) => {
  const { brigadesIds, preventRouteDurationMeasurement } = location;

  try {
    let route, duration, status, time, activity;

    // In some cases, i.e. when the user location is very similar to the
    // previous one, we don't want to call getRoute, but we still want to call
    // updateUser for updating the last user activity timestamp.
    if (!preventRouteDurationMeasurement) {
      route = await getRoute(location);
      if (!route) {
        return;
      }
      activity = Activity.ONLINE;
      duration = (route as any)?.routes[0].duration; // in seconds
      status = calculateStatus(duration);
      time = formatTime(duration);
    }

    await updateUser(userUid, { activity, status, time }, brigadesIds);
  } catch (error) {
    console.error(error);
  }
};

export async function update(userUid: string, location: LocationObject) {
  // This async function is intended to be synchronous here because we don't
  // want to wait for the update. Calculations and update db should be done
  // in the background
  if (userUid && location) {
    handleUpdate(userUid, location);
  } else {
    console.error("Missing user data:", {
      userUid,
      location,
    });
  }

  const message = `User (${userUid}) location update`;

  return { message };
}
