import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    otp: {
      type: Number,
      required: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
