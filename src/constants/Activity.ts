export enum Activity {
  ONLINE = "online", // color depends on Status - updated in the last 1h
  BUSY = "busy", // red
  OFFLINE = "offline", // grey - no updates from 1<24 h
  INACTIVE = "inactive", // black - no updates from >24 h
}
