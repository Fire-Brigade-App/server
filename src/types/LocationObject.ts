import * as Location from "expo-location";

export interface LocationObject extends Location.LocationObject {
  source: "background-location-task" | "background-fetch";
  brigadesIds: string[];
  preventRouteDurationMeasurement: boolean;
}
