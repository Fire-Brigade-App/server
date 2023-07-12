import { LocationObject } from "../types/LocationObject";
import { db } from "./db.service";

export async function update(userUid: string, location: LocationObject) {
  const userDoc = await db.collection("users").doc(userUid).get();
  const user = userDoc.data();

  console.log(user);

  const message = `User (${userUid}) location update`;

  return { message };
}
