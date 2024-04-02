import express from "express";
import { generateOtp } from "./generate.random.number.js";
import { User } from "./user.model.js";
import {
  passwordValidationSchema,
  userEmailValidationSchema,
  verifyOtpValidationSchema,
} from "./user.validation.js";

import Otp from "../otp/otp.model.js";
import bcrypt from "bcrypt";
import { sendEmailOTP } from "./emaill.service.js";

const router = express.Router();

// send email otp
router.post(
  "/otp/send-email",
  async (req, res, next) => {
    // extract newValues from req.body
    const newValues = req.body;

    // validate newValues using Yup schema
    try {
      const validatedData = await userEmailValidationSchema.validate(newValues);

      req.body = validatedData;
    } catch (error) {
      // if validation fails, throw error
      return res.status(400).send({ message: error.message });
    }

    // call next function

    next();
  },
  async (req, res) => {
    // extract email from req.body
    const { email } = req.body;

    // find user using the email
    const user = await User.findOne({ email });

    // if not user,throw error

    if (!user) {
      return res.status(404).send({ message: "Email does not exist." });
    }

    // generate and send otp
    const otp = generateOtp();

    // send email
    await sendEmailOTP(user.firstName, otp, email);

    await Otp.deleteMany({ email });

    await Otp.create({ otp, email });

    // send res
    return res.status(200).send({ message: "Otp is sent successfully." });
  }
);

// verify otp
router.post(
  "/otp/verify",
  async (req, res, next) => {
    // extract newValues from req.body
    const newValues = req.body;

    // validate newValues using Yup schema
    try {
      const validatedData = await verifyOtpValidationSchema.validate(newValues);

      req.body = validatedData;
    } catch (error) {
      // if validation fails, throw error
      return res.status(400).send({ message: error.message });
    }

    // call next function

    next();
  },
  async (req, res) => {
    // extract verification data from req.body
    const verificationData = req.body;

    // find otp document using email
    const otpDoc = await Otp.findOne({ email: verificationData.email });

    // if not otp document, throw error
    if (!otpDoc) {
      return res.status(404).send({ message: "Something went wrong." });
    }

    // check if otp matches
    const isOtpMatch = verificationData.otp === otpDoc.otp;

    // if otp does not match, throw error
    if (!isOtpMatch) {
      return res.status(404).send({ message: "Invalid otp code." });
    }

    // set isVerified to true
    await Otp.updateOne(
      { email: verificationData.email },
      {
        $set: {
          isVerified: true,
        },
      }
    );

    // send res

    return res.status(200).send({ message: "Otp is verified successfully." });
  }
);

// change password
router.put(
  "/otp/change-password",
  async (req, res, next) => {
    // extract newValues from req.body
    const newValues = req.body;

    // validate newValues using Yup schema
    try {
      const validatedData = await passwordValidationSchema.validate(newValues);

      req.body = validatedData;
    } catch (error) {
      // if validation fails, throw error
      return res.status(400).send({ message: error.message });
    }

    // call next function

    next();
  },
  async (req, res) => {
    // extract new password from req.body
    const { email, newPassword } = req.body;

    // find otp document using this email
    const otpDoc = await Otp.findOne({ email });

    // if not otpDoc, throw error
    if (!otpDoc) {
      return res.status(404).send({ message: "Something went wrong." });
    }

    // if otp code is not verified, throw error
    if (!otpDoc.isVerified) {
      return res
        .status(404)
        .send({ message: "Otp is not verified.Try again." });
    }

    // let user change password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    // remove otp doc for this email
    await Otp.deleteMany({ email });

    return res
      .status(200)
      .send({ message: "Password is changed successfully." });
  }
);
export default router;
