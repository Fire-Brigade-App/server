export enum Status {
  // calculated time if user is in standby mode
  NEAR = "near", // green <5 min
  FAR = "far", // yellow 5<=10 min
  OUT = "out", // orange >10 min

  // user is in busy mode
  BUSY = "busy", // red

  // if last user update was in standby mode
  OFFLINE = "offline", // grey - no updates from 1<24 h
  INACTIVE = "inactive", // black - no updates from >24 h

  //
  CANDIDATE = "candidate",
  SUSPENDED = "suspended",
}
