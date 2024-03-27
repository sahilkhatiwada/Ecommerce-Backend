import mongoose from "mongoose";
import { GenderOptions, UserRoles } from "../constants/general.constant.js";

// set rule/schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 55,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 55,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 55,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      required: false,
      enum: GenderOptions,
      default: null,
    },
    dob: {
      type: Date,
      required: false,
      default: null,
    },
    role: {
      type: String,
      required: true,
      enum: UserRoles,
    },
  },
  {
    timestamps: true,
  }
);

// create table
export const User = mongoose.model("User", userSchema);
