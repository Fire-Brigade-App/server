import { LocationObject } from "../types/LocationObject";
import { calculateStatus } from "../utils/status";
import { formatTime } from "../utils/time";
import { getRoute } from "./route.service";
import { updateUser } from "./user.service";

const handleUpdate = async (userUid: string, location: LocationObject) => {
  const brigadesIds = location.brigadesIds;

  try {
    const route = await getRoute(location);
    if (!route) {
      return;
    }
    const duration = (route as any)?.routes[0].duration; // in seconds
    const status = calculateStatus(duration);
    const time = formatTime(duration);
    await updateUser(userUid, brigadesIds, { status, time });
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
