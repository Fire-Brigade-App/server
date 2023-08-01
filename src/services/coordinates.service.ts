import axios from "axios";
import { GeoPoint } from "firebase-admin/firestore";

const COORDINATES_URL_SERVICE = "https://nominatim.openstreetmap.org/search";

export const fromAddressToCoordinates = async (address: string) => {
  console.log(address);
  const params = {
    q: address,
    format: "json",
  };

  let coordinates = new GeoPoint(0, 0);

  try {
    const result = await axios.get(COORDINATES_URL_SERVICE, { params });
    const response = result.data;

    if (response?.length) {
      const place = response[0];

      coordinates = new GeoPoint(
        +(+place?.lat).toFixed(6) || 0,
        +(+place?.lon).toFixed(6) || 0
      );
    }
  } catch (error) {
    console.error(error);
  }

  return coordinates;
};
