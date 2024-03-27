import jwt from "jsonwebtoken";
import { User } from "../user/user.model.js";

// user role
export const isUser = async (req, res, next) => {
  //  extract token from req.headers

  //   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.7KDnVjxuXNRTVBo'
  const authorization = req.headers.authorization;

  const splittedToken = authorization?.split(" ");

  const token = splittedToken?.length === 2 ? splittedToken[1] : null;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  let payload;

  try {
    payload = jwt.verify(token, "mysecretkey");
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  const user = await User.findOne({ email: payload.email });

  if (!user) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  req.loggedInUser = user;

  next();
};

// seller role
export const isSeller = async (req, res, next) => {
  // extract token from req.headers

  const authorization = req.headers.authorization;
  const splittedToken = authorization?.split(" ");
  const token = splittedToken?.length === 2 ? splittedToken[1] : null;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  let payload;

  try {
    payload = jwt.verify(token, "mysecretkey");
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  //   find user
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  if (user.role !== "seller") {
    return res.status(401).send({ message: "Unauthorized." });
  }

  req.loggedInUser = user;
  req.loggedInUserId = user._id;

  next();
};

// buyer role
export const isBuyer = async (req, res, next) => {
  // extract token from req.headers

  const authorization = req.headers.authorization;
  const splittedToken = authorization?.split(" ");
  const token = splittedToken?.length === 2 ? splittedToken[1] : null;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  let payload;

  try {
    payload = jwt.verify(token, "mysecretkey");
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  //   find user
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  if (user.role !== "buyer") {
    return res.status(401).send({ message: "Unauthorized." });
  }

  req.loggedInUser = user;
  req.loggedInUserId = user._id;

  next();
};
