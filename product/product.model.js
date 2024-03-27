import mongoose from "mongoose";
import { productCategories } from "../constants/general.constant.js";

// set rule
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      max: 30,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      max: 30,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
      enum: productCategories,
    },
    image: {
      type: String,
      required: false,
      default: null,
      nullable: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);
// create table

const Product = mongoose.model("Product", productSchema);

export default Product;
