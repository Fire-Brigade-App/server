import express from "express";
import * as eremizaService from "../services/eremiza.service";

const router = express.Router();

router.get("/:brigadeId", async (req, res, next) => {
  try {
    console.log(`/eremiza/${req.params.brigadeId}`);
    res.json(await eremizaService.fetch(req.params.brigadeId));
  } catch (err) {
    console.error(`Error while adding alert`, err);
    next(err);
  }
});

router.post("/:brigadeId", async (req, res, next) => {
  try {
    console.log(`/eremiza/${req.params.brigadeId} post`);
    res.json(await eremizaService.fetch(req.params.brigadeId, req.body));
  } catch (err) {
    console.error(`Error while adding alert`, err);
    next(err);
  }
});

export default router;
