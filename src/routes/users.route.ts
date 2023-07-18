import express from "express";
import * as userService from "../services/user.service";

const router = express.Router();

router.put("/:userUid", async (req, res, next) => {
  try {
    console.log(`/user/${req.params.userUid}`);
    res.json(await userService.update(req.params.userUid, req.body));
  } catch (err) {
    console.error(`Error while updating usr data`, err);
    next(err);
  }
});

export default router;
