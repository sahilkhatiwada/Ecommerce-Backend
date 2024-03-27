import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  quantity: {
    type: Number,
    min: 1,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },

  productList: {
    type: [orderProductSchema],
    default: [],
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    required: false,
    enum: [
      "Initiated",
      "Completed",
      "Pending",
      "Refunded",
      "Expired",
      "User canceled",
      "Partially refunded",
    ],
  },

  pidx: {
    type: String,
    required: true,
    trim: true,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
