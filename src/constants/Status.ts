export enum Status {
  // calculated time if user is in standby mode and "online" Activity
  NEAR = "near", // green <5 min
  FAR = "far", // yellow 5<=10 min
  OUT = "out", // orange >10 min

  // for "busy", "offline" and "inactive" Activity
  EMPTY = "EMPTY", //

  // user status in the fire brigade
  CANDIDATE = "candidate",
  SUSPENDED = "suspended",
}
