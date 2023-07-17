import axios from "axios";
import { LocationObject } from "../types/LocationObject";

const ROUTE_SERVICE_URL = "http://router.project-osrm.org/route/v1";

const cached_fire_brigade_lat = 51.23102;
const cached_fire_brigade_lon = 22.46274;

type Profile = "driving" | "car" | "bike" | "foot";

export const getRoute = async (toLocation: LocationObject) => {
  const profile: Profile = "driving";

  const fromCoords = `${toLocation.coords.longitude},${toLocation.coords.latitude}`;
  const toCoords = `${cached_fire_brigade_lon},${cached_fire_brigade_lat}`;
  const coordinates = `${fromCoords};${toCoords}`;

  const url = `${ROUTE_SERVICE_URL}/${profile}/${coordinates}`;
  const params = {
    overview: false,
  };

  let response;

  try {
    const result = await axios.get(url, { params });
    response = result.data;
  } catch (error) {
    response = error;
    console.error(error);
  }

  return response;
};
