import mongoose from "mongoose";

export const checkMongoIdValidity = (req, res, next) => {
  // check for mongo id validity
  const isValidMongoId = mongoose.Types.ObjectId.isValid(req.params.id);

  // if not valid mongo id
  if (!isValidMongoId) {
    return res.status(400).send({ message: "Invalid mongo id." });
  }

  next();
};
