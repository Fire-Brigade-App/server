import express from "express";
import * as locationService from "../services/location.service";

const router = express.Router();

router.put("/:userUid", async (req, res, next) => {
  try {
    console.log(`/location/${req.params.userUid}`);
    res.json(await locationService.update(req.params.userUid, req.body));
  } catch (err) {
    console.error(`Error while updating user location`, err);
    next(err);
  }
});

export default router;
