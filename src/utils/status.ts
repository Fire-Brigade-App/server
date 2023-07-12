import { Status } from "../constants/Status";

export const calculateStatus = (duration: number): Status => {
  const minutes = duration / 60;

  if (minutes <= 5) {
    return Status.NEAR;
  } else if (minutes <= 10) {
    return Status.FAR;
  }
  return Status.OUT;
};
