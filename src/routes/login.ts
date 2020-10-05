import express from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../utils/config";
import { parseUserCredentials } from "../utils/validation";
import { UserForToken } from "../types";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const { password, username } = parseUserCredentials(req.body);

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        err: "Invalid credentials.",
      });
    } else {
      const passwordCorrect: boolean = await bcrypt.compare(
        password,
        user.get("password", null, { getters: false })
      );

      if (!passwordCorrect) {
        return res.status(401).json({
          err: "Invalid credentials.",
        });
      }

      const userForToken: UserForToken = {
        username,
        id: user.id,
      };

      const token: string = jwt.sign(userForToken, config!.SECRET);

      return res.status(200).send({ token, ...userForToken });
    }
  } catch (error) {
    console.log(error);
    next(error);
    return;
  }
});

export default router;
