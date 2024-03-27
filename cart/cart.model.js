import mongoose from "mongoose";
// set rule

// v1 model
// const itemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "products",
//   },
//   orderedQuantity: {
//     type: Number,
//     required: true,
//     min: 1,
//   },
// });

// const cartSchema = new mongoose.Schema({
//   buyerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "users",
//   },

//   items: {
//     type: [itemSchema],
//     required: false,
//     default: [],
//   },
// });

const cartSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "products",
  },
  orderedQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

// create table
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
