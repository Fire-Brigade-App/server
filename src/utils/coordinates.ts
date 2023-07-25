// Function to convert coordinates to decimal format
const convertToDecimal = (
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string
) => {
  let decimalValue: number = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    decimalValue = -decimalValue;
  }
  // Rounding the value to 6 decimal places
  return decimalValue.toFixed(6);
};

export const convertCoorsFromERemizaToDecimal = (inputString: string) => {
  // Regular expression to match latitude and longitude values
  const regex: RegExp =
    /\s*(\d+)°\s+(\d+)'\s+([\d,]+)"([EW])\s+\|\s+(\d+)°\s+(\d+)'\s+([\d,]+)"([NS])/;

  // Using the exec method on the string to match the values using the regular expression
  let match: RegExpExecArray | null = regex.exec(inputString);

  let longitude: string | undefined, latitude: string | undefined;

  // Checking if the match was successful
  if (match) {
    // Converting values to appropriate types and assigning them to variables
    const degreesLongitude: number = parseInt(match[1], 10);
    const minutesLongitude: number = parseInt(match[2], 10);
    const secondsLongitude: number = parseFloat(match[3].replace(",", "."));
    const directionLongitude: string = match[4];

    const degreesLatitude: number = parseInt(match[5], 10);
    const minutesLatitude: number = parseInt(match[6], 10);
    const secondsLatitude: number = parseFloat(match[7].replace(",", "."));
    const directionLatitude: string = match[8];

    // Converting to decimal format
    if (directionLongitude === "E" || directionLongitude === "W") {
      longitude = convertToDecimal(
        degreesLongitude,
        minutesLongitude,
        secondsLongitude,
        directionLongitude
      );
    }

    if (directionLatitude === "N" || directionLatitude === "S") {
      latitude = convertToDecimal(
        degreesLatitude,
        minutesLatitude,
        secondsLatitude,
        directionLatitude
      );
    }
  } else {
    console.log("Failed to match coordinates.");
  }

  console.log("Coordinates", latitude, longitude);

  return [Number(latitude), Number(longitude)];
};
