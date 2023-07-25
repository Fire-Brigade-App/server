import express from "express";
import * as alertsService from "../services/alerts.service";

const router = express.Router();

router.post("/:brigadeId", async (req, res, next) => {
  try {
    console.log(`/alerts/${req.params.brigadeId}`);
    res.json(await alertsService.add(req.params.brigadeId, req.body));
  } catch (err) {
    console.error(`Error while adding alert`, err);
    next(err);
  }
});

export default router;
