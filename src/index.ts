import "dotenv/config";
import "./config/firebase";
import express from "express";
import usersRouter from "./routes/users.route";
import locationRouter from "./routes/location.route";
import { updateActivityInIntervals } from "./services/activity.service";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log("Everything works fine");
  res.json({ message: "ok" });
});

app.use("/users", usersRouter);
app.use("/location", locationRouter);

try {
  app.listen(port, () =>
    console.log(`Fire Brigade server listening on port ${port}!`)
  );
} catch (error) {
  console.error(`Error occured: ${error}`);
}

updateActivityInIntervals(Number(process.env.UPDATE_ACTIVITY_INTERVAL) || 15);
