import puppeteer from "puppeteer";
import { GeoPoint, Timestamp } from "firebase-admin/firestore";
import { convertCoorsFromERemizaToDecimal } from "../utils/coordinates";
import { db } from "./db.service";
import { wait } from "../utils/time";
import { convertERemizaDateToDate } from "../utils/date";
import { handleAddAlert } from "./alerts.service";
import { AlertType } from "../constants/AlertType";
import { Alert } from "../types/Alert";

const LOGIN_PAGE_URL = "https://e-remiza.pl/OSP.UI.SSO/logowanie";
const ALERTS_PAGE_URL = "https://e-remiza.pl/OSP.UI.EREMIZA/alarmy";

const brigadesWithActiveAlertFetching = new Set();

type ERemizaAlertType = "P" | "MZ" | "CW" | "Alarm" | "TGB";

interface ERemizaAlert {
  date: string; // DD-MM-YYYY HH:mm
  dateObj?: Date;
  type: ERemizaAlertType;
  address: string;
  description: string;
  author: string;
  coords: string;
}

const alertTypesMap = {
  P: AlertType.FIRE,
  MZ: AlertType.THREAT,
  CW: AlertType.TRAINING,
  Alarm: AlertType.ALERT,
  TGB: AlertType.ALERT,
};

const fetchLastAlert = async (brigadeId: string, initialAlert?: Alert) => {
  try {
    console.log("Start fetching last alert from e-remiza for", brigadeId);

    // Check if another fetch is active
    if (brigadesWithActiveAlertFetching.has(brigadeId)) {
      console.log("There is another fetching active for this fire brigade");
      return;
    }

    // Push brigade id to cache to avoid addtional fetching alerts
    brigadesWithActiveAlertFetching.add(brigadeId);

    let temporaryAlert = null;
    // If initialAlert argument exist (only for post requests) create temporary alert
    if (initialAlert) {
      const { description, address, author } = initialAlert;

      const added = Timestamp.fromDate(new Date());

      const newAlert = {
        added,
        type: null,
        address,
        location: null,
        description,
        author,
        source: "user",
      };

      temporaryAlert = await handleAddAlert(brigadeId, newAlert);
    }

    // Get e-Remiza credentials from database
    const brigade = await db.collection("brigades").doc(brigadeId).get();
    const brigadeData = brigade?.data();
    const eRemizaPluginConfig = brigadeData?.plugins["e-remiza"];
    const { login, password } = eRemizaPluginConfig;

    if (!login || !password) {
      throw new Error("Missing login or password in e-Remiza plugin config");
    }

    // Get the last alert from db which has 'e-remiza' as a source
    const lastAlertFromERemiza = await db
      .collection("brigades")
      .doc(brigadeId)
      .collection("alerts")
      .where("source", "==", "e-remiza")
      .orderBy("added", "desc")
      .limit(1)
      .get();

    let timeOfTheLastAlert;
    if (!lastAlertFromERemiza.empty) {
      const added = lastAlertFromERemiza.docs[0].data().added as Timestamp;
      timeOfTheLastAlert = added.toMillis();
    }

    // Launch the browser
    const browser = await puppeteer.launch({
      headless: "new",
      timeout: 60000,
      args: ["--no-sandbox"],
    });

    // Create a page
    const page = await browser.newPage();

    // Login
    await page.goto(LOGIN_PAGE_URL);
    await page.type(
      "#ContentPlaceHolder1_ASPxCallbackPanelLogin_ASPxTextBoxUserName_I",
      login
    );
    await page.type(
      "#ContentPlaceHolder1_ASPxCallbackPanelLogin_ASPxTextBoxPassword_I",
      password
    );
    await page.click("#ContentPlaceHolder1_ASPxButtonLogin");
    await page.waitForNavigation();

    const getLastAlertFromTable = async () => {
      // Go to the alerts page
      await page.goto(ALERTS_PAGE_URL);

      // Get the last alert data from the table element
      await page.waitForSelector("#MainContent_ASPxGridViewAlarms_DXMainTable");
      const alert = await page.$$eval(
        "#MainContent_ASPxGridViewAlarms_DXDataRow0 td",
        (anchors) => {
          return anchors.map((anchor) => {
            // Get a full description from title tag of the span inside td element
            if (anchor.id === "MainContent_ASPxGridViewAlarms_tccell0_3") {
              return anchor?.getElementsByTagName("span")[0].title?.trim();
            } else {
              return anchor?.textContent?.trim();
            }
          });
        }
      );
      const [date, type, address, description, _, author, coords] = alert;
      return {
        date,
        type,
        address,
        description,
        author,
        coords,
      } as ERemizaAlert;
    };

    // Sometimes first alert info is generated before the sending alert record
    // to the e-remiza services so we need to refresh the alert page in the
    // loop at 5-second intervals for 3 minutes and break the loop after
    // getting new alert data
    const interationsPerMinutes = 1;
    const minutesOfInterations = 1;
    const iterationsOfChecking = interationsPerMinutes * minutesOfInterations;

    let alert: ERemizaAlert | undefined;
    for (let index = 0; index < iterationsOfChecking; index++) {
      const lastAlertFromTable = await getLastAlertFromTable();
      const timeTheLastAlertFromTable = lastAlertFromTable.date;

      // Break the loop if we don't get any alert data
      if (!timeTheLastAlertFromTable) {
        break;
      }

      // e-Remiza uses the string DD-MM-YYYY HH:mm for saving dates
      const dateTheLastAlertFromERemiza = convertERemizaDateToDate(
        timeTheLastAlertFromTable
      );
      const timeTheLastAlertFromERemiza = dateTheLastAlertFromERemiza.getTime();

      // Comparing last e-Remiza alert from our db with last alert from
      // e-Remiza db
      if (timeOfTheLastAlert !== timeTheLastAlertFromERemiza) {
        console.log("New alert found");
        // If the last e-Remiza alert from our db has diffrent timestamp than
        // last alert from e-Remiza db we assign the alert variable with
        // putting well formated date
        alert = lastAlertFromTable;
        alert.dateObj = dateTheLastAlertFromERemiza;
        break;
      } else {
        console.log("Nothing new alert to add");
        // Wait 5 seconds before refresh the alert page with the table
        await wait(5000);
        continue;
      }
    }

    // Close browser
    await browser.close();

    // If we fetched the new alert from the e-Remiza service then we should
    // update alert list inside our db and set the 'alert' status for the
    // fire brigade
    if (alert) {
      const { dateObj, type, address, description, author, coords } = alert;

      let latitude, longitude;
      if (coords) {
        const [lat, lon] = convertCoorsFromERemizaToDecimal(coords);
        latitude = lat;
        longitude = lon;
      }

      const geopoint = new GeoPoint(latitude || 0, longitude || 0);
      const added = Timestamp.fromDate(dateObj!);
      const alertType = alertTypesMap[type] || null;

      const newAlert = {
        added,
        type: alertType,
        address,
        location: geopoint,
        description,
        author,
        source: "e-remiza",
      };

      if (temporaryAlert) {
        await handleAddAlert(brigadeId, newAlert, temporaryAlert);
      } else {
        await handleAddAlert(brigadeId, newAlert);
      }
    }

    setTimeout(() => {
      // Remove brigade id from the cache, but after 3 minutes to avoid too many checks
      brigadesWithActiveAlertFetching.delete(brigadeId);
    }, 1000 * 60 * 1);
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
};

export async function fetch(brigadeId: string, alert?: Alert) {
  // This async function is intended to be synchronous here because we don't
  // want to wait for the update. Calculations and update db should be done
  // in the background
  fetchLastAlert(brigadeId, alert);

  return { message: "Fetching last alert from e-Remiza initialized" };
}
