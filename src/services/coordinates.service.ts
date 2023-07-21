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

    console.log(response);

    if (response?.length) {
      const place = response[0];

      console.log(place);

      coordinates = new GeoPoint(
        Number(place?.lat) || 0,
        Number(place?.lon) || 0
      );
    }
  } catch (error) {
    console.error(error);
  }

  return coordinates;
};
