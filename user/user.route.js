import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { validateReqBody } from "../middleware/validation.middleware.js";
import { User } from "./user.model.js";
import { loginUserSchema, userSchema } from "./user.validation.js";

const router = express.Router();

// register user
router.post("/user/register", validateReqBody(userSchema), async (req, res) => {
  const newUser = req.body;

  // check if user with provided email already exists
  const user = await User.findOne({ email: newUser.email });
  // if user, throw error

  if (user) {
    return res
      .status(409)
      .send({ message: "User with this email already exists." });
  }
  // hash password
  const hashedPassword = await bcrypt.hash(newUser.password, 10);

  newUser.password = hashedPassword;

  // create user
  await User.create(newUser);

  // send response
  return res.status(201).send({ message: "User is registered successfully." });
});

// login user
router.post(
  "/user/login",
  validateReqBody(loginUserSchema),
  async (req, res) => {
    const loginCredentials = req.body;

    //   check if user with provided email exists
    const user = await User.findOne({ email: loginCredentials.email });

    // if not user, throw error
    if (!user) {
      return res.status(404).send({ message: "Invalid credentials." });
    }

    // compare password
    const isPasswordMatch = await bcrypt.compare(
      loginCredentials.password,
      user.password
    );

    // if password not match, throw error
    if (!isPasswordMatch) {
      return res.status(404).send({ message: "Invalid credentials." });
    }

    // generate token and send response
    const token = jwt.sign({ email: user.email }, "mysecretkey", {
      expiresIn: "24h",
    });

    // hide hashedPassword
    user.password = undefined;

    return res
      .status(200)
      .send({ message: "success", user: user, token: token });
  }
);
export default router;
