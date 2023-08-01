import { Timestamp } from "firebase-admin/firestore";
import { db } from "./db.service";
import { fromAddressToCoordinates } from "./coordinates.service";
import { BrigadeStatus } from "../constants/BrigadeStatus";
import { AlertType } from "../constants/AlertType";
import { Alert } from "../types/Alert";
import { sendNotificationsAboutAlert } from "./messaging.service";

export const handleAddAlert = async (
  brigadeId: string,
  alert: Alert & { country?: string; municipality?: string },
  temporaryAlert?: string
) => {
  try {
    const added = alert.added || Timestamp.fromDate(new Date());
    const address = alert.address || "";
    const country = alert.country || "";
    const municipality = alert.municipality || "";
    const description = alert.description || "";
    const type = alert.type || AlertType.ALERT;
    const author = alert.author || "";
    const source = alert.source || "";
    const vehicles = alert.vehicles || [];
    const completed = null;
    const users = {};
    let location = alert.location || null;

    if (!location && address) {
      location = await fromAddressToCoordinates(
        `${address}, ${municipality}, ${country}`
      );
    }

    const newAlert = {
      added,
      address,
      location,
      description,
      type,
      author,
      source,
      vehicles,
      completed,
    };

    let alertResponse;

    if (temporaryAlert) {
      await db
        .collection("brigades")
        .doc(brigadeId)
        .collection("alerts")
        .doc(temporaryAlert)
        .update(newAlert);
    } else {
      alertResponse = await db
        .collection("brigades")
        .doc(brigadeId)
        .collection("alerts")
        .add({ ...newAlert, users });
    }

    if (!temporaryAlert && !alertResponse?.id) {
      throw new Error();
    }

    console.log("Added new alert: ", alertResponse?.id);

    const brigadeResponse = await db
      .collection("brigades")
      .doc(brigadeId)
      .update({
        status: BrigadeStatus.ALERT,
      });

    console.log("Brigaded status updated", brigadeResponse.writeTime.toDate());

    if (!brigadeResponse.writeTime) {
      throw new Error();
    }

    // Sendind notifications to the firefighters
    sendNotificationsAboutAlert(brigadeId, newAlert);

    return alertResponse?.id;
  } catch (error) {
    console.error(error);
  }
};

export async function add(brigadeId: string, alert: any) {
  if (alert) {
    handleAddAlert(brigadeId, alert);
  } else {
    console.error("Missing alert data:", {
      alert,
    });
  }

  const message = `Alert added`;

  return { message };
}
