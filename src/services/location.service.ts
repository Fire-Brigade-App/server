import { LocationObject } from "../types/LocationObject";
import { calculateStatus } from "../utils/status";
import { formatTime } from "../utils/time";
import { getRoute } from "./route.service";
import { updateUser } from "./user.service";

const handleUpdate = async (userUid: string, location: LocationObject) => {
  const brigadesIds = location.brigadesIds;

  const route = await getRoute(location);
  const duration = (route as any).routes[0].duration; // in seconds

  const status = calculateStatus(duration);
  const time = formatTime(duration);

  await updateUser(userUid, brigadesIds, { status, time });
};

export async function update(userUid: string, location: LocationObject) {
  // This async function is intended to be synchronous here because we don't
  // want to wait for the update. Calculations and update db should be done
  // in the background
  handleUpdate(userUid, location);

  const message = `User (${userUid}) location update`;

  return { message };
}
